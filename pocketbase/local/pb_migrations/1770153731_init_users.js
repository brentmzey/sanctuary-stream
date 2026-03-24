/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  // Update users collection with custom fields
  if (!collection.fields.getByName("name")) {
    collection.fields.add(new Field({
      "name": "name",
      "type": "text",
      "required": true,
      "presentable": false,
      "system": false
    }));
  }

  if (!collection.fields.getByName("role")) {
    collection.fields.add(new Field({
      "name": "role",
      "type": "select",
      "required": true,
      "presentable": false,
      "system": false,
      "values": ["admin", "pastor", "tech"]
    }));
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("name");
  collection.fields.removeByName("role");
  return app.save(collection);
})
