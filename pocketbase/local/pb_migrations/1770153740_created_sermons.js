/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Create the `sermons` collection
 *
 * Sermons are the bread and butter of the CMS — every Sunday message,
 * every midweek teaching, all of it lives here. Published ones are
 * public; drafts stay invisible until an admin or pastor flips the switch.
 *
 * Fields:
 *   - title       : The sermon title (required, plain text)
 *   - body        : Full text / notes (can be long markdown)
 *   - sermon_date : When it was preached (required for sorting)
 *   - youtube_url : Link to the recording (optional, YouTube domains only)
 *   - tags        : Array of topic tags stored as JSON (optional)
 *   - published   : Draft vs. visible to the world (defaults to false — safety first)
 *   - thumbnail   : Optional cover image for cards / previews
 *   - speaker     : Who preached it (optional, text)
 *
 * Access rules follow the role model established in `commands`:
 *   - list / view  → any authenticated user
 *   - create / update / delete → admin or pastor only
 *   - Public listing of *published* sermons intentionally left to API filter,
 *     so the app can optionally expose them without auth for the website.
 */
migrate((app) => {
    const collection = new Collection({
        "id": "pbc_3910423001",
        "name": "sermons",
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
                "name": "body",
                "type": "text",
                "required": false,
                "presentable": false,
                "max": 50000
            },
            {
                "name": "sermon_date",
                "type": "date",
                "required": true,
                "presentable": false
            },
            {
                "name": "youtube_url",
                "type": "url",
                "required": false,
                "presentable": false,
                "onlyDomains": ["youtube.com", "youtu.be"]
            },
            {
                "name": "tags",
                "type": "json",
                "required": false,
                "presentable": false
            },
            {
                "name": "published",
                "type": "bool",
                "required": false,
                "presentable": false
            },
            {
                "name": "thumbnail",
                "type": "file",
                "required": false,
                "presentable": false,
                "maxSize": 5242880,
                "mimeTypes": ["image/jpeg", "image/png", "image/webp"],
                "maxSelect": 1
            },
            {
                "name": "speaker",
                "type": "text",
                "required": false,
                "presentable": false,
                "max": 100
            }
        ],
        "indexes": [
            "CREATE INDEX idx_sermon_date ON sermons (sermon_date DESC)",
            "CREATE INDEX idx_sermon_published ON sermons (published)",
            "CREATE INDEX idx_sermon_speaker ON sermons (speaker)"
        ],
        // Anyone who is logged in can browse/view sermons
        "listRule": "@request.auth.id != ''",
        "viewRule": "@request.auth.id != ''",
        // Only admins and pastors can write content — the tech role handles AV, not CMS
        "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "deleteRule": "@request.auth.role = 'admin'"
    });

    return app.save(collection);
}, (app) => {
    // Down migration — clean removal with no orphans
    const collection = app.findCollectionByNameOrId("pbc_3910423001");
    return app.delete(collection);
})
