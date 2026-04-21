/**
 * Global Schema for Sanctuary Stream
 * Defines enums and static constants for PocketBase collections, fields, and statuses.
 * This is the single source of truth to avoid magic strings and typos.
 */

/**
 * PocketBase Collection Names
 */
export enum PBCollection {
  Announcements = 'announcements',
  Sermons = 'sermons',
  Resources = 'resources',
  Commands = 'commands',
  Streams = 'streams',
  Users = 'users',
  Recordings = 'recordings',
}

/**
 * User roles for access control
 */
export enum UserRole {
  Admin = 'admin',
  Pastor = 'pastor',
  Tech = 'tech',
}

/**
 * Stream lifecycle statuses
 */
export enum StreamStatus {
  Idle = 'idle',
  Live = 'live',
  Recording = 'recording',
  Error = 'error',
}

/**
 * Remote control command actions
 */
export enum CommandAction {
  Start = 'START',
  Stop = 'STOP',
  RecordStart = 'RECORD_START',
  RecordStop = 'RECORD_STOP',
  SetStreamSettings = 'SET_STREAM_SETTINGS',
  SetVideoSettings = 'SET_VIDEO_SETTINGS',
  SetStreamEncoder = 'SET_STREAM_ENCODER',
  SetAudioSettings = 'SET_AUDIO_SETTINGS',
  SetScene = 'SET_SCENE',
  SetMute = 'SET_MUTE',
  SetVolume = 'SET_VOLUME',
  SetOverlay = 'SET_OVERLAY',
  FadeToBlack = 'FADE_TO_BLACK',
  ApplyTransition = 'APPLY_TRANSITION',
  UploadToDrive = 'UPLOAD_TO_DRIVE',
}

/**
 * Announcement Priority Levels
 */
export enum Priority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

/**
 * Static Field Name Mapping
 * Use these instead of raw strings for filter queries or object keys.
 */
export const Field = {
  Base: {
    Id: 'id',
    Created: 'created',
    Updated: 'updated',
    CollectionId: 'collectionId',
    CollectionName: 'collectionName',
  },
  User: {
    Email: 'email',
    Name: 'name',
    Role: 'role',
    Verified: 'verified',
  },
  Stream: {
    Status: 'status',
    Heartbeat: 'heartbeat',
    YouTubeUrl: 'youtube_url',
    Metadata: 'metadata',
  },
  Command: {
    Action: 'action',
    Executed: 'executed',
    CorrelationId: 'correlation_id',
    Payload: 'payload',
    CreatedBy: 'created_by',
    ErrorMessage: 'error_message',
  },
  Sermon: {
    Title: 'title',
    BodyBrotli: 'bodyBrotliBase64',
    SermonDate: 'sermon_date',
    YouTubeUrl: 'youtube_url',
    Tags: 'tags',
    Published: 'published',
    Thumbnail: 'thumbnail',
    Speaker: 'speaker',
    StreamId: 'stream_id',
  },
  Announcement: {
    Title: 'title',
    BodyBrotli: 'bodyBrotliBase64',
    PublishedAt: 'published_at',
    ExpiresAt: 'expires_at',
    Priority: 'priority',
    Published: 'published',
  },
  Resource: {
    Title: 'title',
    DescriptionBrotli: 'descriptionBrotliBase64',
    File: 'file',
    Url: 'url',
    Category: 'category',
    Published: 'published',
  }
} as const;
