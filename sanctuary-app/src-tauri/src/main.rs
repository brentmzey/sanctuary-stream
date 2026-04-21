// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use sanctuary_core::{
    Announcement, PBCollection, PocketBaseClient, Resource, SanctuaryBridge, Sermon, StreamMetadata,
    StreamStatus as StreamStatusEnum, User,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{error, info};

struct AppState {
    pb: Arc<Mutex<PocketBaseClient>>,
    stream_id: Arc<Mutex<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct StreamStatus {
    status: StreamStatusEnum,
    youtube_url: Option<String>,
    metadata: Option<StreamMetadata>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AuthResponse {
    token: String,
    user: User,
}

#[derive(Debug, Serialize, Deserialize)]
struct Recording {
    id: String,
    title: String,
    file_id: String,
    stream_id: String,
    duration: Option<f64>,
    size: Option<u64>,
    created: String,
    updated: String,
}

// --- Monadic Helpers ---

/// Converts a Result to a Tauri-compatible String error.
fn to_tauri_res<T, E: std::fmt::Display>(res: Result<T, E>) -> Result<T, String> {
    res.map_err(|e| e.to_string())
}

#[tauri::command]
async fn discover_and_login(
    state: tauri::State<'_, AppState>,
    email: String,
    password: String,
) -> Result<AuthResponse, String> {
    let mut pb = state.pb.lock().await;

    // 1. Discover the parish instance URL from master registry
    let instance_url = pb
        .discover_parish(&email)
        .await
        .map_err(|e| e.to_string())?;
    info!("🚀 Discovered parish instance: {}", instance_url);

    // 2. Switch the client to that specific instance
    pb.set_base_url(instance_url);

    // 3. Perform the actual login on the parish instance
    to_tauri_res(
        pb.login(&email, &password)
            .await
            .map(|(token, user)| AuthResponse { token, user }),
    )
}

#[tauri::command]
async fn set_pocketbase_url(state: tauri::State<'_, AppState>, url: String) -> Result<(), String> {
    let mut pb = state.pb.lock().await;
    pb.set_base_url(url);
    Ok(())
}

#[tauri::command]
async fn test_connection(
    state: tauri::State<'_, AppState>,
    url: Option<String>,
) -> Result<bool, String> {
    let pb = state.pb.lock().await;
    let test_url = url.unwrap_or_else(|| pb.base_url().to_string());

    // Functional check using reqwest status
    let client = reqwest::Client::new();
    match client.get(format!("{}/api/health", test_url)).send().await {
        Ok(resp) => Ok(resp.status().is_success()),
        Err(_) => Ok(false),
    }
}

// --- CMS Commands ---

#[tauri::command]
async fn list_sermons(
    state: tauri::State<'_, AppState>,
    filter: Option<String>,
    sort: Option<String>,
    page: u32,
    per_page: u32,
) -> Result<Vec<Sermon>, String> {
    let pb = state.pb.lock().await;
    to_tauri_res(
        pb.list::<Sermon>(PBCollection::Sermons, page, per_page, filter, sort)
            .await,
    )
}

#[tauri::command]
async fn list_announcements(
    state: tauri::State<'_, AppState>,
    filter: Option<String>,
    sort: Option<String>,
    page: u32,
    per_page: u32,
) -> Result<Vec<Announcement>, String> {
    let pb = state.pb.lock().await;
    to_tauri_res(
        pb.list::<Announcement>(PBCollection::Announcements, page, per_page, filter, sort)
            .await,
    )
}

#[tauri::command]
async fn list_resources(
    state: tauri::State<'_, AppState>,
    filter: Option<String>,
    sort: Option<String>,
    page: u32,
    per_page: u32,
) -> Result<Vec<Resource>, String> {
    let pb = state.pb.lock().await;
    to_tauri_res(
        pb.list::<Resource>(PBCollection::Resources, page, per_page, filter, sort)
            .await,
    )
}

#[tauri::command]
async fn list_recordings(
    state: tauri::State<'_, AppState>,
    stream_id: String,
) -> Result<Vec<Recording>, String> {
    let pb = state.pb.lock().await;
    to_tauri_res(
        pb.list::<Recording>(
            PBCollection::Recordings,
            1,
            50,
            Some(format!("stream_id = '{}'", stream_id)),
            Some("-created".to_string()),
        )
        .await,
    )
}

// --- Core App Commands ---

#[tauri::command]
async fn get_stream_status(state: tauri::State<'_, AppState>) -> Result<StreamStatus, String> {
    let pb = state.pb.lock().await;
    let stream_id = state.stream_id.lock().await;

    let url = format!(
        "{}/api/collections/streams/records/{}",
        pb.base_url(),
        *stream_id
    );
    let client = reqwest::Client::new();

    let res = async {
        client
            .get(&url)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Network: {}", e))?
            .error_for_status()
            .map_err(|e| anyhow::anyhow!("Status: {}", e))?
            .json::<StreamStatus>()
            .await
            .map_err(|e| anyhow::anyhow!("JSON: {}", e))
    }
    .await;

    to_tauri_res(res)
}

#[tauri::command]
async fn send_command(
    state: tauri::State<'_, AppState>,
    action: String,
    payload: Option<serde_json::Value>,
) -> Result<String, String> {
    let pb = state.pb.lock().await;
    let url = format!("{}/api/collections/commands/records", pb.base_url());

    // Monadic check for token
    let token = pb
        .get_token()
        .ok_or_else(|| "Not authenticated".to_string())?;
    let correlation_id = uuid::Uuid::new_v4().to_string();

    // Include payload so commands like SET_SCENE, SET_MUTE, SET_VOLUME
    // carry their arguments through the PocketBase command bus.
    let mut body = serde_json::json!({
        "action": action,
        "executed": false,
        "correlation_id": &correlation_id,
    });
    if let Some(p) = payload {
        body["payload"] = p;
    }

    let client = reqwest::Client::new();
    let res = async {
        client
            .post(&url)
            .header("Authorization", format!("Bearer {}", token))
            .json(&body)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Network: {}", e))?
            .error_for_status()
            .map_err(|e| anyhow::anyhow!("Status: {}", e))
            .map(|_| correlation_id)
    }
    .await;

    to_tauri_res(res)
}

#[tauri::command]
fn show_notification(message: String) -> Result<(), String> {
    info!("Notification: {}", message);
    Ok(())
}

#[tauri::command]
async fn get_file_url(
    state: tauri::State<'_, AppState>,
    collection: String,
    record_id: String,
    file_name: String,
) -> Result<String, String> {
    let pb = state.pb.lock().await;
    Ok(format!(
        "{}/api/files/{}/{}/{}",
        pb.base_url(),
        collection,
        record_id,
        file_name
    ))
}

fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    info!("Starting Sanctuary Stream");

    let pb_url =
        std::env::var("VITE_PB_URL").unwrap_or_else(|_| "http://127.0.0.1:8090".to_string());
    let stream_id = std::env::var("VITE_STREAM_ID").unwrap_or_default();

    let pb = PocketBaseClient::new(pb_url.clone());
    let bridge = SanctuaryBridge::new(pb_url, stream_id.clone());

    let app_state = AppState {
        pb: Arc::new(Mutex::new(pb)),
        stream_id: Arc::new(Mutex::new(stream_id)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|_app| {
            tauri::async_runtime::spawn(async move {
                if let Err(e) = bridge.start().await {
                    error!("Failed to start bridge: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_stream_status,
            send_command,
            show_notification,
            list_sermons,
            list_announcements,
            list_resources,
            list_recordings,
            discover_and_login,
            set_pocketbase_url,
            test_connection,
            get_file_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
