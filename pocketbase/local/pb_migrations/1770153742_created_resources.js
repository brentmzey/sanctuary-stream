migrate((app) => {
    let collection;
    try {
        collection = app.findCollectionByNameOrId("pbc_5932645223");
    } catch (e) {
        // Fallback to creating a new one
        collection = new Collection({
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
    }

    // Ensure semantic naming for compressed description
    if (!collection.fields.getByName('descriptionBrotliBase64')) {
        collection.fields.add(new Field({
            "name": "descriptionBrotliBase64",
            "type": "text",
            "required": false
        }));
    }

    // Clean up old description field if present
    const oldDescription = collection.fields.getByName('description');
    if (oldDescription) {
        collection.fields.removeById(oldDescription.id);
    }

    // Ensure other fields
    if (!collection.fields.getByName('file')) {
        collection.fields.add(new Field({
            "name": "file",
            "type": "file",
            "maxSelect": 1
        }));
    }

    if (!collection.fields.getByName('url')) {
        collection.fields.add(new Field({
            "name": "url",
            "type": "url"
        }));
    }

    if (!collection.fields.getByName('category')) {
        collection.fields.add(new Field({
            "name": "category",
            "type": "select",
            "required": true,
            "values": ["essay", "article", "free"]
        }));
    }

    if (!collection.fields.getByName('published')) {
        collection.fields.add(new Field({
            "name": "published",
            "type": "bool"
        }));
    }

    return app.save(collection);
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("pbc_5932645223");
        if (collection) return app.delete(collection);
    } catch (e) {}
})
