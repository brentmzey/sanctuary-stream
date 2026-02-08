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
