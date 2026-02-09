/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  // Update users collection with custom fields
  collection.fields.add(new Field({
    "name": "name",
    "type": "text",
    "required": true,
    "presentable": false,
    "system": false
  }));

  collection.fields.add(new Field({
    "name": "role",
    "type": "select",
    "required": true,
    "presentable": false,
    "system": false,
    "values": ["admin", "pastor", "tech"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.fields.removeByName("name");
  collection.fields.removeByName("role");
  return app.save(collection);
})
