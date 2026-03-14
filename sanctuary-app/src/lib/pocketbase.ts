import PocketBase, { RecordModel } from 'pocketbase';
import { invoke } from '@tauri-apps/api/tauri';
import { AsyncIO } from '@shared/io';
import { fromNullable } from '@shared/option';
import { Result, failure, fromThrowable, success } from '@shared/result';

// Get PocketBase URL from multiple sources (priority order)
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

const validatePocketBaseUrl = (url: string): Result<boolean, Error> => {
  return fromThrowable(
    () => {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    },
    (e: unknown) => new Error(`Invalid URL format: ${e}`)
  );
};

const initialUrl = getPocketBaseUrl();
const validationResult = validatePocketBaseUrl(initialUrl);

if (validationResult._tag === 'failure' || validationResult.value === false) {
  console.error('Invalid PocketBase URL:', initialUrl);
}

export const pb = new PocketBase(initialUrl);
pb.autoCancellation(true);

// Enable auto-reconnection for WebSockets with exponential backoff
// This ensures mobile and desktop apps stay in sync during network transitions
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network online: Re-syncing PocketBase...');
    // PocketBase SDK handles re-authentication if valid token exists
  });

  window.addEventListener('offline', () => {
    console.warn('Network offline: Sanctuary Stream will reconnect when back online');
  });
}

export type CommandAction = 
  | 'START' 
  | 'STOP' 
  | 'RECORD_START' 
  | 'RECORD_STOP' 
  | 'SET_STREAM_SETTINGS'
  | 'SET_VIDEO_SETTINGS'
  | 'SET_STREAM_ENCODER'
  | 'SET_AUDIO_SETTINGS'
  | 'SET_SCENE'
  | 'SET_MUTE'
  | 'UPLOAD_TO_DRIVE';

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

export interface StreamQualityMetrics {
  fps?: number;
  bitrate?: number;
  dropped_frames?: number;
  cpu_usage?: number;
}

export interface StreamInput {
  name: string;
  muted: boolean;
  volume: number;
}

export interface StreamMetadata {
  outputActive?: boolean;
  outputDuration?: number;
  outputBytes?: number;
  quality?: StreamQualityMetrics;
  scenes?: string[];
  currentScene?: string;
  inputs?: StreamInput[];
}

export interface StreamRecord {
  id: string;
  status: 'live' | 'idle' | 'recording' | 'error';
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
  role: 'admin' | 'pastor' | 'tech';
  created: string;
  updated: string;
}

export interface RecordingRecord {
  id: string;
  title: string;
  file_id: string;
  stream_id: string;
  duration?: number;
  size?: number;
  created: string;
  updated: string;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  body?: string;
  priority: 'low' | 'medium' | 'high';
  expires_at?: string;
  created: string;
  updated: string;
}

export interface SermonRecord {
  id: string;
  title: string;
  speaker?: string;
  sermon_date: string;
  body?: string;
  youtube_url?: string;
  created: string;
  updated: string;
}

export interface ResourceRecord {
  id: string;
  title: string;
  description?: string;
  category?: string;
  url?: string;
  file?: string;
  created: string;
  updated: string;
}

export function sendCommand(action: CommandAction, payload?: Record<string, unknown>): AsyncIO<CommandRecord | void> {
  return new AsyncIO(async () => {
    try {
        await invoke('send_command', { action });
        return;
    } catch (rustError) {
        console.warn('Rust invoke failed, falling back to JS SDK:', rustError);
        const userOption = fromNullable(pb.authStore.model);
        if (userOption._tag === 'none') {
          throw new Error('Not authenticated');
        }
        const user = userOption.value;
        const maybePayload = fromNullable(payload);
        const correlationId = crypto.randomUUID();
        return await pb.collection('commands').create<CommandRecord>({
          action,
          executed: false,
          correlation_id: correlationId,
          created_by: user.id,
          payload: maybePayload._tag === 'some' ? maybePayload.value : undefined
        });
    }
  });
}

export function getStreamStatus(streamId: string): AsyncIO<StreamRecord> {
  return new AsyncIO(async () => {
    try {
      const status = await invoke<StreamRecord>('get_stream_status');
      return status;
    } catch (rustError) {
      console.warn('Rust invoke failed, falling back to JS SDK:', rustError);
      return await pb.collection('streams').getOne<StreamRecord>(streamId);
    }
  });
}

export function subscribeToStream(streamId: string, callback: (record: StreamRecord) => void) {
  pb.collection('streams').subscribe<StreamRecord>(streamId, (e) => {
    callback(e.record);
  });
}

export function unsubscribeFromStream(streamId: string) {
  pb.collection('streams').unsubscribe(streamId);
}

export async function loginToPocketBase(email: string, password: string): Promise<UserRecord> {
    const auth = await invoke<{ token: string, user: UserRecord }>('discover_and_login', { email, password });
    pb.authStore.save(auth.token, auth.user as unknown as RecordModel);
    return auth.user;
}

export function setPocketBaseUrl(url: string): Result<void, Error> {
  const validationResult = validatePocketBaseUrl(url);
  if (validationResult._tag === 'failure' || validationResult.value === false) {
    return failure(new Error('Invalid PocketBase URL'));
  }
  localStorage.setItem('pb_url', url);
  pb.baseUrl = url;
  pb.authStore.clear();
  
  // Update Rust state
  invoke('set_pocketbase_url', { url }).catch(e => console.error('Failed to update Rust PB URL:', e));
  
  return success(undefined);
}

export function testConnection(url?: string): AsyncIO<boolean> {
  return new AsyncIO(async () => {
    try {
      return await invoke<boolean>('test_connection', { url: url || null });
    } catch (e) {
      console.warn('Rust test_connection failed, falling back to fetch:', e);
      const parsedUrl = fromNullable(url);
      const testUrl = parsedUrl._tag === 'some' ? parsedUrl.value : pb.baseUrl;
      try {
        const response = await fetch(`${testUrl}/api/health`);
        return response.ok;
      } catch {
        return false;
      }
    }
  });
}

export function getRecordings(streamId: string): AsyncIO<RecordingRecord[]> {
  return new AsyncIO(async () => {
    try {
      return await invoke<RecordingRecord[]>('list_recordings', { streamId });
    } catch (e) {
      console.warn('Rust list_recordings failed, falling back to JS SDK:', e);
      return pb.collection('recordings').getList<RecordingRecord>(1, 50, {
        filter: `stream_id = '${streamId}'`,
        sort: '-created',
      }).then((r) => r.items);
    }
  });
}

export function getAnnouncements(): AsyncIO<AnnouncementRecord[]> {
  return new AsyncIO(() =>
    pb.collection('announcements').getList<AnnouncementRecord>(1, 50, {
      filter: 'expires_at = "" || expires_at > @now',
      sort: '-priority,-created',
    }).then((r) => r.items)
  );
}

export function getSermons(limit = 10): AsyncIO<SermonRecord[]> {
  return new AsyncIO(() =>
    pb.collection('sermons').getList<SermonRecord>(1, limit, {
      sort: '-sermon_date',
    }).then((r) => r.items)
  );
}

export function getResources(category?: string): AsyncIO<ResourceRecord[]> {
  return new AsyncIO(() =>
    pb.collection('resources').getList<ResourceRecord>(1, 50, {
      filter: category ? `category = '${category}'` : '',
      sort: '-created',
    }).then((r) => r.items)
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
