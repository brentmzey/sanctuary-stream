/**
 * sanctuary-app/src/lib/cms.ts — CMS CRUD client
 *
 * Every function here wraps a PocketBase SDK call in AsyncIO so the caller
 * always gets an explicit, type-safe interface.  No raw throws, no implicit
 * nulls — Option and Result make the happy/sad paths impossible to confuse.
 *
 * Usage pattern (same everywhere):
 *
 *   const result = await listSermons().attempt();
 *   if (isSuccess(result)) { ... } else { handleError(result.error); }
 *
 * Or chain with flatMap if you need to sequence operations:
 *
 *   const io = createSermon(data).flatMap((s) => publishSermon(s.id));
 *   const result = await io.attempt();
 */
import { pb } from './pocketbase';
import { AsyncIO } from '@shared/io';
import { fromNonEmptyString, getOrElse } from '@shared/option';
import type { Sermon, Announcement, Resource } from '@shared/types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Builds a PocketBase filter string, safely ignoring empty/null values.
 * Keeps the API call clean when the caller doesn't supply an optional filter.
 *
 * Option.fromNonEmptyString() does the null + whitespace check for us —
 * a perfect fit for optional query params from form inputs.
 */
const resolveFilter = (filter: string | undefined): string =>
    getOrElse(fromNonEmptyString(filter), () => '');

// ---------------------------------------------------------------------------
// Sermons
// ---------------------------------------------------------------------------

/**
 * List sermons — authenticated users only (see migration access rules).
 *
 * @param filter  Optional PocketBase filter string, e.g. "published = true"
 * @param sort    Sort expression, defaults to newest-first by sermon date
 * @param page    1-indexed page number
 * @param perPage Records per page (max 500 per PocketBase limits)
 */
export const listSermons = (
    filter?: string,
    sort = '-sermon_date',
    page = 1,
    perPage = 20
): AsyncIO<Sermon[]> =>
    new AsyncIO(async () => {
        const safeFilter = resolveFilter(filter);
        const result = await pb.collection('sermons').getList<Sermon>(page, perPage, {
            filter: safeFilter,
            sort,
        });
        return result.items;
    });

/**
 * Fetch a single sermon by ID.
 * Returns the full record so callers can render body, tags, etc.
 */
export const getSermon = (id: string): AsyncIO<Sermon> =>
    new AsyncIO(async () => {
        // fromNonEmptyString catches empty IDs before they hit the network
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Sermon ID must not be empty');
        });
        return pb.collection('sermons').getOne<Sermon>(safeId);
    });

/**
 * Create a new sermon draft.
 * `published` defaults to false — everything starts as a draft.
 * Caller must explicitly set `published: true` to make it live.
 */
export const createSermon = (
    data: Omit<Sermon, 'id' | 'created' | 'updated'>
): AsyncIO<Sermon> =>
    new AsyncIO(async () => {
        // Ensure published defaults to draft state — caller's value takes precedence
        const payload = { ...data, published: data.published ?? false };
        return pb.collection('sermons').create<Sermon>(payload);
    });

/**
 * Update an existing sermon.
 * Partial updates only — supply just the fields that changed.
 */
export const updateSermon = (
    id: string,
    data: Partial<Omit<Sermon, 'id' | 'created' | 'updated'>>
): AsyncIO<Sermon> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Sermon ID must not be empty');
        });
        return pb.collection('sermons').update<Sermon>(safeId, data);
    });

/**
 * Delete a sermon.
 * Admin-only per the migration rules — PocketBase enforces this server-side.
 */
export const deleteSermon = (id: string): AsyncIO<void> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Sermon ID must not be empty');
        });
        await pb.collection('sermons').delete(safeId);
    });

/**
 * Convenience: flip a sermon's published state without needing the full record.
 * Commonly used by the "Publish / Unpublish" toggle button in the CMS UI.
 */
export const setSermonPublished = (id: string, published: boolean): AsyncIO<Sermon> =>
    updateSermon(id, { published });

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

/**
 * List announcements.
 * Public collections — no auth required, but the app still passes headers when logged in.
 *
 * Tip: filter for active ones with:
 *   `published = true && (expires_at = '' || expires_at > "${new Date().toISOString()}")`
 */
export const listAnnouncements = (
    filter?: string,
    sort = '-created',
    page = 1,
    perPage = 20
): AsyncIO<Announcement[]> =>
    new AsyncIO(async () => {
        const safeFilter = resolveFilter(filter);
        const result = await pb.collection('announcements').getList<Announcement>(page, perPage, {
            filter: safeFilter,
            sort,
        });
        return result.items;
    });

export const getAnnouncement = (id: string): AsyncIO<Announcement> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Announcement ID must not be empty');
        });
        return pb.collection('announcements').getOne<Announcement>(safeId);
    });

export const createAnnouncement = (
    data: Omit<Announcement, 'id' | 'created' | 'updated'>
): AsyncIO<Announcement> =>
    new AsyncIO(async () => {
        const payload = { 
            ...data, 
            published: data.published ?? false, 
            priority: data.priority ?? ('normal' as const) 
        };
        return pb.collection('announcements').create<Announcement>(payload);
    });

export const updateAnnouncement = (
    id: string,
    data: Partial<Omit<Announcement, 'id' | 'created' | 'updated'>>
): AsyncIO<Announcement> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Announcement ID must not be empty');
        });
        return pb.collection('announcements').update<Announcement>(safeId, data);
    });

export const deleteAnnouncement = (id: string): AsyncIO<void> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Announcement ID must not be empty');
        });
        await pb.collection('announcements').delete(safeId);
    });

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

/**
 * List resources — public, filterable by category.
 *
 * Common filter: `published = true && category = 'free'`
 */
export const listResources = (
    filter?: string,
    sort = '-created',
    page = 1,
    perPage = 20
): AsyncIO<Resource[]> =>
    new AsyncIO(async () => {
        const safeFilter = resolveFilter(filter);
        const result = await pb.collection('resources').getList<Resource>(page, perPage, {
            filter: safeFilter,
            sort,
        });
        return result.items;
    });

export const getResource = (id: string): AsyncIO<Resource> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Resource ID must not be empty');
        });
        return pb.collection('resources').getOne<Resource>(safeId);
    });

export const createResource = (
    data: Omit<Resource, 'id' | 'created' | 'updated'>
): AsyncIO<Resource> =>
    new AsyncIO(async () => {
        const payload = { ...data, published: data.published ?? false };
        return pb.collection('resources').create<Resource>(payload);
    });

export const updateResource = (
    id: string,
    data: Partial<Omit<Resource, 'id' | 'created' | 'updated'>>
): AsyncIO<Resource> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Resource ID must not be empty');
        });
        return pb.collection('resources').update<Resource>(safeId, data);
    });

export const deleteResource = (id: string): AsyncIO<void> =>
    new AsyncIO(async () => {
        const safeId = getOrElse(fromNonEmptyString(id), () => {
            throw new Error('Resource ID must not be empty');
        });
        await pb.collection('resources').delete(safeId);
    });
