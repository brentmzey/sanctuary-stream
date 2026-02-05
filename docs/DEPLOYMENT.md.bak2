# 🚀 Deployment Guide - Sanctuary Stream

## Overview

This guide covers production deployment of all Sanctuary Stream components following 12-factor methodology.

## Prerequisites

- PocketHost account (free tier available)
- Church PC with OBS Studio installed
- Node.js 18+ on Church PC
- (Optional) AWS account for video archival

---

## 1. PocketBase Broker (PocketHost)

### Step 1: Create PocketHost Instance

1. Sign up at [pockethost.io](https://pockethost.io)
2. Create new instance (free tier: 100MB storage, 10GB bandwidth)
3. Note your instance URL: `https://your-app.pockethost.io`

### Step 2: Import Schema

```bash
# From project root
cd pocketbase

# Import via PocketBase Admin UI
# Navigate to Settings → Import collections
# Upload schema.json
```

### Step 3: Create Users

**Admin User**:
- Email: admin@sanctuary.local
- Role: admin
- Password: (strong password)

**Bridge Service Account**:
- Email: bridge@sanctuary.local
- Role: tech
- Password: (strong password, save for later)

**Pastor Account**:
- Email: pastor@sanctuary.church
- Role: pastor

### Step 4: Configure API Rules

In PocketBase Admin UI → Collections:

**commands** collection:
- CREATE: `@request.auth.role = 'admin' || @request.auth.role = 'pastor'`
- VIEW: `@request.auth.id != ""`
- UPDATE: `@request.auth.role = 'tech'`

**streams** collection:
- VIEW: `@request.auth.id != ""`
- UPDATE: `@request.auth.role = 'tech'`

### Step 5: Create Default Stream Record

```bash
# Via PocketBase Admin UI → streams collection
# Click "New Record"
{
  "status": "idle",
  "heartbeat": "2026-02-03T00:00:00Z",
  "youtube_url": "",
  "metadata": {}
}

# Note the record ID (e.g., "abc123xyz")
```

---

## 2. Church Bridge Service (Church PC)

### Requirements
- Church PC with OBS Studio installed
- OBS WebSocket plugin enabled (password set)
- Node.js 18+ installed
- Outbound HTTPS access to PocketHost

### Installation

#### Option A: PM2 (Recommended for Windows/macOS/Linux)

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Clone repository on Church PC
cd C:\sanctuary-stream  # Windows
cd ~/sanctuary-stream   # macOS/Linux

# 3. Install dependencies
cd sanctuary-bridge
npm ci --production

# 4. Build TypeScript
npm run build

# 5. Create production .env
cat > .env << 'EOF'
PB_URL=https://your-app.pockethost.io
BRIDGE_EMAIL=bridge@sanctuary.local
BRIDGE_PASS=your-bridge-password
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=your-obs-password
STREAM_ID=abc123xyz
LOG_LEVEL=info
NODE_ENV=production
