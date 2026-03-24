/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Create the `announcements` collection
 *
 * Announcements are time-boxed notices — upcoming events, service changes,
 * benevolence drives, whatever the church office needs to surface quickly.
 * They have an optional expiry so we don't clutter the feed with stale posts.
 *
 * Fields:
 *   - title        : Short, attention-grabbing headline (required)
 *   - body         : Supporting detail (optional — sometimes a headline is enough)
 *   - published_at : When to start showing it (optional; if null, show immediately when published=true)
 *   - expires_at   : Auto-hide after this date (optional; null = never expires)
 *   - priority     : low / normal / high — lets the UI sort and badge accordingly
 *   - published    : Master on/off switch (draft-safe default = false)
 *
 * Public-read intentional here — announcements are meant for everyone,
 * including guests who visit the website without logging in. The createRule
 * still requires a role so random internet folks can't post.
 */
migrate((app) => {
    const existing = app.findCollectionByNameOrId("pbc_4821534112");
    if (existing) {
        return app.save(existing);
    }

    const collection = new Collection({
        "id": "pbc_4821534112",
        "name": "announcements",
        "type": "base",
        "system": false,
        "fields": [
            {
                "name": "title",
                "type": "text",
                "required": true,
                "presentable": true,
                "max": 150
            },
            {
                "name": "bodyBrotliBase64",
                "type": "text",
                "required": false,
                "presentable": false
            },
            {
                "name": "published_at",
                "type": "date",
                "required": false,
                "presentable": false
            },
            {
                "name": "expires_at",
                "type": "date",
                "required": false,
                "presentable": false
            },
            {
                "name": "priority",
                "type": "select",
                "required": true,
                "presentable": false,
                "values": ["low", "normal", "high"],
                "maxSelect": 1
            },
            {
                "name": "published",
                "type": "bool",
                "required": false,
                "presentable": false
            }
        ],
        "indexes": [
            "CREATE INDEX idx_announcement_published ON announcements (published)",
            "CREATE INDEX idx_announcement_expires ON announcements (expires_at)",
            "CREATE INDEX idx_announcement_priority ON announcements (priority)"
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "deleteRule": "@request.auth.role = 'admin'"
    });

    return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("pbc_4821534112");
    if (collection) return app.delete(collection);
})
