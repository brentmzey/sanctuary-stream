migrate((app) => {
    try {
        const collection = app.findCollectionByNameOrId("users");
        if (!collection) return;

        // Add name field if it doesn't exist
        if (!collection.fields.getByName("name")) {
            collection.fields.add(new Field({
                "name": "name",
                "type": "text",
                "required": true
            }));
        }

        // Add role field if it doesn't exist
        if (!collection.fields.getByName("role")) {
            collection.fields.add(new Field({
                "name": "role",
                "type": "select",
                "required": true,
                "values": ["admin", "pastor", "tech"]
            }));
        }

        return app.save(collection);
    } catch (e) {
        return;
    }
}, (app) => {
    try {
        const collection = app.findCollectionByNameOrId("users");
        if (collection) {
            collection.fields.removeByName("name");
            collection.fields.removeByName("role");
            return app.save(collection);
        }
    } catch (e) {}
})
