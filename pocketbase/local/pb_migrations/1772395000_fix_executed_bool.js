migrate((app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_2867142091");
    if (!collection) return;

    // Ensure executed field is boolean
    const executedField = collection.fields.getByName("executed");
    if (executedField) {
      executedField.type = "bool";
    }

    return app.save(collection);
  } catch (e) {}
}, (app) => {
  // No rollback needed for type correction
})
