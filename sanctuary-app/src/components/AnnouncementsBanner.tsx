import { useState, useEffect } from 'react';
import { getAnnouncements, AnnouncementRecord } from '../lib/pocketbase';

export function AnnouncementsBanner() {
    const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        getAnnouncements()
            .unsafeRunAsync()
            .then(setAnnouncements)
            .catch(() => {
                /* collection may not exist yet on PocketHost — silently skip */
            });
    }, []);

    const high = announcements.filter((a) => a.priority === 'high');
    const visible = high.length > 0 ? high : announcements.slice(0, 1);

    if (dismissed || visible.length === 0) return null;

    return (
        <div className="announcements-banner" role="region" aria-label="Church announcements">
            <div className="announcements-banner__inner">
                <span className="announcements-banner__icon">📣</span>
                <div className="announcements-banner__content">
                    {visible.map((a) => (
                        <span key={a.id} className={`announcement-chip priority-${a.priority}`}>
                            <strong>{a.title}</strong>
                            {a.body && <span className="announcement-chip__body"> — {a.body}</span>}
                        </span>
                    ))}
                </div>
                <button
                    className="announcements-banner__dismiss"
                    aria-label="Dismiss announcements"
                    onClick={() => setDismissed(true)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
