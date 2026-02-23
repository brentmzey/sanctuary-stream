/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Create the `resources` collection
 *
 * Resources are free handouts the church wants to share — sermon notes,
 * Bible study guides, recommended reading lists, links to external tools,
 * that sort of thing. They can be a file download, a URL, or both.
 *
 * Fields:
 *   - title       : Display name (required)
 *   - description : Short blurb about what this resource is (optional)
 *   - file        : Uploadable PDF / image / doc (optional)
 *   - url         : External link (optional — for resources that live elsewhere)
 *   - category    : essay / article / free — maps to the "Free Resources" nav section
 *   - published   : Draft / live toggle (draft-safe default = false)
 *
 * At least one of `file` or `url` should be present — the app enforces this
 * at the UI layer since PocketBase rules can't easily do cross-field validation.
 *
 * Public-read like announcements — these are meant to be openly accessible
 * on the website. Content writes are restricted to admins and pastors.
 */
migrate((app) => {
    const collection = new Collection({
        "id": "pbc_5932645223",
        "name": "resources",
        "type": "base",
        "system": false,
        "fields": [
            {
                "name": "title",
                "type": "text",
                "required": true,
                "presentable": true,
                "max": 200
            },
            {
                "name": "description",
                "type": "text",
                "required": false,
                "presentable": false,
                "max": 1000
            },
            {
                "name": "file",
                "type": "file",
                "required": false,
                "presentable": false,
                "maxSize": 52428800,
                "mimeTypes": [
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ],
                "maxSelect": 1
            },
            {
                "name": "url",
                "type": "url",
                "required": false,
                "presentable": false
            },
            {
                "name": "category",
                "type": "select",
                "required": true,
                "presentable": false,
                "values": ["essay", "article", "free"],
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
            "CREATE INDEX idx_resource_category ON resources (category)",
            "CREATE INDEX idx_resource_published ON resources (published)"
        ],
        // Public read — free resources should be freely accessible
        "listRule": "",
        "viewRule": "",
        // Admin and pastor can manage content; tech role handles AV not editorial
        "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "deleteRule": "@request.auth.role = 'admin'"
    });

    return app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId("pbc_5932645223");
    return app.delete(collection);
})
