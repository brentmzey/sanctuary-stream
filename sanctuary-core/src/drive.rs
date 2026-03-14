use std::path::Path;
use tokio::fs;
use google_drive3::{api::File as DriveFile, DriveHub, hyper, hyper_rustls};
use yup_oauth2::{InstalledFlowAuthenticator, InstalledFlowReturnMethod};
use tracing::info;
use std::io::Cursor;

pub async fn upload_to_drive(file_path: &str) -> Result<String, Box<dyn std::error::Error + Send + Sync>> {
    let path = Path::new(file_path);
    if !path.exists() {
        return Err(format!("File not found: {}", file_path).into());
    }

    let file_name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("recording.mp4");

    // Authenticate using credentials.json
    let secret = yup_oauth2::read_application_secret("credentials.json").await?;

    let auth = InstalledFlowAuthenticator::builder(
        secret,
        InstalledFlowReturnMethod::HTTPRedirect,
    )
    .persist_tokens_to_disk("token.json")
    .build()
    .await?;

    let https = hyper_rustls::HttpsConnectorBuilder::new()
        .with_native_roots()?
        .https_or_http()
        .enable_http1()
        .build();
    let client = hyper::Client::builder().build(https);
    let hub = DriveHub::new(client, auth);

    info!("Starting upload to Google Drive: {}", file_name);

    let mut req = DriveFile::default();
    req.name = Some(file_name.to_string());

    let content = fs::read(file_path).await?;
    let mut reader = Cursor::new(content);

    let (_response, file) = hub.files()
        .create(req)
        .upload(&mut reader, "video/mp4".parse()?)
        .await?;

    let file_id = file.id.ok_or("Upload succeeded but no file ID returned")?;
    info!("✅ Upload complete! File ID: {}", file_id);

    Ok(file_id)
}
