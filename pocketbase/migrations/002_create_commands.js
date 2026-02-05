/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pbc_2867142091",
    "created": "2024-01-01 00:00:01.000Z",
    "updated": "2024-01-01 00:00:01.000Z",
    "name": "commands",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "action",
        "name": "action",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "START",
            "STOP",
            "RECORD_START",
            "RECORD_STOP"
          ]
        }
      },
      {
        "system": false,
        "id": "executed",
        "name": "executed",
        "type": "bool",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "correlation_id",
        "name": "correlation_id",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 36,
          "max": 36,
          "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
        }
      },
      {
        "system": false,
        "id": "payload",
        "name": "payload",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "created_by",
        "name": "created_by",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "pbc_3142635823",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["email", "name"]
        }
      },
      {
        "system": false,
        "id": "error_message",
        "name": "error_message",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 500,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX idx_correlation_id ON commands (correlation_id)",
      "CREATE INDEX idx_executed ON commands (executed)",
      "CREATE INDEX idx_created_by ON commands (created_by)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'pastor'",
    "updateRule": "@request.auth.role = 'tech'",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_2867142091");

  return dao.deleteCollection(collection);
})
