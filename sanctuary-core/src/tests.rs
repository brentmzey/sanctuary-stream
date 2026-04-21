use crate::{Command, CommandAction};
use serde_json::json;

// ── Helpers ──────────────────────────────────────────────────────────────────

fn make_command(action: &str, payload: Option<serde_json::Value>) -> Command {
    let data = json!({
        "id": "test_id",
        "action": action,
        "payload": payload,
        "correlation_id": "test_corr",
        "executed": false,
        "created_by": "user_123",
        "error_message": null,
        "created": "2026-03-14T00:00:00Z",
        "updated": "2026-03-14T00:00:00Z"
    });
    serde_json::from_value(data).expect("command deserialization failed")
}

// ── Original tests ────────────────────────────────────────────────────────────

#[test]
fn test_command_record_deserialization() {
    let record = make_command("START", None);
    assert_eq!(record.id.0, "test_id");
    assert_eq!(record.action, CommandAction::START);
    assert!(!record.executed);
}

// ── New CommandAction variant tests ───────────────────────────────────────────

#[test]
fn test_set_scene_action_parses() {
    let record = make_command(
        "SET_SCENE",
        Some(json!({ "sceneName": "Worship Service" })),
    );
    assert_eq!(record.action, CommandAction::SET_SCENE);
    let scene_name = record
        .payload
        .as_ref()
        .and_then(|p| p["sceneName"].as_str())
        .unwrap_or("");
    assert_eq!(scene_name, "Worship Service");
}

#[test]
fn test_set_mute_action_parses() {
    let record = make_command(
        "SET_MUTE",
        Some(json!({ "inputName": "Desktop Audio", "muted": true })),
    );
    assert_eq!(record.action, CommandAction::SET_MUTE);
    let muted = record
        .payload
        .as_ref()
        .and_then(|p| p["muted"].as_bool())
        .unwrap_or(false);
    assert!(muted);
}

#[test]
fn test_set_volume_action_parses() {
    let record = make_command(
        "SET_VOLUME",
        Some(json!({ "inputName": "Mic/Aux", "volume": 75.0 })),
    );
    assert_eq!(record.action, CommandAction::SET_VOLUME);
    let volume = record
        .payload
        .as_ref()
        .and_then(|p| p["volume"].as_f64())
        .unwrap_or(0.0);
    assert!((volume - 75.0).abs() < f64::EPSILON);
}

#[test]
fn test_set_overlay_action_parses() {
    let record = make_command(
        "SET_OVERLAY",
        Some(json!({ "overlayId": 1, "active": true, "type": "lower-third" })),
    );
    assert_eq!(record.action, CommandAction::SET_OVERLAY);
}

#[test]
fn test_fade_to_black_action_parses() {
    let record = make_command("FADE_TO_BLACK", Some(json!({ "active": true })));
    assert_eq!(record.action, CommandAction::FADE_TO_BLACK);
    let active = record
        .payload
        .as_ref()
        .and_then(|p| p["active"].as_bool())
        .unwrap_or(false);
    assert!(active);
}

#[test]
fn test_apply_transition_action_parses() {
    let record = make_command("APPLY_TRANSITION", Some(json!({ "action": "restart" })));
    assert_eq!(record.action, CommandAction::APPLY_TRANSITION);
}

#[test]
fn test_upload_to_drive_action_parses() {
    let record = make_command("UPLOAD_TO_DRIVE", None);
    assert_eq!(record.action, CommandAction::UPLOAD_TO_DRIVE);
}

#[test]
fn test_null_payload_is_ok() {
    // Commands like START/STOP don't need a payload
    let record = make_command("STOP", None);
    assert_eq!(record.action, CommandAction::STOP);
    assert!(record.payload.is_none());
}
