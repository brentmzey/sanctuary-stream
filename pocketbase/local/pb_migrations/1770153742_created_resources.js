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
    const collection = app.findCollectionByNameOrId("pbc_5932645223") || new Collection({
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
            }
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
        "deleteRule": "@request.auth.role = 'admin'"
    });

    // Ensure semantic naming for compressed description
    const descriptionExists = collection.fields.find(f => f.name === 'descriptionBrotliBase64');
    if (!descriptionExists) {
        collection.fields.add(new SchemaField({
            "name": "descriptionBrotliBase64",
            "type": "text",
            "required": false,
            "presentable": false
        }));
    }

    // Clean up old description field if present
    const oldDescription = collection.fields.find(f => f.name === 'description');
    if (oldDescription) {
        collection.fields.removeById(oldDescription.id);
    }

    // Ensure other fields
    if (!collection.fields.find(f => f.name === 'file')) {
        collection.fields.add(new SchemaField({
            "name": "file",
            "type": "file",
            "maxSelect": 1
        }));
    }

    if (!collection.fields.find(f => f.name === 'url')) {
        collection.fields.add(new SchemaField({
            "name": "url",
            "type": "url"
        }));
    }

    if (!collection.fields.find(f => f.name === 'category')) {
        collection.fields.add(new SchemaField({
            "name": "category",
            "type": "select",
            "required": true,
            "values": ["essay", "article", "free"]
        }));
    }

    if (!collection.fields.find(f => f.name === 'published')) {
        collection.fields.add(new SchemaField({
            "name": "published",
            "type": "bool"
        }));
    }

    return app.save(collection);
}
, (app) => {
    const collection = app.findCollectionByNameOrId("pbc_5932645223");
    if (collection) return app.delete(collection);
})
