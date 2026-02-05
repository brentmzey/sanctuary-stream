import PocketBase from 'pocketbase';

// Get PocketBase URL from multiple sources (priority order)
const getPocketBaseUrl = (): string => {
  // 1. Runtime configuration (user settings in localStorage)
  const stored = localStorage.getItem('pb_url');
  if (stored) return stored;

  // 2. URL parameter (e.g., ?pb=https://church.pockethost.io)
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get('pb');
  if (urlParam) {
    localStorage.setItem('pb_url', urlParam);
    return urlParam;
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

export const pb = new PocketBase(initialUrl);

export interface CommandRecord {
  id: string;
  action: 'START' | 'STOP' | 'RECORD_START' | 'RECORD_STOP';
  executed: boolean;
  correlation_id: string;
  payload?: Record<string, unknown>;
  created_by: string;
  error_message?: string;
  created: string;
  updated: string;
}

export interface StreamRecord {
  id: string;
  status: 'live' | 'idle' | 'recording' | 'error';
  heartbeat: string;
  youtube_url?: string;
  metadata?: Record<string, unknown>;
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

export async function sendCommand(action: CommandRecord['action']) {
  const user = pb.authStore.model;
  if (!user) throw new Error('Not authenticated');

  const correlationId = crypto.randomUUID();
  
  return await pb.collection('commands').create<CommandRecord>({
    action,
    executed: false,
    correlation_id: correlationId,
    created_by: user.id
  });
}

export async function getStreamStatus(streamId: string) {
  return await pb.collection('streams').getOne<StreamRecord>(streamId);
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
