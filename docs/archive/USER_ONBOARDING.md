# 🚀 Sanctuary Stream - User Onboarding & Setup

This guide walks you through the "Zero-Config" setup of Sanctuary Stream. Whether you are using the Desktop app, Mobile app, or Web version, the process is designed to be simple and accessible for any church staff or volunteer.

---

## 🏗️ 1. Installation

### Desktop (macOS, Windows, Linux)
Download the latest release for your platform and install it like any other application.
- **macOS:** Drag `Sanctuary Stream.app` to your Applications folder.
- **Windows:** Run the `.msi` installer.
- **Linux:** Use the `.deb` or `AppImage`.

### Mobile (iOS, Android)
Install from the App Store or Google Play Store (search for "Sanctuary Stream").

---

## 🧙 2. The Setup Wizard

When you open the app for the first time, the **Setup Wizard** will guide you.

### Step 1: Backend Connection
The app needs a "brain" (PocketBase) to store commands and stream status.
- **Local Setup:** If you are running PocketBase on the same computer, use the default: `http://127.0.0.1:8090`.
- **Cloud Setup:** If your church uses a hosted service (like PocketHost), enter your custom URL: `https://your-church.pockethost.io`.

### Step 2: Authentication
Enter your Admin Email and Password. 
- *Note:* If you are a developer running locally, the default is `pastor@local.dev` / `pastor123456`.

### Step 3: Stream Configuration
Give your stream a name (e.g., "Main Sanctuary"). The app will automatically create a unique **Stream ID** and save it to your device. You won't have to do this again!

---

## 🎥 3. OBS Configuration

To control OBS from the app, you must enable the WebSocket server in OBS Studio:

1. Open **OBS Studio**.
2. Go to **Tools** > **WebSocket Server Settings**.
3. Check **Enable WebSocket server**.
4. Note the **Server Port** (default is `4455`).
5. (Recommended) Set a **Server Password**.
6. Ensure the **Sanctuary Bridge** service is running and configured with these same settings.

---

## 📱 4. Cross-Platform Usage

Once setup is complete, you can use Sanctuary Stream on any device:

- **Pastors/Leaders:** Use the Mobile app from the pulpit to start/stop the stream discreetly.
- **Tech Team:** Use the Desktop app for a full view of quality metrics (FPS, CPU, Bitrate).
- **Remote Admins:** Use the Web version to monitor the stream from home.

---

## 💎 5. Quality & Safety

Sanctuary Stream is built with **functional safety** at its core:
- **Rust Backend:** High-performance, memory-safe code handles critical network operations.
- **Real-time Metrics:** Monitor your stream quality (FPS, dropped frames) in real-time to ensure an exceptional experience for your congregation.
- **Zero-Trust:** All commands are authenticated and logged.

---

## 🆘 Troubleshooting

- **"Could not connect to backend"**: Ensure your PocketBase server is running and the URL is correct.
- **"OBS not responding"**: Check if the "Sanctuary Bridge" service is running. It acts as the middleman between the app and OBS.
- **"Permission Denied"**: Only users with `admin` or `pastor` roles can send control commands.

---

**You are now ready to stream!** 🎥✨
