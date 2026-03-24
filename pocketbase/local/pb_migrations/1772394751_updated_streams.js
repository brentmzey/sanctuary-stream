/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1849560702")
  if (!collection) return;

  // update status field
  const statusField = collection.fields.getById("select2063623452");
  if (statusField && statusField.type === "select") {
    statusField.values = ["idle", "starting", "live", "recording", "error"];
  }

  // update youtube_url field
  const youtubeField = collection.fields.getById("url1858974015");
  if (youtubeField && youtubeField.type === "url") {
    youtubeField.onlyDomains = null; // Remove restriction if it was there
  }

  // update scene_name field
  const sceneField = collection.fields.getById("text1166349570");
  if (sceneField && sceneField.type === "text") {
    delete sceneField.max;
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1849560702")
  if (!collection) return;

  const statusField = collection.fields.getById("select2063623452");
  if (statusField && statusField.type === "select") {
    statusField.values = ["idle", "live", "recording", "error"];
  }

  return app.save(collection)
})
