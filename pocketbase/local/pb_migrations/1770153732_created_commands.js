/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "pbc_2867142091",
    "name": "commands",
    "type": "base",
    "system": false,
    "fields": [
      {
        "name": "action",
        "type": "select",
        "required": true,
        "values": ["START", "STOP", "RECORD_START", "RECORD_STOP"]
      },
      {
        "name": "executed",
        "type": "bool",
        "required": true
      },
      {
        "name": "correlation_id",
        "type": "text",
        "required": true,
        "pattern": "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
      },
      {
        "name": "payload",
        "type": "json",
        "required": false
      },
      {
        "name": "created_by",
        "type": "relation",
        "required": true,
        "collectionId": "_pb_users_auth_",
        "cascadeDelete": false,
        "maxSelect": 1
      },
      {
        "name": "error_message",
        "type": "text",
        "required": false,
        "max": 500
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
    "deleteRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2867142091");
  return app.delete(collection);
})