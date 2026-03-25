migrate((app) => {
  let collection;
  try {
    collection = app.findCollectionByNameOrId("pbc_2867142091");
  } catch (e) {}
  
  if (!collection) {
    return;
  }

  // Update action field to include new command types
  const actionField = collection.fields.getByName("action");
  if (actionField && actionField.type === "select") {
    actionField.values = [
      "START",
      "STOP", 
      "RECORD_START",
      "RECORD_STOP",
      "SET_STREAM_SETTINGS",
      "SET_VIDEO_SETTINGS",
      "SET_STREAM_ENCODER",
      "SET_AUDIO_SETTINGS",
      "UPLOAD_TO_DRIVE"
    ];
  }

  // Remove max length limit from error_message field for safety
  const errorField = collection.fields.getByName("error_message");
  if (errorField && errorField.type === "text") {
    errorField.max = 0; // 0 for unlimited in 0.22+
  }

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_2867142091");
    if (collection) {
      const actionField = collection.fields.getByName("action");
      if (actionField && actionField.type === "select") {
        actionField.values = ["START", "STOP", "RECORD_START", "RECORD_STOP"];
      }

      const errorField = collection.fields.getByName("error_message");
      if (errorField && errorField.type === "text") {
        errorField.max = 500;
      }

      return app.save(collection);
    }
  } catch (e) {}
})
