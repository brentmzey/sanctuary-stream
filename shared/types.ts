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
export type CommandAction = 
  | 'START' 
  | 'STOP' 
  | 'RECORD_START' 
  | 'RECORD_STOP'
  | 'SET_STREAM_SETTINGS'
  | 'SET_VIDEO_SETTINGS'
  | 'SET_STREAM_ENCODER'
  | 'SET_AUDIO_SETTINGS';

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

// ============================================================================
// CMS Collections
// ============================================================================

/**
 * A sermon record — the primary content type for Sunday messages and teachings.
 * `published: false` means it's a draft; only admins/pastors can see drafts via direct ID lookup.
 */
export interface Sermon {
  id: string;
  title: string;
  body: string | null;
  sermon_date: string;       // ISO date string, e.g. "2026-02-22 00:00:00.000Z"
  youtube_url: string | null;
  tags: string[] | null;     // JSON array of topic tags
  published: boolean;
  thumbnail: string | null;  // PocketBase file token — use pb.files.getUrl() to resolve
  speaker: string | null;
  created: string;
  updated: string;
}

/**
 * An announcement — time-boxed church-wide notice.
 * `expires_at: null` means it never auto-hides.
 */
export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  published_at: string | null;  // When to start showing it
  expires_at: string | null;    // When to stop showing it
  priority: 'low' | 'normal' | 'high';
  published: boolean;
  created: string;
  updated: string;
}

/**
 * A free resource — PDF, guide, link, or any shareable content.
 * Either `file` or `url` (or both) should be populated at the app layer.
 */
export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file: string | null;   // PocketBase file token
  url: string | null;    // External link
  category: 'essay' | 'article' | 'free';
  published: boolean;
  created: string;
  updated: string;
}
