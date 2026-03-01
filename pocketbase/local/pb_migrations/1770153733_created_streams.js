/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "pbc_1849560702",
    "name": "streams",
    "type": "base",
    "system": false,
    "fields": [
      {
        "name": "status",
        "type": "select",
        "required": true,
        "values": ["idle", "starting", "live", "recording", "error"]
      },
      {
        "name": "heartbeat",
        "type": "date",
        "required": true
      },
      {
        "name": "youtube_url",
        "type": "url",
        "required": false,
        "onlyDomains": ["youtube.com", "youtu.be"]
      },
      {
        "name": "scene_name",
        "type": "text",
        "required": false,
        "max": 100
      },
      {
        "name": "bitrate",
        "type": "number",
        "required": false,
        "noDecimal": true
      },
      {
        "name": "fps",
        "type": "number",
        "required": false
      },
      {
        "name": "metadata",
        "type": "json",
        "required": false
      }
    ],
    "indexes": [
      "CREATE INDEX idx_status ON streams (status)",
      "CREATE INDEX idx_heartbeat ON streams (heartbeat)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": null,
    "updateRule": "@request.auth.role = 'tech'",
    "deleteRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1849560702");
  return app.delete(collection);
})
