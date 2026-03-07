# Super User Configuration & "No-Code" Customization

Sanctuary Stream provides an out-of-the-box, intuitive UI for standard operators (e.g., tech volunteers, pastors). However, for "Super Users" who want deep control without touching the core codebase or compiling applications from source, we provide powerful configuration endpoints.

This allows organizations to have deeply bespoke setups (custom video profiles, tailored network routing, specific backend bindings) using standard JSON configuration files and PocketBase admin controls.

## 1. The Sanctuary Bridge (OBS Connector) Config

The standalone executable (`sanctuary-bridge.exe` or `sanctuary-bridge` on macOS/Linux) normally relies on environment variables for configuration. However, for a completely "no-code" deployment, you can place a `config.json` file in the exact same directory as the executable.

When the bridge starts, it will automatically detect and load `config.json`, which overrides any environment variables.

### Example `config.json`
```json
{
  "PB_URL": "https://my-custom-backend.pockethost.io",
  "STREAM_ID": "q8a9d7z6f5g4h3j",
  "BRIDGE_EMAIL": "obs-machine@local.church",
  "BRIDGE_PASS": "secure-password-123",
  "OBS_URL": "ws://127.0.0.1:4455",
  "OBS_PASS": "my-obs-websocket-password"
}
```

**Workflow:**
1. Download the `sanctuary-bridge.exe`.
2. Create `config.json` in the same folder.
3. Double-click the `.exe`. The bridge is fully configured and connected.

## 2. PocketBase Super User Configuration

As a super user, you can configure much of the application's underlying logic without changing the React frontend simply by modifying the database schema in the PocketBase Admin UI (`/_/`).

### Adding Custom UI Settings
The `sanctuary-app` respects the data structures returned by PocketBase. If you want to add a new category of "Resources" to the Pastoral Reflections tab:
1. Open PocketBase Admin UI.
2. Go to the `resources` collection settings.
3. Edit the `category` Select field.
4. Add your new category (e.g., `bulletin`, `sheet-music`). 
5. The App will automatically render these correctly without needing a UI update.

### Tweak Default Video/Audio Settings
The app sends commands to OBS via the `commands` collection. Super users can write an automated PocketBase Hook (in JavaScript or Go) that intercepts `SET_VIDEO_SETTINGS` commands and injects custom bandwidth profiles specific to your church's ISP constraints.

## 3. UI/UX Customization via SetupWizard

The `SetupWizard` allows the user to define their backend. If your church maintains a specific tailored backend structure on a self-hosted VPS, you simply instruct the volunteers to type your custom VPS URL (e.g., `https://api.stream.mychurch.org`) during the initial setup on their iPad.

The app will dynamically fetch your specific settings, themes, and streams from that backend, altering the UI state to match your organization's data.

## 4. Why This Matters
* **No Git required:** The technical director does not need to know how to use `git`, `bun`, or `npm`.
* **Zero Compilation:** No need to download Xcode or Android Studio.
* **Portable:** The `config.json` can be backed up to a USB drive along with the `.exe` and instantly deployed to any spare laptop in an emergency.
