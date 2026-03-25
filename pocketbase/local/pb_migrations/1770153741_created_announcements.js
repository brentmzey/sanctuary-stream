migrate((app) => {
    let collection;
    try {
        collection = app.findCollectionByNameOrId("pbc_1294857632");
    } catch (e) {}

    if (!collection) {
        collection = new Collection({
            "id": "pbc_1294857632",
            "name": "announcements",
            "type": "base",
            "system": false,
            "fields": [
                {
                    "name": "title",
                    "type": "text",
                    "required": true
                },
                {
                    "name": "publishedDate",
                    "type": "date",
                    "required": true
                },
                {
                    "name": "active",
                    "type": "bool",
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

    // Semantic field for compressed message
    if (!collection.fields.getByName('messageBrotliBase64')) {
        collection.fields.add(new Field({
            "name": "messageBrotliBase64",
            "type": "text",
            "required": false
        }));
    }

    // Cleanup old message field
    const oldMessage = collection.fields.getByName('message');
    if (oldMessage) {
        collection.fields.removeById(oldMessage.id);
    }

    return app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("pbc_1294857632");
        if (collection) return app.delete(collection);
    } catch (e) {}
})
