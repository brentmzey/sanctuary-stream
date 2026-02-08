import PocketBase from 'pocketbase';
import { invoke } from '@tauri-apps/api/tauri';

// Get PocketBase URL from multiple sources (priority order)
const getPocketBaseUrl = (): string => {
  // 1. Runtime configuration (user settings in localStorage)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pb_url');
    if (stored) return stored;

    // 2. URL parameter (e.g., ?pb=https://church.pockethost.io)
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('pb');
    if (urlParam) {
      localStorage.setItem('pb_url', urlParam);
      return urlParam;
    }
  }

  // 3. Environment variable (build-time configuration)
  if (import.meta.env.VITE_PB_URL) {
    return import.meta.env.VITE_PB_URL;
  }

  // 4. Default (local development)
  return 'http://127.0.0.1:8090';
};

// Validate PocketBase URL
const validatePocketBaseUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Initialize PocketBase client
const initialUrl = getPocketBaseUrl();
if (!validatePocketBaseUrl(initialUrl)) {
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

export async function sendCommand(action: CommandRecord['action'], payload?: Record<string, unknown>) {
  const user = pb.authStore.model;
  if (!user) throw new Error('Not authenticated');

  // Skip Rust optimization if payload is present (until Rust side is updated)
  if (!payload) {
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
    payload: payload
  });
}

export async function getStreamStatus(streamId: string) {
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
export function setPocketBaseUrl(url: string): void {
  if (!validatePocketBaseUrl(url)) {
    throw new Error('Invalid PocketBase URL');
  }
  localStorage.setItem('pb_url', url);
  pb.baseUrl = url;
  // Clear auth when switching backends
  pb.authStore.clear();
}

// Get current PocketBase URL
export function getCurrentPocketBaseUrl(): string {
  return pb.baseUrl;
}

// Test connection to PocketBase
export async function testConnection(url?: string): Promise<boolean> {
  const testUrl = url || pb.baseUrl;
  try {
    const response = await fetch(`${testUrl}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
