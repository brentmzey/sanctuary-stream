import PocketBase from 'pocketbase';
import { invoke } from '@tauri-apps/api/tauri';
import { AsyncIO } from '@shared/io';
import { fromNullable, isSome, some } from '@shared/option';
import { AsyncResult, fromPromise } from '@shared/result';
import { CompressionService } from '@shared/compression';
import { UserContext, createPublicContext, createAdminContext, createUserContext } from '@shared/context';
import { 
  SermonRow, SermonBuilder, 
  AnnouncementRow, AnnouncementBuilder, 
  ResourceRow, ResourceBuilder, BaseRow 
} from '@shared/models';
import { 
    PBCollection, 
    Field, 
    StreamStatus, 
    UserRole, 
    CommandAction 
} from '@shared/schema';
import { RecordModel } from 'pocketbase';

export type SermonRecord = SermonRow;
export type AnnouncementRecord = AnnouncementRow;
export type ResourceRecord = ResourceRow;
export interface RecordingRecord extends BaseRow {
  title: string;
  size?: number;
  file_id?: string;
  stream_id?: string;
}
export interface StreamInput { name: string; muted: boolean; volume: number }

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

const getPocketBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const stored = fromNullable(localStorage.getItem('pb_url'));
    if (stored._tag === 'some') return stored.value;

    const params = new URLSearchParams(window.location.search);
    const urlParam = fromNullable(params.get('pb'));
    if (urlParam._tag === 'some') {
      localStorage.setItem('pb_url', urlParam.value);
      return urlParam.value;
    }
  }

  const envUrl = fromNullable(import.meta.env.VITE_PB_URL);
  if (envUrl._tag === 'some') {
    return envUrl.value;
  }

  return 'http://127.0.0.1:8090';
};

const initialUrl = getPocketBaseUrl();
export const pb = new PocketBase(initialUrl);
pb.autoCancellation(true);

export function setPocketBaseUrl(url: string): void {
  pb.baseUrl = url;
  if (typeof window !== 'undefined') {
    localStorage.setItem('pb_url', url);
  }
}

export function testConnection(url?: string): AsyncIO<boolean> {
  return new AsyncIO(async () => {
    try {
      // 1. Try Rust bridge for cross-platform efficiency
      return await invoke<boolean>('test_connection', { url: url || null });
    } catch {
      // 2. Fallback to JS SDK if bridge unavailable (e.g. pure web)
      try {
        if (url) pb.baseUrl = url;
        await pb.health.check();
        return true;
      } catch {
        return false;
      }
    }
  });
}

// ============================================================================
// CONTEXT MANAGEMENT
// ============================================================================

export function getCurrentContext(): UserContext {
  const model = pb.authStore.model;
  if (!model) return createPublicContext();
  
  const token = pb.authStore.token;
  if (model.role === UserRole.Admin) return createAdminContext(model.id, token);
  return createUserContext(model.id, model.role as UserRole.Pastor | UserRole.Tech, token);
}

// ============================================================================
// CMS SERVICES (COMPRESSED & MONADIC)
// ============================================================================

export function getAnnouncements(): AsyncIO<AnnouncementRow[]> {
  return new AsyncIO(async () => {
    const records = await pb.collection(PBCollection.Announcements).getList<AnnouncementRow>(1, 50, {
      filter: `${Field.Announcement.ExpiresAt} = "" || ${Field.Announcement.ExpiresAt} > @now`,
      sort: `-${Field.Announcement.Priority},-${Field.Base.Created}`,
    });

    // Decompress bodies on the fly
    return await Promise.all(records.items.map(async (row: AnnouncementRow) => {
      const builder = AnnouncementBuilder.fromRow(row);
      const decompressed = await CompressionService.decompressFromBase64(some(row.bodyBrotliBase64));
      if (isSome(decompressed)) {
        builder.withBody(decompressed.value);
      }
      return builder.toRow();
    }));
  });
}

/** New monadic version for enterprise use */
export function getAnnouncementsResult(): AsyncResult<AnnouncementRow[], Error> {
  return fromPromise(() => getAnnouncements().unsafeRunAsync(), (e) => new Error(`Failed: ${e}`));
}

export function getSermons(limit = 10): AsyncIO<SermonRow[]> {
  return new AsyncIO(async () => {
    const records = await pb.collection(PBCollection.Sermons).getList<SermonRow>(1, limit, {
      sort: `-${Field.Sermon.SermonDate}`,
    });

    return await Promise.all(records.items.map(async (row: SermonRow) => {
      const builder = SermonBuilder.fromRow(row);
      const decompressed = await CompressionService.decompressFromBase64(some(row.bodyBrotliBase64));
      if (isSome(decompressed)) {
        builder.withBody(decompressed.value);
      }
      return builder.toRow();
    }));
  });
}

/** New monadic version */
export function getSermonsResult(limit = 10): AsyncResult<SermonRow[], Error> {
  return fromPromise(() => getSermons(limit).unsafeRunAsync(), (e) => new Error(`Failed: ${e}`));
}

