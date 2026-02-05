/**
 * Shared TypeScript types for Sanctuary Stream
 * Used across frontend, bridge, and tests
 */

// ============================================================================
// PocketBase Collections
// ============================================================================

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'pastor' | 'tech';

/**
 * User record from PocketBase auth collection
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created: string;
  updated: string;
  verified: boolean;
}

/**
 * Stream command actions
 */
export type CommandAction = 'START' | 'STOP' | 'RECORD_START' | 'RECORD_STOP';

/**
 * Command record for controlling OBS
 */
export interface Command {
  id: string;
  action: CommandAction;
  executed: boolean;
  correlation_id: string;
  payload: Record<string, unknown> | null;
  created_by: string;
  error_message: string | null;
  created: string;
  updated: string;
}

/**
 * Stream status values
 */
export type StreamStatus = 'idle' | 'live' | 'recording' | 'error';

/**
 * Stream record for monitoring OBS state
 */
export interface Stream {
  id: string;
  status: StreamStatus;
  heartbeat: string;
  youtube_url: string | null;
  scene_name: string | null;
  bitrate: number | null;
  fps: number | null;
  metadata: Record<string, unknown> | null;
  created: string;
  updated: string;
}
