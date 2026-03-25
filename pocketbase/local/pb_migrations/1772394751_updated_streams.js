migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_1849560702");
    if (!collection) return;

    // Update scene_name field
    const sceneField = collection.fields.getByName("scene_name");
    if (sceneField) {
      sceneField.required = false;
    }

    // Add profile_name field
    if (!collection.fields.getByName("profile_name")) {
      collection.fields.add(new Field({
        "name": "profile_name",
        "type": "text",
        "required": false
      }));
    }

    return app.save(collection);
  } catch (e) {}
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_1849560702");
    if (collection) {
      collection.fields.removeByName("profile_name");
      return app.save(collection);
    }
  } catch (e) {}
})
