import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090');

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
