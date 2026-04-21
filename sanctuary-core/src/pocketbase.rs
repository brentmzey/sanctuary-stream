use crate::types::*;
use anyhow::{anyhow, Result};
use reqwest::{Client as HttpClient, RequestBuilder};
use serde::Deserialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PBCollection {
    Users,
    Commands,
    Streams,
    Announcements,
    Sermons,
    Resources,
    Recordings,
}

impl std::fmt::Display for PBCollection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            PBCollection::Users => "users",
            PBCollection::Commands => "commands",
            PBCollection::Streams => "streams",
            PBCollection::Announcements => "announcements",
            PBCollection::Sermons => "sermons",
            PBCollection::Resources => "resources",
            PBCollection::Recordings => "recordings",
        };
        write!(f, "{}", s)
    }
}

/// A functional, immutable-first PocketBase client.
#[derive(Clone)]
pub struct PocketBaseClient {
    http: HttpClient,
    base_url: String,
    auth_token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListResponse<T> {
    pub items: Vec<T>,
}

impl PocketBaseClient {
    pub fn new(base_url: String) -> Self {
        Self {
            http: HttpClient::new(),
            base_url,
            auth_token: None,
        }
    }

    /// Functional "With" pattern for immutable configuration.
    pub fn with_token(&self, token: Option<String>) -> Self {
        let mut cloned = self.clone();
        cloned.auth_token = token;
        cloned
    }

    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    /// Monadic composition: Builds a request and applies auth if present.
    fn authenticated_request(&self, builder: RequestBuilder) -> RequestBuilder {
        if let Some(token) = &self.auth_token {
            builder.header("Authorization", format!("Bearer {}", token))
        } else {
            builder
        }
    }

    /// Pure transformation: List records using monadic chaining.
    pub async fn list<T: for<'de> Deserialize<'de>>(
        &self,
        collection: PBCollection,
        page: u32,
        per_page: u32,
        filter: Option<String>,
        sort: Option<String>,
    ) -> Result<Vec<T>> {
        let url = format!("{}/api/collections/{}/records", self.base_url, collection);
        let query = [
            ("page", Some(page.to_string())),
            ("perPage", Some(per_page.to_string())),
            ("filter", filter),
            ("sort", sort),
        ];

        let builder = self.http.get(&url).query(&query);

        self.authenticated_request(builder)
            .send()
            .await
            .map_err(|e| anyhow!("Network error: {}", e))?
            .error_for_status()
            .map_err(|e| anyhow!("PocketBase API error: {}", e))?
            .json::<ListResponse<T>>()
            .await
            .map(|resp| resp.items)
            .map_err(|e| anyhow!("JSON deserialization error: {}", e))
    }

    /// Monadic Get One: Chains Result transformations.
    pub async fn get_one<T: for<'de> Deserialize<'de>>(
        &self,
        collection: PBCollection,
        id: &str,
    ) -> Result<T> {
        let url = format!(
            "{}/api/collections/{}/records/{}",
            self.base_url, collection, id
        );
        let builder = self.http.get(&url);

        self.authenticated_request(builder)
            .send()
            .await
            .map_err(|e| anyhow!("Network error: {}", e))?
            .error_for_status()
            .map_err(|e| anyhow!("PocketBase API error: {}", e))?
            .json::<T>()
            .await
            .map_err(|e| anyhow!("JSON deserialization error: {}", e))
    }

    pub async fn login(&self, email: &str, password: &str) -> Result<(String, User)> {
        let url = format!("{}/api/collections/{}/auth-with-password", self.base_url, PBCollection::Users);

        let resp = self
            .http
            .post(&url)
            .json(&serde_json::json!({ "identity": email, "password": password }))
            .send()
            .await
            .map_err(|e| anyhow!("Auth request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(anyhow!(
                "Authentication failed with status: {}",
                resp.status()
            ));
        }

        let auth_resp: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| anyhow!("Failed to parse auth response: {}", e))?;

        let token = auth_resp["token"]
            .as_str()
            .ok_or_else(|| anyhow!("Token missing in response"))?
            .to_string();

        let user: User = serde_json::from_value(auth_resp["record"].clone())
            .map_err(|e| anyhow!("Failed to deserialize user record: {}", e))?;

        Ok((token, user))
    }

    /// SaaS Discovery: Finds the specific instance URL for a user email.
    /// This connects to the 'Master Registry' instance. Falls back to base_url for single-tenant local setups.
    pub async fn discover_parish(&self, email: &str) -> Result<String> {
        let url = format!("{}/api/collections/parish_lookup/records", self.base_url);
        let query = [("filter", format!("email = '{}'", email))];

        let resp_result = self.http.get(&url).query(&query).send().await;

        if let Ok(resp) = resp_result {
            if resp.status().is_success() {
                let json: serde_json::Value = resp.json().await.unwrap_or_default();
                if let Some(items) = json.get("items").and_then(|i| i.as_array()) {
                    if !items.is_empty() {
                        if let Some(instance_url) =
                            items[0].get("instance_url").and_then(|u| u.as_str())
                        {
                            return Ok(instance_url.to_string());
                        }
                    }
                }
            }
        }

        // Fallback for local development / single-tenant instances
        Ok(self.base_url.clone())
    }

    pub fn set_base_url(&mut self, url: String) {
        self.base_url = url;
        self.auth_token = None;
    }

    pub fn get_token(&self) -> Option<String> {
        self.auth_token.clone()
    }
}
