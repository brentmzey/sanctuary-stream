/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2867142091");
  
  if (!collection) {
    console.log("⚠️  Commands collection not found, skipping migration");
    return;
  }

  // Update action field to include new command types
  const actionField = collection.fields.find((f) => f.name === "action");
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
    console.log("✅ Updated commands.action field with new values");
  }

  // Remove max length limit from error_message field for safety
  const errorField = collection.fields.find((f) => f.name === "error_message");
  if (errorField && errorField.type === "text") {
    delete errorField.max;
    console.log("✅ Removed max length limit from commands.error_message");
  }

  return app.save(collection);
}, (app) => {
  // Rollback: restore original values
  const collection = app.findCollectionByNameOrId("pbc_2867142091");
  
  if (!collection) {
    return;
  }

  const actionField = collection.fields.find((f) => f.name === "action");
  if (actionField && actionField.type === "select") {
    actionField.values = ["START", "STOP", "RECORD_START", "RECORD_STOP"];
  }

  const errorField = collection.fields.find((f) => f.name === "error_message");
  if (errorField && errorField.type === "text") {
    errorField.max = 500;
  }

  return app.save(collection);
});
