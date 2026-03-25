migrate((app) => {
    let collection;
    try {
        collection = app.findCollectionByNameOrId("pbc_3541289607");
    } catch (e) {}

    if (!collection) {
        collection = new Collection({
            "id": "pbc_3541289607",
            "name": "sermons",
            "type": "base",
            "system": false,
            "fields": [
                {
                    "name": "title",
                    "type": "text",
                    "required": true
                },
                {
                    "name": "videoUrl",
                    "type": "url",
                    "required": false
                },
                {
                    "name": "thumbnailUrl",
                    "type": "url",
                    "required": false
                },
                {
                    "name": "publishedDate",
                    "type": "date",
                    "required": true
                }
            ],
            "listRule": "",
            "viewRule": "",
            "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
            "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
            "deleteRule": "@request.auth.role = 'admin'"
        });
    }

    // Semantic field for compressed body
    if (!collection.fields.getByName('bodyBrotliBase64')) {
        collection.fields.add(new Field({
            "name": "bodyBrotliBase64",
            "type": "text",
            "required": false
        }));
    }

    // Cleanup old body field
    const oldBody = collection.fields.getByName('body');
    if (oldBody) {
        collection.fields.removeById(oldBody.id);
    }

    return app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("pbc_3541289607");
        if (collection) return app.delete(collection);
    } catch (e) {}
})
