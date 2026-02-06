import PocketBase from 'pocketbase';

// Platform detection
const isWeb = typeof window !== 'undefined' && !('__TAURI__' in window);
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== 'undefined' ? navigator.userAgent : ''
);

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
    console.log('[PocketBase] Network online - reconnecting...');
    reconnectAttempts = 0;
    pb.realtime.reconnect();
  });

  window.addEventListener('offline', () => {
    console.log('[PocketBase] Network offline - pausing subscriptions');
  });

  // Monitor connection state
  const originalSubscribe = pb.collection.bind(pb);
  pb.collection = function(collectionName: string) {
    const collection = originalSubscribe(collectionName);
    const originalSubscribeFn = collection.subscribe.bind(collection);
    
    collection.subscribe = function(...args: unknown[]) {
      const result = originalSubscribeFn(...args);
      
      // Handle reconnection with exponential backoff
      result.catch((err: Error) => {
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`[PocketBase] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          reconnectAttempts++;
          
          setTimeout(() => {
            originalSubscribeFn(...args);
          }, delay);
        } else {
          console.error('[PocketBase] Max reconnection attempts reached:', err);
        }
      });
      
      return result;
    };
    
    return collection;
  };
}

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
