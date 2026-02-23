import { useState, useEffect } from 'react';
import {
    getSermons,
    getAnnouncements,
    getResources,
    SermonRecord,
    AnnouncementRecord,
    ResourceRecord,
} from '../lib/pocketbase';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="reflections-empty">
            <span className="reflections-empty__icon">{icon}</span>
            <p>{message}</p>
        </div>
    );
}

function SermonCard({ sermon }: { sermon: SermonRecord }) {
    return (
        <article className="sermon-card">
            <div className="sermon-card__meta">
                <time className="sermon-card__date">{formatDate(sermon.sermon_date)}</time>
                {sermon.speaker && (
                    <span className="sermon-card__speaker">✦ {sermon.speaker}</span>
                )}
            </div>
            <h3 className="sermon-card__title">{sermon.title}</h3>
            {sermon.body && (
                <p className="sermon-card__excerpt">
                    {sermon.body.slice(0, 220)}
                    {sermon.body.length > 220 ? '…' : ''}
                </p>
            )}
            {sermon.youtube_url && (
                <a
                    href={sermon.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sermon-card__link"
                >
                    ▶ Watch Recording
                </a>
            )}
        </article>
    );
}

function AnnouncementRow({ announcement }: { announcement: AnnouncementRecord }) {
    return (
        <li className={`announcement-row priority-${announcement.priority}`}>
            {announcement.priority === 'high' && (
                <span className="announcement-row__badge">Urgent</span>
            )}
            <strong>{announcement.title}</strong>
            {announcement.body && <p className="announcement-row__body">{announcement.body}</p>}
            {announcement.expires_at && (
                <span className="announcement-row__expires">
                    Expires {formatDate(announcement.expires_at)}
                </span>
            )}
        </li>
    );
}

function ResourceRow({ resource }: { resource: ResourceRecord }) {
    const href = resource.url || '#';
    return (
        <li className="resource-row">
            <div className="resource-row__info">
                <span className="resource-row__category">{resource.category}</span>
                <strong>{resource.title}</strong>
                {resource.description && (
                    <p className="resource-row__desc">{resource.description}</p>
                )}
            </div>
            {(resource.url || resource.file) && (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-row__link"
                >
                    {resource.file ? '⬇ Download' : '→ Open'}
                </a>
            )}
        </li>
    );
}

/* ─── TabBar ──────────────────────────────────────────────────────────────── */

type Tab = 'sermons' | 'announcements' | 'resources';
const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'sermons', label: 'Sermons', icon: '📖' },
    { key: 'announcements', label: 'Announcements', icon: '📣' },
    { key: 'resources', label: 'Resources', icon: '📥' },
];

/* ─── Main Component ──────────────────────────────────────────────────────── */

export function PastoralReflections() {
    const [activeTab, setActiveTab] = useState<Tab>('sermons');
    const [sermons, setSermons] = useState<SermonRecord[]>([]);
    const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
    const [resources, setResources] = useState<ResourceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all([
            getSermons(10).unsafeRunAsync(),
            getAnnouncements().unsafeRunAsync(),
            getResources().unsafeRunAsync(),
        ])
            .then(([s, a, r]) => {
                setSermons(s);
                setAnnouncements(a);
                setResources(r);
            })
            .catch((err: Error) => {
                // Collections may not exist on PocketHost yet — surface a helpful message
                if (err.message?.includes('404') || err.message?.includes('not found')) {
                    setError(
                        'Content collections not yet imported into PocketHost. ' +
                        'Import pocketbase/collections_export.json via Admin → Settings → Import Collections.'
                    );
                } else {
                    setError(err.message || 'Failed to load reflections content.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="pastoral-reflections" aria-label="Pastoral Reflections">
            <header className="pastoral-reflections__header">
                <h2 className="pastoral-reflections__title">
                    <span className="pastoral-reflections__title-icon">✦</span>
                    Pastoral Reflections
                </h2>
                <p className="pastoral-reflections__subtitle">
                    Sermons, announcements, and resources from the community.
                </p>
            </header>

            {/* Inner tab bar */}
            <nav className="reflections-tabs" aria-label="Content sections">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`reflections-tab ${activeTab === t.key ? 'reflections-tab--active' : ''}`}
                        onClick={() => setActiveTab(t.key)}
                        aria-current={activeTab === t.key ? 'page' : undefined}
                    >
                        {t.icon} {t.label}
                        {t.key === 'announcements' && announcements.length > 0 && (
                            <span className="reflections-tab__count">{announcements.length}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="reflections-content">
                {loading && (
                    <div className="reflections-loading">
                        <div className="spinner" />
                        <p>Loading…</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="reflections-notice">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && activeTab === 'sermons' && (
                    sermons.length === 0
                        ? <EmptyState icon="📖" message="No published sermons yet. Add one in the PocketBase admin UI." />
                        : <div className="sermon-list">{sermons.map((s) => <SermonCard key={s.id} sermon={s} />)}</div>
                )}

                {!loading && !error && activeTab === 'announcements' && (
                    announcements.length === 0
                        ? <EmptyState icon="📣" message="No active announcements right now." />
                        : <ul className="announcement-list">{announcements.map((a) => <AnnouncementRow key={a.id} announcement={a} />)}</ul>
                )}

                {!loading && !error && activeTab === 'resources' && (
                    resources.length === 0
                        ? <EmptyState icon="📥" message="No published resources yet. Add them in the PocketBase admin UI." />
                        : <ul className="resource-list">{resources.map((r) => <ResourceRow key={r.id} resource={r} />)}</ul>
                )}
            </div>
        </section>
    );
}
