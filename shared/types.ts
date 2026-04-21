/**
 * Shared TypeScript types for Sanctuary Stream
 * Used across frontend, bridge, and tests
 */

// ============================================================================
// PocketBase Collections
// ============================================================================

import { UserRole, CommandAction, StreamStatus, Priority } from './schema';

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
 * Metadata for OBS stream state
 */
export interface StreamMetadata {
  scenes?: string[];
  currentScene?: string;
  inputs?: StreamInput[];
  outputActive?: boolean;
  outputDuration?: number;
  outputBytes?: number;
  [key: string]: unknown;
}

/**
 * OBS Audio Input state
 */
export interface StreamInput {
  name: string;
  muted: boolean;
  volume: number;
}

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
  metadata: StreamMetadata | null;
  created: string;
  updated: string;
}

// ============================================================================
// CMS Collections
// ============================================================================

/**
 * A sermon record — the primary content type for Sunday messages and teachings.
 */
export interface Sermon {
  id: string;
  title: string;
  body: string | null;
  sermon_date: string;       // ISO date string
  youtube_url: string | null;
  tags: string[] | null;
  published: boolean;
  thumbnail: string | null;
  speaker: string | null;
  created: string;
  updated: string;
}

/**
 * An announcement — time-boxed church-wide notice.
 */
export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  published_at: string | null;
  expires_at: string | null;
  priority: Priority;
  published: boolean;
  created: string;
  updated: string;
}

/**
 * A free resource — PDF, guide, link, or any shareable content.
 */
export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file: string | null;
  url: string | null;
  category: 'essay' | 'article' | 'free';
  published: boolean;
  created: string;
  updated: string;
}
