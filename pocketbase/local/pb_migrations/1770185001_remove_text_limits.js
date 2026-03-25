migrate((app) => {
  const collections = ["sermons", "announcements", "resources"];
  
  for (const name of collections) {
    try {
      const collection = app.findCollectionByNameOrId(name);
      if (!collection) continue;

      const brotliField = collection.fields.find(f => f.name.includes("BrotliBase64"));
      if (brotliField && brotliField.type === "text") {
        brotliField.max = 0; // Unlimited
        app.save(collection);
      }
    } catch (e) {
      // Ignore if collection not yet created (idempotency)
    }
  }
}, (app) => {
  // Safe to leave as unlimited
})
