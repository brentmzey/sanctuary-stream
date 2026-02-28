# 🛠️ ADMIN & INSTALLER SETUP GUIDE (CRITICAL)

**PLEASE READ THIS ENTIRE GUIDE BEFORE ATTEMPTING INSTALLATION.**

This guide is designed for the person setting up the **Sanctuary Stream** infrastructure (PocketBase backend and the Bridge on the streaming computer).

---

## 📋 Step-by-Step Installation

### 1. Prerequisites
- **Node.js:** v20.0.0 or higher (`node -v`)
- **npm:** v9.0.0 or higher (`npm -v`)
- **PocketBase:** Download the binary for your OS from [pocketbase.io](https://pocketbase.io/docs/) and place it in `pocketbase/local/`.

### 2. Automated Local Setup
Run the following command in your terminal. This will install all dependencies, initialize the database schema, and create test users.
```bash
./scripts/setup.sh
```

### 3. Environment Configuration
Verify that your `.env` files were created and contain the correct values:
- **`sanctuary-app/.env`**: Used by the frontend.
- **`sanctuary-bridge/.env`**: Used by the OBS connector.

**Crucial Check:** Ensure the `STREAM_ID` in both files matches the record ID in your PocketBase `streams` collection.

### 4. Running the System
To start all services (Database, Bridge, Mock OBS, and Web App) in a single terminal:
```bash
npm run dev:full
```

---

## 🔍 Debugging & Troubleshooting

### "Address already in use" (Port 8090 or 5173)
This happens if a previous session didn't close properly.
- **Fix (macOS/Linux):** `lsof -ti:8090,5173 | xargs kill -9`
- **Fix (Windows):** Restart your terminal or use Task Manager to kill `node.exe` and `pocketbase.exe`.

### Bridge won't connect to OBS
- **Check:** Is OBS running? Is the WebSocket server enabled in OBS (Tools -> WebSocket Server Settings)?
- **Check:** Does the password in `.env` match the OBS WebSocket password?
- **Hint:** Use `npm run mock:obs` to test the bridge without needing real OBS open.

### PocketBase Schema Errors
If you see errors about missing collections:
- **Fix:** Run `npm run schema:init:local` to re-apply the database migrations.

---

## 🆘 Support & Contact

If you encounter issues that aren't covered here:

1.  **Submit a GitHub Issue:** [Create New Issue](https://github.com/your-org/sanctuary-stream/issues) (Preferred for bugs)
2.  **Email Support:** [brent@example.com](mailto:brent@example.com) (For private inquiries)
3.  **Documentation:** Check the [Full Installation Guide](./COMPLETE_INSTALLATION.md) for platform-specific details.

---

**Built with ❤️ for the Global Church.**
