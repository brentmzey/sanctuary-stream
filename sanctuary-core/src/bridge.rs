use std::sync::Arc;
use tokio::sync::Mutex;
use obws::Client as ObsClient;
use eventsource_client::{Client, ClientBuilder, SSE};
use futures_util::StreamExt;
use serde::Deserialize;
use tracing::{info, error, warn};
use reqwest::Client as HttpClient;
use std::time::Duration;
use chrono::Utc;
use crate::drive::upload_to_drive;
use crate::types::{Command, CommandAction};

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct PocketBaseAuthResponse {
    token: String,
    record: PocketBaseUser,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct PocketBaseUser {
    id: String,
}

pub struct SanctuaryBridge {
    obs: Arc<Mutex<Option<ObsClient>>>,
    http: HttpClient,
    pb_url: String,
    stream_id: String,
    auth_token: Arc<Mutex<String>>,
}

impl SanctuaryBridge {
    pub fn new(pb_url: String, stream_id: String) -> Self {
        Self {
            obs: Arc::new(Mutex::new(None)),
            http: HttpClient::new(),
            pb_url,
            stream_id,
            auth_token: Arc::new(Mutex::new(String::new())),
        }
    }

    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        self.authenticate().await?;
        
        let obs_handle = self.obs.clone();
        tokio::spawn(async move {
            while let Err(e) = Self::connect_obs(obs_handle.clone()).await {
                error!("OBS connection failed: {}. Retrying in 5s...", e);
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
        });

        self.subscribe_to_commands().await?;
        self.start_status_loop();

        Ok(())
    }

    async fn authenticate(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let email = std::env::var("BRIDGE_EMAIL").unwrap_or_else(|_| "bridge@local.dev".to_string());
        let password = std::env::var("BRIDGE_PASS").unwrap_or_else(|_| "bridge123456".to_string());

        let url = format!("{}/api/collections/users/auth-with-password", self.pb_url);
        let resp = self.http.post(&url)
            .json(&serde_json::json!({ "identity": email, "password": password }))
            .send()
            .await?
            .json::<PocketBaseAuthResponse>()
            .await?;

        let mut token = self.auth_token.lock().await;
        *token = resp.token;
        info!("✅ Authenticated with PocketBase");
        Ok(())
    }

    async fn connect_obs(handle: Arc<Mutex<Option<ObsClient>>>) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let obs_url = std::env::var("OBS_URL").unwrap_or_else(|_| "localhost".to_string());
        let obs_port = std::env::var("OBS_PORT").unwrap_or_else(|_| "4455".to_string()).parse::<u16>().unwrap_or(4455);
        let obs_pass = std::env::var("OBS_PASS").ok();

        let client = ObsClient::connect(obs_url, obs_port, obs_pass).await?;
        let mut obs = handle.lock().await;
        *obs = Some(client);
        info!("✅ Connected to OBS WebSocket");
        Ok(())
    }

    async fn subscribe_to_commands(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/realtime", self.pb_url);
        let client = ClientBuilder::for_url(&url)?
            .build();

        let mut stream = client.stream();
        let obs_handle = self.obs.clone();
        let http = self.http.clone();
        let pb_url = self.pb_url.clone();
        let auth_token = self.auth_token.clone();

        info!("✅ Subscribed to PocketBase realtime commands");

        tokio::spawn(async move {
            while let Some(event) = stream.next().await {
                match event {
                    Ok(SSE::Event(ev)) => {
                        if ev.event_type == "commands" {
                            if let Ok(data) = serde_json::from_str::<serde_json::Value>(&ev.data) {
                                if data["action"] == "create" {
                                    if let Ok(record) = serde_json::from_value::<Command>(data["record"].clone()) {
                                        if !record.executed {
                                            let obs = obs_handle.clone();
                                            let h = http.clone();
                                            let u = pb_url.clone();
                                            let t = auth_token.clone();
                                            tokio::spawn(async move {
                                                if let Err(e) = Self::execute_command(record, obs, h, u, t).await {
                                                    error!("Command execution failed: {}", e);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    },
                    Err(e) => error!("SSE error: {}", e),
                    _ => {}
                }
            }
        });

        Ok(())
    }

    async fn execute_command(
        command: Command,
        obs_handle: Arc<Mutex<Option<ObsClient>>>,
        http: HttpClient,
        pb_url: String,
        auth_token: Arc<Mutex<String>>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Executing command: {:?}", command.action);
        
        let obs_guard = obs_handle.lock().await;
        let obs = match &*obs_guard {
            Some(o) => o,
            None => return Err("OBS client not connected".into()),
        };

        let result: Result<(), Box<dyn std::error::Error + Send + Sync>> = match command.action {
            CommandAction::START => obs.streaming().start().await.map(|_| ()).map_err(|e| e.into()),
            CommandAction::STOP => obs.streaming().stop().await.map(|_| ()).map_err(|e| e.into()),
            CommandAction::RECORD_START => obs.recording().start().await.map(|_| ()).map_err(|e| e.into()),
            CommandAction::RECORD_STOP => {
                let res = obs.recording().stop().await;
                if let Ok(path) = &res {
                    let path_clone = path.clone();
                    tokio::spawn(async move {
                        if let Err(e) = upload_to_drive(&path_clone).await {
                            error!("Auto-upload to Google Drive failed: {}", e);
                        }
                    });
                }
                res.map(|_| ()).map_err(|e| e.into())
            },
            CommandAction::SET_STREAM_SETTINGS => {
                if let Some(payload) = &command.payload {
                    let service = payload["service"].as_str().unwrap_or("rtmp_common");
                    let server = payload["server"].as_str().unwrap_or("auto");
                    let key = payload["key"].as_str().unwrap_or_default();
                    
                    obs.outputs().set_settings("adv_stream", &serde_json::json!({
                        "service": service,
                        "server": server,
                        "key": key
                    })).await.map(|_| ()).map_err(|e| e.into())
                } else {
                    Err("Missing payload for SET_STREAM_SETTINGS".into())
                }
            },
            _ => {
                warn!("Unhandled command action: {:?}", command.action);
                Ok(())
            }
        };

        let update_url = format!("{}/api/collections/commands/records/{}", pb_url, command.id);
        let token = auth_token.lock().await;

        let mut patch = serde_json::json!({ "executed": true });
        if let Err(ref e) = result {
            patch["error_message"] = serde_json::json!(e.to_string());
            error!("Command execution error: {}", e);
        } else {
            info!("✅ Command executed successfully: {:?}", command.action);
        }

        let _ = http.patch(&update_url)
            .header("Authorization", format!("Bearer {}", *token))
            .json(&patch)
            .send()
            .await;

        Ok(())
    }

    fn start_status_loop(&self) {
        let http = self.http.clone();
        let pb_url = self.pb_url.clone();
        let stream_id = self.stream_id.clone();
        let auth_token = self.auth_token.clone();
        let obs_handle = self.obs.clone();

        tokio::spawn(async move {
            let mut interval = tokio::time::interval(Duration::from_secs(10));
            loop {
                interval.tick().await;
                
                let mut status_update = serde_json::json!({
                    "heartbeat": Utc::now().to_rfc3339()
                });

                // Attempt to get OBS stats
                let obs_guard = obs_handle.lock().await;
                if let Some(obs) = &*obs_guard {
                    if let Ok(stream_status) = obs.streaming().status().await {
                        status_update["status"] = serde_json::json!(if stream_status.active { "live" } else { "idle" });
                        
                        let mut metadata = serde_json::json!({
                            "outputActive": stream_status.active,
                            "outputDuration": stream_status.duration,
                            "outputBytes": stream_status.bytes,
                        });

                        if let Ok(stats) = obs.general().stats().await {
                            metadata["quality"] = serde_json::json!({
                                "fps": stats.active_fps,
                                "cpu_usage": stats.cpu_usage,
                                "dropped_frames": stream_status.skipped_frames,
                            });
                        }
                        status_update["metadata"] = metadata;
                    }
                }

                let token = auth_token.lock().await;
                let url = format!("{}/api/collections/streams/records/{}", pb_url, stream_id);
                
                let _ = http.patch(&url)
                    .header("Authorization", format!("Bearer {}", *token))
                    .json(&status_update)
                    .send()
                    .await;
            }
        });
    }
}
