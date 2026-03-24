import { Option, fromNullable, none } from './option';

// ============================================================================
// BASE TYPES & BRANDING
// ============================================================================

export interface BaseRow {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

/**
 * Branded type for Brotli/Base64 Compressed text strings.
 */
export type BrotliBase64String = string & { readonly __brand: unique symbol };

// ============================================================================
// SERMONS
// ============================================================================

export interface SermonRow extends BaseRow {
  title: string;
  bodyBrotliBase64: BrotliBase64String;
  /** Human-readable decompressed content (transient) */
  body?: string;
  sermon_date: string;
  youtube_url?: string;
  tags?: string[];
  published: boolean;
  thumbnail?: string;
  speaker?: string;
  stream_id?: string;
}

export class SermonBuilder {
  private _id: string = '';
  private _created: string = '';
  private _updated: string = '';
  private _collectionId: string = 'sermons';
  private _collectionName: string = 'sermons';

  private _title: string = '';
  private _bodyBrotliBase64: BrotliBase64String = '' as BrotliBase64String;
  private _body: Option<string> = none();
  private _sermon_date: string = new Date().toISOString();
  private _published: boolean = false;
  
  private _youtube_url: Option<string> = none();
  private _tags: Option<string[]> = none();
  private _thumbnail: Option<string> = none();
  private _speaker: Option<string> = none();
  private _stream_id: Option<string> = none();

  static fromRow(row: SermonRow): SermonBuilder {
    return new SermonBuilder()
      .withId(row.id)
      .withCreated(row.created)
      .withUpdated(row.updated)
      .withTitle(row.title)
      .withBodyBrotliBase64(row.bodyBrotliBase64)
      .withBody(row.body)
      .withSermonDate(row.sermon_date)
      .withPublished(row.published)
      .withYoutubeUrl(row.youtube_url)
      .withTags(row.tags)
      .withThumbnail(row.thumbnail)
      .withSpeaker(row.speaker)
      .withStreamId(row.stream_id);
  }

  static fromPartial(partial: Partial<SermonRow>): SermonBuilder {
    const builder = new SermonBuilder();
    if (partial.id) builder.withId(partial.id);
    if (partial.title) builder.withTitle(partial.title);
    if (partial.bodyBrotliBase64) builder.withBodyBrotliBase64(partial.bodyBrotliBase64);
    builder.withBody(partial.body);
    if (partial.sermon_date) builder.withSermonDate(partial.sermon_date);
    if (partial.published !== undefined) builder.withPublished(partial.published);
    
    builder.withYoutubeUrl(partial.youtube_url);
    builder.withTags(partial.tags);
    builder.withThumbnail(partial.thumbnail);
    builder.withSpeaker(partial.speaker);
    builder.withStreamId(partial.stream_id);
    
    return builder;
  }

  withId(id: string): this { this._id = id; return this; }
  withCreated(created: string): this { this._created = created; return this; }
  withUpdated(updated: string): this { this._updated = updated; return this; }
  withTitle(title: string): this { this._title = title; return this; }
  withBodyBrotliBase64(encoded: BrotliBase64String): this { this._bodyBrotliBase64 = encoded; return this; }
  withBody(body?: string | null): this { this._body = fromNullable(body); return this; }
  withSermonDate(date: string): this { this._sermon_date = date; return this; }
  withPublished(published: boolean): this { this._published = published; return this; }
  withYoutubeUrl(url?: string | null): this { this._youtube_url = fromNullable(url); return this; }
  withTags(tags?: string[] | null): this { this._tags = fromNullable(tags); return this; }
  withThumbnail(thumb?: string | null): this { this._thumbnail = fromNullable(thumb); return this; }
  withSpeaker(speaker?: string | null): this { this._speaker = fromNullable(speaker); return this; }
  withStreamId(streamId?: string | null): this { this._stream_id = fromNullable(streamId); return this; }

  toRow(): SermonRow {
    return {
      id: this._id,
      created: this._created,
      updated: this._updated,
      collectionId: this._collectionId,
      collectionName: this._collectionName,
      title: this._title,
      bodyBrotliBase64: this._bodyBrotliBase64,
      body: this._body._tag === 'some' ? this._body.value : undefined,
      sermon_date: this._sermon_date,
      published: this._published,
      youtube_url: this._youtube_url._tag === 'some' ? this._youtube_url.value : undefined,
      tags: this._tags._tag === 'some' ? this._tags.value : undefined,
      thumbnail: this._thumbnail._tag === 'some' ? this._thumbnail.value : undefined,
      speaker: this._speaker._tag === 'some' ? this._speaker.value : undefined,
      stream_id: this._stream_id._tag === 'some' ? this._stream_id.value : undefined,
    };
  }
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export interface AnnouncementRow extends BaseRow {
  title: string;
  bodyBrotliBase64: BrotliBase64String;
  /** Human-readable decompressed content (transient) */
  body?: string;
  published_at?: string;
  expires_at?: string;
  priority: 'low' | 'normal' | 'high';
  published: boolean;
}

export class AnnouncementBuilder {
    private _id: string = '';
    private _created: string = '';
    private _updated: string = '';
    private _collectionId: string = 'announcements';
    private _collectionName: string = 'announcements';

    private _title: string = '';
    private _bodyBrotliBase64: BrotliBase64String = '' as BrotliBase64String;
    private _body: Option<string> = none();
    private _published_at: Option<string> = none();
    private _expires_at: Option<string> = none();
    private _priority: 'low' | 'normal' | 'high' = 'normal';
    private _published: boolean = false;

