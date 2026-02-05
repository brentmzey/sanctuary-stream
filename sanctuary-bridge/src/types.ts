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
  metadata?: {
    outputActive?: boolean;
    outputDuration?: number;
    outputBytes?: number;
    [key: string]: unknown;
  };
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
