#[cfg(test)]
mod tests {
    use crate::bridge::{CommandRecord, SanctuaryBridge};
    use serde_json::json;

    #[test]
    fn test_command_record_deserialization() {
        let data = json!({
            "id": "test_id",
            "action": "START",
            "payload": null,
            "correlation_id": "test_corr",
            "executed": false
        });

        let record: CommandRecord = serde_json::from_value(data).unwrap();
        assert_eq!(record.id, "test_id");
        assert_eq!(record.action, "START");
        assert!(!record.executed);
    }

    #[test]
    fn test_bridge_initialization() {
        let pb_url = "http://localhost:8090".to_string();
        let stream_id = "stream_123".to_string();
        let bridge = SanctuaryBridge::new(pb_url, stream_id);
        
        // Basic check that we can create the bridge
        // (Internal fields are private, so we just check it doesn't panic)
    }

    // Since bridge relies heavily on network (OBS/PocketBase), 
    // we would ideally use a mock server for more extensive testing.
    // For now, we focus on logic that can be isolated.
}
