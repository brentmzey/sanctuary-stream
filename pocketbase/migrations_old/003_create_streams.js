/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_1849560702",
    "created": "2024-01-01 00:00:02.000Z",
    "updated": "2024-01-01 00:00:02.000Z",
    "name": "streams",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "status",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "idle",
            "live",
            "recording",
            "error"
          ]
        }
      },
      {
        "system": false,
        "id": "heartbeat",
        "name": "heartbeat",
        "type": "date",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "youtube_url",
        "name": "youtube_url",
        "type": "url",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": ["youtube.com", "youtu.be"]
        }
      },
      {
        "system": false,
        "id": "scene_name",
        "name": "scene_name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "bitrate",
        "name": "bitrate",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "fps",
        "name": "fps",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 120,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "metadata",
        "name": "metadata",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
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
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_1849560702");

  return dao.deleteCollection(collection);
})
