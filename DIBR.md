# 🚀 DIBR - Deployment, Installation, Backout, Rollback Guide

This document outlines the procedures for moving Sanctuary Stream between environments and recovering from failures.

## 🛠️ Installation (Fresh Install)

1.  **Dependencies:** Ensure Node.js v20+ and npm v9+ are installed.
2.  **Clone:** `git clone https://github.com/brentmzey/sanctuary-stream`
3.  **Setup:** Run `./scripts/setup.sh` to install deps and init PocketBase.
4.  **Config:** Update `.env` files with your local/cloud `PB_URL` and `STREAM_ID`.

## 🚢 Deployment (Promotion)

1.  **Staging:** `ENV=staging ./scripts/setup.sh`
2.  **Production:** `ENV=production ./scripts/setup.sh`
3.  **Tauri Build:** `npm run build:app`
4.  **Bridge Deploy:** `npm run build:bridge` then copy `dist/` to target.

## ⚠️ Backout (Emergency Stop)

If a deployment causes immediate issues:
1.  **Kill processes:** `./scripts/stop-dev.sh` (or `pkill -f node` and `pkill -f pocketbase`).
2.  **Release Ports:**
    - `lsof -ti:8090 | xargs kill -9` (PocketBase)
    - `lsof -ti:5173 | xargs kill -9` (Vite)

## 🔄 Rollback (Version Recovery)

### 1. Application Rollback
- Re-run the previous successful GitHub Action build.
- Manually check out the previous stable tag: `git checkout v0.1.0-RC1`.

### 2. Database Rollback
- PocketBase keeps snapshots in `pb_data/backups`.
- **To restore:**
    1.  Stop PocketBase.
    2.  Replace current `pb_data/data.db` with the latest backup.
    3.  Restart PocketBase.

---

## 🏷️ Release Naming Convention

- **Release Candidates:** `x.xx.xx-RCx` (e.g., `0.1.0-RC2`)
- **Full Release:** `x.xx.xx` (e.g., `0.1.0`)
- **Internal/Build Naming:** `x.xx.<epochMillis>` (e.g., `0.1.1770200000000`)
