# 🔌 Integrations Guide

This guide explains how to set up external integrations for Sanctuary Stream.

## 📺 YouTube & Twitch Streaming

Sanctuary Stream allows you to configure your stream destination directly from the app control panel.

### Setup
1. Open the Sanctuary Stream App.
2. Log in as an **Admin** or **Pastor**.
3. In the main control dashboard, click **⚙️ Stream Settings** (below the control buttons).
4. Select your platform:
   - **YouTube Live**: Use the "YouTube - RTMPS" service.
   - **Twitch**: Use the "Twitch" service.
   - **Custom**: Enter your custom RTMP server URL.
5. Paste your **Stream Key** (from YouTube Studio or Twitch Dashboard).
6. Click **Apply to OBS**.

> **Note:** This updates the OBS configuration immediately. You must have OBS running and connected to the bridge.

---

## ☁️ Google Drive Auto-Upload

Sanctuary Stream can automatically upload your local recordings to Google Drive immediately after you stop recording.

### Prerequisites
1. A Google Cloud Project with the **Google Drive API** enabled.
2. OAuth 2.0 Credentials (client ID and secret).

### Setup Instructions

#### 1. Create Google Cloud Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for "Google Drive API" and **Enable** it.
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - Application Type: **Desktop App**.
   - Name: "Sanctuary Stream Bridge".
5. Download the JSON file.

#### 2. Install Credentials
1. Rename the downloaded file to `credentials.json`.
2. Place this file in the `sanctuary-bridge` folder (where the bridge service runs).

#### 3. First Run Authorization
The first time the bridge tries to upload (or when you start it), it may need authorization.
1. Check the Bridge logs (console output).
2. If prompted, copy the URL provided in the logs.
3. Paste it into your browser and authorize the app.
4. Copy the code or follow instructions to save the `token.json` file in the `sanctuary-bridge` folder.

> **Automatic:** Once `token.json` is present, uploads will happen automatically in the background whenever you click "Stop Recording".

---

## 📹 Local Recording

Recording is handled by OBS. Files are saved to the path configured in your OBS Settings (Output -> Recording -> Recording Path).
The Bridge detects when a file is finished writing and uploads that specific file.
