/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2867142091");
  
  if (!collection) {
    console.log("⚠️  Commands collection not found, skipping migration");
    return;
  }

  const executedField = collection.fields.find((f) => f.name === "executed");
  if (executedField) {
    executedField.required = false;
    console.log("✅ Fixed commands.executed field: removed required constraint to allow 'false' values");
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2867142091");
  if (collection) {
    const executedField = collection.fields.find((f) => f.name === "executed");
    if (executedField) {
      executedField.required = true;
    }
    return app.save(collection);
  }
});
