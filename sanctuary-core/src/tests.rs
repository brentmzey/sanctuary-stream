#[cfg(test)]
use crate::{Command, CommandAction};
#[cfg(test)]
use serde_json::json;

#[test]
fn test_command_record_deserialization() {
    let data = json!({
        "id": "test_id",
        "action": "START",
        "payload": null,
        "correlation_id": "test_corr",
        "executed": false,
        "created_by": "user_123",
        "error_message": null,
        "created": "2026-03-14T00:00:00Z",
        "updated": "2026-03-14T00:00:00Z"
    });

    let record: Command = serde_json::from_value(data).unwrap();
    assert_eq!(record.id.0, "test_id");
    assert_eq!(record.action, CommandAction::START);
    assert!(!record.executed);
}
