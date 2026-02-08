// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::Manager;
use tracing::info;

#[derive(Debug, Serialize, Deserialize)]
struct StreamQualityMetrics {
    fps: Option<f64>,
    bitrate: Option<u64>,
    dropped_frames: Option<u64>,
    cpu_usage: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct StreamMetadata {
    #[serde(rename = "outputActive")]
    output_active: Option<bool>,
    #[serde(rename = "outputDuration")]
    output_duration: Option<u64>,
    #[serde(rename = "outputBytes")]
    output_bytes: Option<u64>,
    quality: Option<StreamQualityMetrics>,
}

#[derive(Debug, Serialize, Deserialize)]
struct StreamStatus {
    status: String,
    youtube_url: Option<String>,
    metadata: Option<StreamMetadata>,
}

// Tauri commands
#[tauri::command]
async fn get_stream_status(pocketbase_url: String, stream_id: String) -> Result<StreamStatus, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/collections/streams/records/{}", pocketbase_url, stream_id);
    
    client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))
        .and_then(|response| {
            if response.status().is_success() {
                Ok(response)
            } else {
                Err(format!("API error: {}", response.status()))
            }
        })?
        .json::<StreamStatus>()
        .await
        .map_err(|e| format!("JSON parse failed: {}", e))
}

#[tauri::command]
async fn send_command(
    pocketbase_url: String,
    action: String,
    auth_token: String,
    user_id: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/collections/commands/records", pocketbase_url);
    
    let correlation_id = uuid::Uuid::new_v4().to_string();
    
    let payload = serde_json::json!({
        "action": action,
        "executed": false,
        "correlation_id": correlation_id,
        "created_by": user_id,
    });
    
    client
        .post(&url)
        .header("Authorization", auth_token)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))
        .and_then(|response| {
            if response.status().is_success() {
                Ok(correlation_id)
            } else {
                Err(format!("API error: {}", response.status()))
            }
        })
}

#[tauri::command]
fn show_notification(message: String) -> Result<(), String> {
    info!("Notification: {}", message);
    Ok(())
}

// Cloud AWS integration (optional feature)
#[cfg(feature = "cloud-aws")]
#[tauri::command]
async fn upload_to_s3(bucket: String, key: String, data: Vec<u8>) -> Result<String, String> {
    use aws_sdk_s3::Client;
    let config = aws_config::load_from_env().await;
    let client = Client::new(&config);
    
    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .body(data.into())
        .send()
        .await
        .map_err(|e| format!("S3 upload failed: {}", e))?;
    
    Ok("Uploaded successfully".to_string())
}

#[cfg(feature = "cloud-aws")]
#[tauri::command]
async fn send_to_sqs(queue_url: String, message: String) -> Result<String, String> {
    use aws_sdk_sqs::Client;
    let config = aws_config::load_from_env().await;
    let client = Client::new(&config);
    
    client
        .send_message()
        .queue_url(queue_url)
        .message_body(message)
        .send()
        .await
        .map_err(|e| format!("SQS send failed: {}", e))?;
    
    Ok("Sent to SQS successfully".to_string())
}

// RabbitMQ integration (optional feature)
#[cfg(feature = "cloud-rabbitmq")]
#[tauri::command]
async fn publish_to_rabbitmq(url: String, exchange: String, routing_key: String, message: String) -> Result<String, String> {
    use lapin::{Connection, ConnectionProperties, options::*, types::FieldTable};
    
    let conn = Connection::connect(&url, ConnectionProperties::default())
        .await
        .map_err(|e| format!("RabbitMQ connection failed: {}", e))?;
    
    let channel = conn.create_channel().await
        .map_err(|e| format!("Channel creation failed: {}", e))?;
    
    channel
        .basic_publish(
            &exchange,
            &routing_key,
            BasicPublishOptions::default(),
            message.as_bytes(),
            lapin::BasicProperties::default(),
        )
        .await
        .map_err(|e| format!("Publish failed: {}", e))?;
    
    Ok("Published to RabbitMQ successfully".to_string())
}

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();
    
    info!("Starting Sanctuary Stream");
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_stream_status,
            send_command,
            show_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
