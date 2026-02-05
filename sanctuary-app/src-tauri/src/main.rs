// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, Window};
use tracing::info;

#[derive(Debug, Serialize, Deserialize)]
struct StreamStatus {
    status: String,
    youtube_url: Option<String>,
    metadata: Option<serde_json::Value>,
}

// Tauri commands
#[tauri::command]
async fn get_stream_status(pocketbase_url: String, stream_id: String) -> Result<StreamStatus, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/api/collections/streams/records/{}", pocketbase_url, stream_id);
    
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if response.status().is_success() {
        let status: StreamStatus = response
            .json()
            .await
            .map_err(|e| format!("JSON parse failed: {}", e))?;
        Ok(status)
    } else {
        Err(format!("API error: {}", response.status()))
    }
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
    
    let response = client
        .post(&url)
        .header("Authorization", auth_token)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;
    
    if response.status().is_success() {
        Ok(correlation_id)
    } else {
        Err(format!("API error: {}", response.status()))
    }
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

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(quit);
    
    SystemTray::new().with_menu(tray_menu)
}

fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();
    
    info!("Starting Sanctuary Stream");
    
    let tray = create_system_tray();
    
    let mut builder = tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => std::process::exit(0),
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                }
                _ => {}
            },
            _ => {}
        });
    
    // Register base commands
    builder = builder.invoke_handler(tauri::generate_handler![
        get_stream_status,
        send_command,
        show_notification,
    ]);
    
    // Register AWS commands if feature enabled
    #[cfg(feature = "cloud-aws")]
    {
        builder = builder.invoke_handler(tauri::generate_handler![
            get_stream_status,
            send_command,
            show_notification,
            upload_to_s3,
            send_to_sqs,
        ]);
    }
    
    // Register RabbitMQ commands if feature enabled
    #[cfg(feature = "cloud-rabbitmq")]
    {
        builder = builder.invoke_handler(tauri::generate_handler![
            get_stream_status,
            send_command,
            show_notification,
            publish_to_rabbitmq,
        ]);
    }
    
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