export function getResources(category?: string): AsyncIO<ResourceRow[]> {
  return new AsyncIO(async () => {
    const records = await pb.collection(PBCollection.Resources).getList<ResourceRow>(1, 50, {
      filter: category ? `${Field.Resource.Category} = '${category}'` : '',
      sort: `-${Field.Base.Created}`,
    });

    return await Promise.all(records.items.map(async (row: ResourceRow) => {
      const builder = ResourceBuilder.fromRow(row);
      const decompressed = await CompressionService.decompressFromBase64(some(row.descriptionBrotliBase64));
      if (isSome(decompressed)) {
        builder.withDescription(decompressed.value);
      }
      return builder.toRow();
    }));
  });
}

export function getRecordings(streamId?: string): AsyncIO<RecordingRecord[]> {
  return new AsyncIO(async () => {
    const records = await pb.collection(PBCollection.Sermons).getList<RecordingRecord>(1, 50, {
      filter: streamId ? `${Field.Sermon.StreamId} = "${streamId}"` : '',
      sort: `-${Field.Base.Created}`,
    });
    return records.items;
  });
}

// ============================================================================
// LEGACY & UI COMPATIBILITY SHIMS (IO-WRAPPED)
// ============================================================================

// ============================================================================
// LEGACY & UI COMPATIBILITY SHIMS (DEPRECATED)
// ============================================================================

/** @deprecated Use getAnnouncements() */
export function getAnnouncementsIO(): AsyncIO<AnnouncementRow[]> {
  return getAnnouncements();
}

/** @deprecated Use getSermons() */
export function getSermonsIO(limit = 10): AsyncIO<SermonRow[]> {
  return getSermons(limit);
}

// ============================================================================
// CORE SYSTEM SERVICES (COMMANDS & STREAMS)
// ============================================================================

export interface CommandRecord {
  id: string;
  action: CommandAction;
  executed: boolean;
  correlation_id: string;
  payload?: Record<string, unknown>;
  created_by: string;
  error_message?: string;
  created: string;
  updated: string;
}

export interface StreamMetadata {
  outputActive?: boolean;
  outputDuration?: number;
  outputBytes?: number;
  quality?: { 
    fps?: number; 
    bitrate?: number;
    dropped_frames?: number;
    cpu_usage?: number;
  };
  scenes?: string[];
  currentScene?: string;
  inputs?: StreamInput[];
}

export interface StreamRecord {
  id: string;
  status: StreamStatus;
  heartbeat: string;
  youtube_url?: string;
  metadata?: StreamMetadata;
  created: string;
  updated: string;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verified: boolean;
  created: string;
  updated: string;
}

export function sendCommand(action: CommandAction, payload?: Record<string, unknown>): AsyncIO<CommandRecord | void> {
  return new AsyncIO(async () => {
    try {
        // Local Tauri IPC path — now correctly forwards payload so
        // SET_SCENE, SET_MUTE, SET_VOLUME etc. carry their arguments.
        await invoke('send_command', { action, payload: payload ?? null });
        return;
    } catch (rustError) {
        console.warn('Rust invoke failed, falling back to JS SDK:', rustError);
        const user = pb.authStore.model;
        if (!user) throw new Error('Not authenticated');
        
        return await pb.collection(PBCollection.Commands).create<CommandRecord>({
          [Field.Command.Action]: action,
          [Field.Command.Executed]: false,
          [Field.Command.CorrelationId]: crypto.randomUUID(),
          [Field.Command.CreatedBy]: user.id,
          [Field.Command.Payload]: payload || undefined
        });
    }
  });
}

export function getStreamStatus(streamId: string): AsyncIO<StreamRecord> {
  return new AsyncIO(async () => {
    try {
      return await invoke<StreamRecord>('get_stream_status');
    } catch (rustError) {
      console.warn('Rust invoke failed, falling back to JS SDK:', rustError);
      return await pb.collection(PBCollection.Streams).getOne<StreamRecord>(streamId);
    }
  });
}

export function subscribeToStream(streamId: string, callback: (record: StreamRecord) => void) {
  pb.collection(PBCollection.Streams).subscribe<StreamRecord>(streamId, (e) => {
    callback(e.record);
  });
}

export function unsubscribeFromStream(streamId: string) {
  pb.collection(PBCollection.Streams).unsubscribe(streamId);
}

export async function loginToPocketBase(email: string, password: string): Promise<UserRecord> {
    const auth = await invoke<{ token: string, user: UserRecord }>('discover_and_login', { email, password });
    pb.authStore.save(auth.token, auth.user as unknown as RecordModel);
    return auth.user;
}

/** Monadic version of the login process for functional composition */
export function loginToPocketBaseResult(email: string, password: string): AsyncResult<UserRecord, Error> {
  return fromPromise(
    () => loginToPocketBase(email, password),
    (e) => new Error(`Authentication Protocol Failure: ${e instanceof Error ? e.message : String(e)}`)
  );
}

export async function getFileUrl(collectionId: string, recordId: string, fileName: string): Promise<string> {
  try {
    return await invoke<string>('get_file_url', { collection: collectionId, recordId, fileName });
  } catch (e) {
    return `${pb.baseUrl}/api/files/${collectionId}/${recordId}/${fileName}`;
  }
}

export function getCurrentPocketBaseUrl(): string {
  return pb.baseUrl;
}
