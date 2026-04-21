use crate::pocketbase::PBCollection;
use crate::types::{Command, CommandAction, StreamStatus};
use crate::drive::upload_to_drive;
use chrono::Utc;
use eventsource_client::{Client, ClientBuilder, SSE};
use futures_util::StreamExt;
use obws::Client as ObsClient;
use reqwest::Client as HttpClient;
use serde::Deserialize;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;
use tracing::{error, info, warn};

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct PocketBaseAuthResponse {
    token: String,
    #[serde(alias = "user")]
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
        let email =
            std::env::var("BRIDGE_EMAIL").unwrap_or_else(|_| "bridge@local.dev".to_string());
        let password = std::env::var("BRIDGE_PASS").unwrap_or_else(|_| "bridge123456".to_string());

        // SaaS Resilience: Try superuser first, then regular user
        let endpoints = [
            format!(
                "{}/api/collections/_superusers/auth-with-password",
                self.pb_url
            ),
            format!("{}/api/collections/{}/auth-with-password", self.pb_url, PBCollection::Users),
        ];

        let mut last_err = None;
        for url in endpoints {
            let resp = self
                .http
                .post(&url)
                .json(&serde_json::json!({ "identity": email, "password": password }))
                .send()
                .await;

            if let Ok(r) = resp {
                if r.status().is_success() {
                    if let Ok(auth_data) = r.json::<PocketBaseAuthResponse>().await {
                        let mut token = self.auth_token.lock().await;
                        *token = auth_data.token;
                        info!("✅ Authenticated with PocketBase ({})", url);
                        return Ok(());
                    }
                } else {
                    last_err = Some(format!("{}: {}", url, r.status()));
                }
            } else if let Err(e) = resp {
                last_err = Some(e.to_string());
            }
        }

        Err(format!(
            "PocketBase authentication failed. Last error: {:?}",
            last_err
        )
        .into())
    }

    async fn connect_obs(
        handle: Arc<Mutex<Option<ObsClient>>>,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let obs_url = std::env::var("OBS_URL").unwrap_or_else(|_| "localhost".to_string());
        let obs_port = std::env::var("OBS_PORT")
            .unwrap_or_else(|_| "4455".to_string())
            .parse::<u16>()
            .unwrap_or(4455);
        let obs_pass = std::env::var("OBS_PASS").ok();

        let client = ObsClient::connect(obs_url, obs_port, obs_pass).await?;
        let mut obs = handle.lock().await;
        *obs = Some(client);
        info!("✅ Connected to OBS WebSocket");
        Ok(())
    }

    async fn subscribe_to_commands(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let url = format!("{}/api/realtime", self.pb_url);
        let client = ClientBuilder::for_url(&url)?.build();

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
                        if ev.event_type == PBCollection::Commands.to_string() {
                            if let Ok(data) = serde_json::from_str::<serde_json::Value>(&ev.data) {
                                if data["action"] == "create" {
                                    if let Ok(record) =
                                        serde_json::from_value::<Command>(data["record"].clone())
                                    {
                                        if !record.executed {
                                            let obs = obs_handle.clone();
                                            let h = http.clone();
                                            let u = pb_url.clone();
                                            let t = auth_token.clone();
                                            tokio::spawn(async move {
                                                if let Err(e) =
                                                    Self::execute_command(record, obs, h, u, t)
                                                        .await
                                                {
                                                    error!("Command execution failed: {}", e);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
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
            // ── Streaming ──────────────────────────────────────────────────
            CommandAction::START => obs
                .streaming()
                .start()
                .await
                .map(|_| ())
                .map_err(|e| e.into()),

            CommandAction::STOP => obs
                .streaming()
                .stop()
                .await
                .map(|_| ())
                .map_err(|e| e.into()),

            // ── Recording ──────────────────────────────────────────────────
            CommandAction::RECORD_START => obs
                .recording()
                .start()
                .await
                .map(|_| ())
                .map_err(|e| e.into()),

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
            }

            // ── Scene switching ─────────────────────────────────────────────
            // Both the Production Switcher (remote/local) and direct CUT/AUTO
            // use this. Payload: { "sceneName": "Worship Service" }
            CommandAction::SET_SCENE => {
                if let Some(payload) = &command.payload {
                    let scene_name = payload["sceneName"]
                        .as_str()
                        .ok_or("SET_SCENE: missing sceneName in payload")?;
                    obs.scenes()
                        .set_current_program_scene(scene_name)
                        .await
                        .map_err(|e: obws::Error| -> Box<dyn std::error::Error + Send + Sync> { e.into() })
                } else {
                    Err("SET_SCENE: payload is required".into())
                }
            }

            // ── Audio: mute toggle ──────────────────────────────────────────
            // Payload: { "inputName": "Desktop Audio", "muted": true }
            CommandAction::SET_MUTE => {
                if let Some(payload) = &command.payload {
                    let input_name = payload["inputName"]
                        .as_str()
                        .ok_or("SET_MUTE: missing inputName")?;
                    let muted = payload["muted"]
                        .as_bool()
                        .ok_or("SET_MUTE: missing muted (bool)")?;
                    obs.inputs()
                        .set_muted(obws::requests::inputs::InputId::Name(input_name), muted)
                        .await
                        .map_err(|e: obws::Error| -> Box<dyn std::error::Error + Send + Sync> { e.into() })
                } else {
                    Err("SET_MUTE: payload is required".into())
                }
            }

            // ── Audio: fader volume ─────────────────────────────────────────
            // Payload: { "inputName": "Mic/Aux", "volume": 85 }   (0–100 %)
            // OBS uses two volume representations:
            //   - Mul (0.0–1.0) for linear volume
            //   - dB  (−∞ to 0) for decibels
            // We accept 0–100 from the UI and convert to mul.
            CommandAction::SET_VOLUME => {
                if let Some(payload) = &command.payload {
                    let input_name = payload["inputName"]
                        .as_str()
                        .ok_or("SET_VOLUME: missing inputName")?;
                    let pct = payload["volume"]
                        .as_f64()
                        .ok_or("SET_VOLUME: missing volume (number 0–100)")?;
                    // Convert 0–100 % → 0.0–1.0 mul
                    let volume_mul = (pct / 100.0).clamp(0.0, 1.0) as f32;
                    obs.inputs()
                        .set_volume(
                            obws::requests::inputs::InputId::Name(input_name),
                            obws::requests::inputs::Volume::Mul(volume_mul),
                        )
                        .await
                        .map_err(|e: obws::Error| -> Box<dyn std::error::Error + Send + Sync> { e.into() })
                } else {
                    Err("SET_VOLUME: payload is required".into())
                }
            }

            // ── Stream output settings ──────────────────────────────────────
            CommandAction::SET_STREAM_SETTINGS => {
                if let Some(payload) = &command.payload {
                    let service = payload["service"].as_str().unwrap_or("rtmp_common");
                    let server = payload["server"].as_str().unwrap_or("auto");
                    let key = payload["key"].as_str().unwrap_or_default();

                    obs.outputs()
                        .set_settings(
                            "adv_stream",
                            &serde_json::json!({
                                "service": service,
                                "server": server,
                                "key": key
                            }),
                        )
                        .await
                        .map(|_| ())
                        .map_err(|e| e.into())
                } else {
                    Err("Missing payload for SET_STREAM_SETTINGS".into())
                }
            }

            // ── Video output settings ───────────────────────────────────────
            // Payload: { "baseWidth": 1920, "baseHeight": 1080,
            //            "outputWidth": 1280, "outputHeight": 720, "fps": 30 }
            CommandAction::SET_VIDEO_SETTINGS => {
                if let Some(payload) = &command.payload {
                    use obws::requests::config::SetVideoSettings;
                    let base_width = payload["baseWidth"].as_u64().unwrap_or(1920) as u32;
                    let base_height = payload["baseHeight"].as_u64().unwrap_or(1080) as u32;
                    let output_width = payload["outputWidth"].as_u64().unwrap_or(1280) as u32;
                    let output_height = payload["outputHeight"].as_u64().unwrap_or(720) as u32;
                    let fps_num = payload["fps"].as_u64().unwrap_or(30) as u32;

                    obs.config()
                        .set_video_settings(SetVideoSettings {
                            base_width: Some(base_width),
                            base_height: Some(base_height),
                            output_width: Some(output_width),
                            output_height: Some(output_height),
                            fps_numerator: Some(fps_num),
                            fps_denominator: Some(1),
                        })
                        .await
                        .map_err(|e| e.into())
                } else {
                    Err("Missing payload for SET_VIDEO_SETTINGS".into())
                }
            }

            // ── Transition restart ──────────────────────────────────────────
            // APPLY_TRANSITION with action="restart" re-sends the current scene
            // to trigger OBS transition animation.
            CommandAction::APPLY_TRANSITION => {
                if let Some(payload) = &command.payload {
                    if payload["action"].as_str() == Some("restart") {
                        match obs.scenes().current_program_scene().await {
                            Ok(scene) => {
                                let name = scene.id.name.clone();
                                obs.scenes()
                                    .set_current_program_scene(name.as_str())
                                    .await
                                    .map_err(|e: obws::Error| -> Box<dyn std::error::Error + Send + Sync> { e.into() })
                            }
                            Err(e) => Err(e.into()),
                        }
                    } else {
                        info!("APPLY_TRANSITION: no-op for action={:?}", payload["action"]);
                        Ok(())
                    }
                } else {
                    Ok(())
                }
            }

            // ── UI-only commands (no direct OBS equivalent) ─────────────────
            // SET_OVERLAY and FADE_TO_BLACK are handled purely in the React UI.
            // We acknowledge them here so they're marked executed=true.
            CommandAction::SET_OVERLAY => {
                info!(
                    "SET_OVERLAY: acknowledged (UI-only) id={:?}",
                    command.payload.as_ref().and_then(|p| p["overlayId"].as_u64())
                );
                Ok(())
            }

            CommandAction::FADE_TO_BLACK => {
                info!(
                    "FADE_TO_BLACK: acknowledged (UI-only) active={:?}",
                    command.payload.as_ref().and_then(|p| p["active"].as_bool())
                );
                Ok(())
            }

            // ── Catch-all for currently-unimplemented variants ──────────────
            CommandAction::SET_STREAM_ENCODER
            | CommandAction::SET_AUDIO_SETTINGS
            | CommandAction::UPLOAD_TO_DRIVE => {
                warn!("Unhandled command action: {:?}", command.action);
                Ok(())
            }
        };

        // Mark command as executed (or failed) in PocketBase
        let update_url = format!("{}/api/collections/{}/records/{}", pb_url, PBCollection::Commands, command.id);
        let token = auth_token.lock().await;

        let mut patch = serde_json::json!({ "executed": true });
        if let Err(ref e) = result {
            let err_str = format!("{}", e);
            patch["error_message"] = serde_json::json!(err_str);
            error!("Command execution error: {}", e);
        } else {
            info!("✅ Command executed successfully: {:?}", command.action);
        }

        let _ = http
            .patch(&update_url)
            .header("Authorization", format!("Bearer {}", *token))
            .json(&patch)
            .send()
            .await;

        Ok(())
    }

    /// Status loop: polls OBS every 10 seconds and pushes a rich metadata
    /// snapshot to PocketBase. All connected clients (remote tablets, phones,
    /// desktop) receive the update via PocketBase SSE realtime.
    ///
    /// Published fields:
    ///   status          – "live" | "idle" | "recording"
    ///   heartbeat       – ISO-8601 timestamp
    ///   metadata:
    ///     outputActive    – bool
    ///     outputDuration  – ms
    ///     outputBytes     – bytes
    ///     quality.fps     – frames/s
    ///     quality.cpu_usage
    ///     quality.dropped_frames
    ///     scenes          – ["Scene 1", "Worship", ...]  ← NEW
    ///     currentScene    – "Worship"                   ← NEW
    ///     inputs          – [{ name, muted, volume }]   ← NEW
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

                let obs_guard = obs_handle.lock().await;
                if let Some(obs) = &*obs_guard {
                    // ── Stream / recording status ─────────────────────────
                    let is_streaming = obs
                        .streaming()
                        .status()
                        .await
                        .map(|s| s.active)
                        .unwrap_or(false);
                    let is_recording = obs
                        .recording()
                        .status()
                        .await
                        .map(|s| s.active)
                        .unwrap_or(false);

                    status_update["status"] = serde_json::json!(
                        if is_streaming { StreamStatus::Live }
                        else if is_recording { StreamStatus::Recording }
                        else { StreamStatus::Idle }
                    );

                    let mut metadata = serde_json::json!({});

                    // ── Streaming output metrics ──────────────────────────
                    if let Ok(stream_status) = obs.streaming().status().await {
                        metadata["outputActive"] = serde_json::json!(stream_status.active);
                        // time::Duration uses .whole_milliseconds() in obws 0.12
                        metadata["outputDuration"] = serde_json::json!(stream_status.duration.whole_milliseconds() as u64);
                        metadata["outputBytes"] = serde_json::json!(stream_status.bytes);

                        if let Ok(stats) = obs.general().stats().await {
                            metadata["quality"] = serde_json::json!({
                                "fps": stats.active_fps,
                                "cpu_usage": stats.cpu_usage,
                                "dropped_frames": stream_status.skipped_frames,
                            });
                        }
                    }

                    // ── Scene list + current scene ─────────────────────────
                    // These power the Production Switcher scene bus on all
                    // connected remote devices.
                    if let Ok(scene_list) = obs.scenes().list().await {
                        let scene_names: Vec<String> = scene_list
                            .scenes
                            .iter()
                            .map(|s| s.name.clone())
                            .collect();
                        metadata["scenes"] = serde_json::json!(scene_names);
                        // obws 0.12 field is `current_program_scene`
                        metadata["currentScene"] = serde_json::json!(scene_list.current_program_scene);
                    }

                    // ── Audio inputs (name + muted + volume) ──────────────
                    // Powers the AudioMixer channel strips on all clients.
                    if let Ok(input_list) = obs.inputs().list(None).await {
                        let mut inputs_json = Vec::new();
                        for input in &input_list {
                            // obws 0.12: input.id.name, and muted() / volume()
                            let input_id = obws::requests::inputs::InputId::Name(&input.id.name);
                            let muted = obs
                                .inputs()
                                .muted(input_id)
                                .await
                                .unwrap_or(false);
                            let volume_id = obws::requests::inputs::InputId::Name(&input.id.name);
                            let volume = obs
                                .inputs()
                                .volume(volume_id)
                                .await
                                // obws 0.12 returns InputVolume { mul: f32, db: f32 }
                                .map(|v| (v.mul as f64 * 100.0).clamp(0.0, 100.0))
                                .unwrap_or(100.0);

                            inputs_json.push(serde_json::json!({
                                "name": input.id.name,
                                "muted": muted,
                                "volume": volume,
                            }));
                        }
                        metadata["inputs"] = serde_json::json!(inputs_json);
                    }

                    status_update["metadata"] = metadata;
                }

                let token = auth_token.lock().await;
                let url = format!("{}/api/collections/{}/records/{}", pb_url, PBCollection::Streams, stream_id);

                let _ = http
                    .patch(&url)
                    .header("Authorization", format!("Bearer {}", *token))
                    .json(&status_update)
                    .send()
                    .await;
            }
        });
    }
}