    static fromRow(row: AnnouncementRow): AnnouncementBuilder {
      return new AnnouncementBuilder()
        .withId(row.id)
        .withCreated(row.created)
        .withUpdated(row.updated)
        .withTitle(row.title)
        .withBodyBrotliBase64(row.bodyBrotliBase64)
        .withBody(row.body)
        .withPublishedAt(row.published_at)
        .withExpiresAt(row.expires_at)
        .withPriority(row.priority)
        .withPublished(row.published);
    }

    static fromPartial(partial: Partial<AnnouncementRow>): AnnouncementBuilder {
      const builder = new AnnouncementBuilder();
      if (partial.id) builder.withId(partial.id);
      if (partial.title) builder.withTitle(partial.title);
      if (partial.bodyBrotliBase64) builder.withBodyBrotliBase64(partial.bodyBrotliBase64);
      builder.withBody(partial.body);
      if (partial.priority) builder.withPriority(partial.priority);
      if (partial.published !== undefined) builder.withPublished(partial.published);
      
      builder.withPublishedAt(partial.published_at);
      builder.withExpiresAt(partial.expires_at);
      
      return builder;
    }

    withId(id: string): this { this._id = id; return this; }
    withCreated(created: string): this { this._created = created; return this; }
    withUpdated(updated: string): this { this._updated = updated; return this; }
    withTitle(title: string): this { this._title = title; return this; }
    withBodyBrotliBase64(encoded: BrotliBase64String): this { this._bodyBrotliBase64 = encoded; return this; }
    withBody(body?: string | null): this { this._body = fromNullable(body); return this; }
    withPublishedAt(date?: string | null): this { this._published_at = fromNullable(date); return this; }
    withExpiresAt(date?: string | null): this { this._expires_at = fromNullable(date); return this; }
    withPriority(priority: 'low' | 'normal' | 'high'): this { this._priority = priority; return this; }
    withPublished(published: boolean): this { this._published = published; return this; }

    toRow(): AnnouncementRow {
      return {
        id: this._id,
        created: this._created,
        updated: this._updated,
        collectionId: this._collectionId,
        collectionName: this._collectionName,
        title: this._title,
        bodyBrotliBase64: this._bodyBrotliBase64,
        body: this._body._tag === 'some' ? this._body.value : undefined,
        published_at: this._published_at._tag === 'some' ? this._published_at.value : undefined,
        expires_at: this._expires_at._tag === 'some' ? this._expires_at.value : undefined,
        priority: this._priority,
        published: this._published,
      };
    }
}

// ============================================================================
// RESOURCES
// ============================================================================

export interface ResourceRow extends BaseRow {
  title: string;
  descriptionBrotliBase64: BrotliBase64String;
  /** Human-readable decompressed content (transient) */
  description?: string;
  file?: string;
  url?: string;
  category: 'essay' | 'article' | 'free';
  published: boolean;
}

export class ResourceBuilder {
    private _id: string = '';
    private _created: string = '';
    private _updated: string = '';
    private _collectionId: string = 'resources';
    private _collectionName: string = 'resources';

    private _title: string = '';
    private _descriptionBrotliBase64: BrotliBase64String = '' as BrotliBase64String;
    private _description: Option<string> = none();
    private _file: Option<string> = none();
    private _url: Option<string> = none();
    private _category: 'essay' | 'article' | 'free' = 'free';
    private _published: boolean = false;

    static fromRow(row: ResourceRow): ResourceBuilder {
      return new ResourceBuilder()
        .withId(row.id)
        .withCreated(row.created)
        .withUpdated(row.updated)
        .withTitle(row.title)
        .withDescriptionBrotliBase64(row.descriptionBrotliBase64)
        .withDescription(row.description)
        .withFile(row.file)
        .withUrl(row.url)
        .withCategory(row.category)
        .withPublished(row.published);
    }

    static fromPartial(partial: Partial<ResourceRow>): ResourceBuilder {
        const builder = new ResourceBuilder();
        if (partial.id) builder.withId(partial.id);
        if (partial.title) builder.withTitle(partial.title);
        if (partial.descriptionBrotliBase64) builder.withDescriptionBrotliBase64(partial.descriptionBrotliBase64);
        builder.withDescription(partial.description);
        builder.withFile(partial.file);
        builder.withUrl(partial.url);
        
        return builder;
    }

    withId(id: string): this { this._id = id; return this; }
    withCreated(created: string): this { this._created = created; return this; }
    withUpdated(updated: string): this { this._updated = updated; return this; }
    withTitle(title: string): this { this._title = title; return this; }
    withDescriptionBrotliBase64(encoded: BrotliBase64String): this { this._descriptionBrotliBase64 = encoded; return this; }
    withDescription(desc?: string | null): this { this._description = fromNullable(desc); return this; }
    withFile(file?: string | null): this { this._file = fromNullable(file); return this; }
    withUrl(url?: string | null): this { this._url = fromNullable(url); return this; }
    withCategory(cat: 'essay' | 'article' | 'free'): this { this._category = cat; return this; }
    withPublished(published: boolean): this { this._published = published; return this; }

    toRow(): ResourceRow {
      return {
        id: this._id,
        created: this._created,
        updated: this._updated,
        collectionId: this._collectionId,
        collectionName: this._collectionName,
        title: this._title,
        descriptionBrotliBase64: this._descriptionBrotliBase64,
        description: this._description._tag === 'some' ? this._description.value : undefined,
        file: this._file._tag === 'some' ? this._file.value : undefined,
        url: this._url._tag === 'some' ? this._url.value : undefined,
        category: this._category,
        published: this._published,
      };
    }
}
