import PocketBase from 'pocketbase';
import { invoke } from '@tauri-apps/api/tauri';
import { AsyncIO } from '@shared/io';
import { fromNullable } from '@shared/option';
import { Result, failure, fromThrowable, success } from '@shared/result';

// Get PocketBase URL from multiple sources (priority order)
const getPocketBaseUrl = (): string => {
  // 1. Runtime configuration (user settings in localStorage)
  if (typeof window !== 'undefined') {
    const stored = fromNullable(localStorage.getItem('pb_url'));
    if (stored._tag === 'some') return stored.value;

    // 2. URL parameter (e.g., ?pb=https://church.pockethost.io)
    const params = new URLSearchParams(window.location.search);
    const urlParam = fromNullable(params.get('pb'));
    if (urlParam._tag === 'some') {
      localStorage.setItem('pb_url', urlParam.value);
      return urlParam.value;
    }
  }

  // 3. Environment variable (build-time configuration)
  const envUrl = fromNullable(import.meta.env.VITE_PB_URL);
  if (envUrl._tag === 'some') {
    return envUrl.value;
  }

  // 4. Default (local development)
  return 'http://127.0.0.1:8090';
};

// Validate PocketBase URL
const validatePocketBaseUrl = (url: string): Result<boolean, Error> => {
  return fromThrowable(
    () => {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    },
    (e: unknown) => new Error(`Invalid URL format: ${e}`)
  );
};

// Initialize PocketBase client
const initialUrl = getPocketBaseUrl();
const validationResult = validatePocketBaseUrl(initialUrl);

if (validationResult._tag === 'failure' || validationResult.value === false) {
  console.error('Invalid PocketBase URL:', initialUrl);
}

// Configure PocketBase for optimal real-time performance
export const pb = new PocketBase(initialUrl);

// Enable auto-cancellation of duplicate requests (reduces load)
pb.autoCancellation(true);

// Configure WebSocket reconnection (critical for real-time)
if (typeof window !== 'undefined') {
  // Auto-reconnect on connection loss
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;

  window.addEventListener('online', () => {
    console.log('[PocketBase] Network online - attempting reconnection...');
    reconnectAttempts = 0;
    // Note: PocketBase handles reconnection automatically
    // Just log the event for debugging
  });

  window.addEventListener('offline', () => {
    console.log('[PocketBase] Network offline - WebSocket will auto-reconnect when online');
  });

  // PocketBase SDK handles reconnection automatically
  // We just need to monitor connection state for UI feedback
  setInterval(() => {
    // Health check could be added here if needed
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.warn('[PocketBase] Max reconnection attempts reached');
    }
  }, 30000);
}

export interface CommandRecord {
  id: string;
  action: 'START' | 'STOP' | 'RECORD_START' | 'RECORD_STOP' | 'SET_STREAM_SETTINGS' | 'UPLOAD_TO_DRIVE';
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

export interface StreamMetadata {
  outputActive?: boolean;
  outputDuration?: number;
  outputBytes?: number;
  quality?: StreamQualityMetrics;
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

export function sendCommand(action: CommandRecord['action'], payload?: Record<string, unknown>): AsyncIO<CommandRecord | void> {
  return new AsyncIO(async () => {
    const userOption = fromNullable(pb.authStore.model);
    if (userOption._tag === 'none') {
      throw new Error('Not authenticated');
    }
    const user = userOption.value;

    const maybePayload = fromNullable(payload);

    // Skip Rust optimization if payload is present (until Rust side is updated)
    if (maybePayload._tag === 'none') {
      // Try Rust backend first
      try {
        // Note: Rust 'send_command' returns the correlation_id
        await invoke('send_command', {
          pocketbaseUrl: pb.baseUrl,
          action,
          authToken: pb.authStore.token,
          userId: user.id,
        });
        return;
      } catch (rustError) {
        console.warn('Rust invoke failed, falling back to JS SDK:', rustError);
      }
    }

    // Fallback to JS SDK (or primary path if payload exists)
    const correlationId = crypto.randomUUID();
    return await pb.collection('commands').create<CommandRecord>({
      action,
      executed: false,
      correlation_id: correlationId,
      created_by: user.id,
      payload: maybePayload._tag === 'some' ? maybePayload.value : undefined
    });
  });
}

export function getStreamStatus(streamId: string): AsyncIO<StreamRecord> {
  return new AsyncIO(async () => {
    // Try Rust backend first
    try {
      const status = await invoke<StreamRecord>('get_stream_status', {
        pocketbaseUrl: pb.baseUrl,
        streamId,
      });
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

// Allow runtime URL changes (for multi-backend support)
export function setPocketBaseUrl(url: string): Result<void, Error> {
  const validationResult = validatePocketBaseUrl(url);

  if (validationResult._tag === 'failure' || validationResult.value === false) {
    return failure(new Error('Invalid PocketBase URL'));
  }

  localStorage.setItem('pb_url', url);
  pb.baseUrl = url;
  // Clear auth when switching backends
  pb.authStore.clear();

  return success(undefined);
}

// Get current PocketBase URL
export function getCurrentPocketBaseUrl(): string {
  return pb.baseUrl;
}

// Test connection to PocketBase
export function testConnection(url?: string): AsyncIO<boolean> {
  return new AsyncIO(async () => {
    const parsedUrl = fromNullable(url);
    const testUrl = parsedUrl._tag === 'some' ? parsedUrl.value : pb.baseUrl;
    try {
      const response = await fetch(`${testUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  });
}
