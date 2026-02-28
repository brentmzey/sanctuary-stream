/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1849560702");
  
  if (!collection) {
    console.log("⚠️  Streams collection not found, skipping migration");
    return;
  }

  // Remove max length limit from scene_name for safety
  const sceneField = collection.fields.find((f) => f.name === "scene_name");
  if (sceneField && sceneField.type === "text") {
    delete sceneField.max;
    console.log("✅ Removed max length limit from streams.scene_name");
  }

  return app.save(collection);
}, (app) => {
  // Rollback: restore original max
  const collection = app.findCollectionByNameOrId("pbc_1849560702");
  
  if (!collection) {
    return;
  }

  const sceneField = collection.fields.find((f) => f.name === "scene_name");
  if (sceneField && sceneField.type === "text") {
    sceneField.max = 100;
  }

  return app.save(collection);
});
