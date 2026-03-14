use serde::{Deserialize, Serialize};

/// Monadic ID wrapper for type-safe identifiers
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
pub struct Id(pub String);

impl std::fmt::Display for Id {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    Pastor,
    Tech,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Id,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub parish_id: Option<Id>, // Link to their specific instance
    pub created: String,
    pub updated: String,
    pub verified: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Parish {
    pub id: Id,
    pub name: String,
    pub instance_url: String, // e.g. "https://st-marys.pockethost.io"
    pub status: String,       // "active", "trial", "suspended"
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[allow(non_camel_case_types)]
pub enum CommandAction {
    START,
    STOP,
    RECORD_START,
    RECORD_STOP,
    SET_STREAM_SETTINGS,
    SET_VIDEO_SETTINGS,
    SET_STREAM_ENCODER,
    SET_AUDIO_SETTINGS,
    SET_SCENE,
    SET_MUTE,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamInput {
    pub name: String,
    pub muted: bool,
    pub volume: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamMetadata {
    pub scenes: Option<Vec<String>>,
    #[serde(rename = "currentScene")]
    pub current_scene: Option<String>,
    pub inputs: Option<Vec<StreamInput>>,
    #[serde(rename = "outputActive")]
    pub output_active: Option<bool>,
    #[serde(rename = "outputDuration")]
    pub output_duration: Option<u64>,
    #[serde(rename = "outputBytes")]
    pub output_bytes: Option<u64>,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Command {
    pub id: Id,
    pub action: CommandAction,
    pub executed: bool,
    pub correlation_id: String,
    pub payload: Option<serde_json::Value>,
    pub created_by: String,
    pub error_message: Option<String>,
    pub created: String,
    pub updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum StreamStatusValue {
    Idle,
    Live,
    Recording,
    Error,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Stream {
    pub id: Id,
    pub status: StreamStatusValue,
    pub heartbeat: String,
    pub youtube_url: Option<String>,
    pub scene_name: Option<String>,
    pub bitrate: Option<u32>,
    pub fps: Option<f64>,
    pub metadata: Option<StreamMetadata>,
    pub created: String,
    pub updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sermon {
    pub id: Id,
    pub title: String,
    pub body: Option<String>,
    pub sermon_date: String,
    pub youtube_url: Option<String>,
    pub tags: Option<Vec<String>>,
    pub published: bool,
    pub thumbnail: Option<String>,
    pub speaker: Option<String>,
    pub created: String,
    pub updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Announcement {
    pub id: Id,
    pub title: String,
    pub body: Option<String>,
    pub published_at: Option<String>,
    pub expires_at: Option<String>,
    pub priority: Priority,
    pub published: bool,
    pub created: String,
    pub updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Low,
    Normal,
    High,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Resource {
    pub id: Id,
    pub title: String,
    pub description: Option<String>,
    pub file: Option<String>,
    pub url: Option<String>,
    pub category: ResourceCategory,
    pub published: bool,
    pub created: String,
    pub updated: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum ResourceCategory {
    Essay,
    Article,
    Free,
}
