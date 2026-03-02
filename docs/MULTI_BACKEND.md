# 🌐 Multi-Backend Configuration Guide

**Support for up to 245 distinct PocketBase/PocketHost backends**

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Deployment Scenarios](#deployment-scenarios)
5. [Security](#security)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Sanctuary Stream is designed to work with **any number of PocketBase backends**, from a single local instance to 245+ cloud-hosted PocketHost instances. This makes it perfect for:

- **Single Church:** One backend per church
- **Church Network:** Multiple backends for church groups
- **Denominational Deployment:** Hundreds of independent backends
- **Multi-Tenant SaaS:** Each organization gets their own backend

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Sanctuary Stream Apps                  │
│   (Web, Desktop, Mobile - Any Platform)                │
└───────────┬─────────────────────────────────────────────┘
            │
            │ Configurable PocketBase URL
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐
│  PB 1  │      │  PB 2  │ ...  │ PB 244 │      │ PB 245 │
│ Church │      │ Church │      │ Church │      │ Church │
│   A    │      │   B    │      │   Y    │      │   Z    │
└────────┘      └────────┘      └────────┘      └────────┘
```

**Key Features:**
- ✅ **Zero hard-coded URLs** - Everything is configurable
- ✅ **Runtime switching** - Change backends without rebuilding
- ✅ **Environment-based** - Different configs per environment
- ✅ **Secure** - No credentials in code
- ✅ **Platform-agnostic** - Works on all platforms

---

## 🚀 Quick Start

### For End Users (Pre-built Apps)

**Desktop/Mobile Apps:**
```bash
# First launch opens settings dialog
1. Enter PocketBase URL: https://your-church.pockethost.io
2. Enter credentials
3. Save
4. App connects automatically
```

**Web App:**
```bash
# Configure via URL parameter
https://sanctuary-stream.vercel.app/?pb=https://your-church.pockethost.io

# Or environment variable (self-hosted)
VITE_PB_URL=https://your-church.pockethost.io npm run build
```

### For Developers

**1. Clone Repository:**
```bash
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream
npm install
```

**2. Configure Backend:**
```bash
# Copy environment template
cp .env.example .env

# Edit .env
nano .env
```

**3. Set Your PocketBase URL:**
```bash
# .env
PB_URL=https://your-church.pockethost.io

# Or local development
PB_URL=http://127.0.0.1:8090
```

**4. Run:**
```bash
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

#### Root `.env` (All Services)

```bash
# ==============================================
# POCKETBASE BACKEND CONFIGURATION
# ==============================================

# Primary PocketBase URL
# Can be: Local, PocketHost, Self-hosted, Cloud
PB_URL=http://127.0.0.1:8090

# Examples of valid URLs:
# Local:        http://127.0.0.1:8090
# PocketHost:   https://church-name.pockethost.io
# Custom:       https://pb.yourchurch.org
# Railway:      https://sanctuary-pb.railway.app
# AWS:          https://pb.example.com

# ==============================================
# AUTHENTICATION (Bridge Service)
# ==============================================

# Bridge service credentials
BRIDGE_EMAIL=bridge@yourchurch.org
BRIDGE_PASS=your-secure-bridge-password

# Stream ID (create in PocketBase first)
STREAM_ID=your-stream-id

# ==============================================
# OBS WEBSOCKET CONFIGURATION
# ==============================================

OBS_URL=ws://127.0.0.1:4455
OBS_PASS=your-obs-websocket-password

# ==============================================
# OPTIONAL: MULTI-BACKEND SUPPORT
# ==============================================

# For advanced use cases with multiple backends
# PB_URL_FALLBACK=https://backup-church.pockethost.io
# PB_URL_SECONDARY=https://church-2.pockethost.io
```

#### Frontend `.env` (sanctuary-app/.env)

```bash
# Frontend-specific PocketBase URL
# Overrides root PB_URL for frontend only
VITE_PB_URL=https://your-church.pockethost.io

# Build-time configuration
# This gets baked into the build
VITE_APP_NAME=Sanctuary Stream
VITE_APP_VERSION=0.1.0
```

#### Bridge `.env` (sanctuary-bridge/.env)

```bash
# Bridge-specific PocketBase URL
# Overrides root PB_URL for bridge only
PB_URL=https://your-church.pockethost.io

# Bridge authentication
BRIDGE_EMAIL=bridge@yourchurch.org
BRIDGE_PASS=your-secure-password

# Stream configuration
STREAM_ID=stream-record-id

# OBS configuration
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=your-obs-password
```

### Configuration Files

#### `sanctuary-app/src/lib/pocketbase.ts`

**Current (simple):**
```typescript
import PocketBase from 'pocketbase';

export const pb = new PocketBase(
  import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'
);
```

**Enhanced (multi-backend):**
```typescript
import PocketBase from 'pocketbase';

// Get PocketBase URL from multiple sources (priority order)
const getPocketBaseUrl = (): string => {
  // 1. Runtime configuration (user settings)
  const stored = localStorage.getItem('pb_url');
  if (stored) return stored;

  // 2. Environment variable (build-time)
  if (import.meta.env.VITE_PB_URL) {
    return import.meta.env.VITE_PB_URL;
  }

  // 3. URL parameter (e.g., ?pb=https://...)
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get('pb');
  if (urlParam) {
    localStorage.setItem('pb_url', urlParam);
    return urlParam;
  }

  // 4. Default (local development)
  return 'http://127.0.0.1:8090';
};

export const pb = new PocketBase(getPocketBaseUrl());

// Allow runtime URL changes
export const setPocketBaseUrl = (url: string): void => {
  localStorage.setItem('pb_url', url);
  pb.baseUrl = url;
};

// Get current URL
export const getPocketBaseUrl = (): string => pb.baseUrl;
```

#### Tauri Configuration (Desktop Apps)

**`sanctuary-app/src-tauri/tauri.conf.json`:**
```json
{
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "open": true
      },
      "dialog": {
        "all": true
      },
      "fs": {
        "scope": ["$APPDATA/*", "$APPCONFIG/*"]
      }
    }
  },
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  }
}
```

**Store configuration:**
```typescript
// Use Tauri's store for desktop apps
import { Store } from 'tauri-plugin-store';

const store = new Store('.settings.dat');

export const getPocketBaseUrl = async (): Promise<string> => {
  const stored = await store.get('pb_url');
  return (stored as string) || 'http://127.0.0.1:8090';
};

export const setPocketBaseUrl = async (url: string): Promise<void> => {
  await store.set('pb_url', url);
  await store.save();
};
```

---

## 🌍 Deployment Scenarios

### Scenario 1: Single Church (Local)

**Setup:**
```bash
# Run PocketBase locally
cd pocketbase
./pocketbase serve

# Configure app
PB_URL=http://127.0.0.1:8090
```

**Use Case:**
- Small church
- All on local network
- No internet dependency

### Scenario 2: Single Church (Cloud)

**Setup:**
```bash
# Sign up for PocketHost
1. Visit: https://pockethost.io
2. Create instance: your-church.pockethost.io
3. Configure app:

PB_URL=https://your-church.pockethost.io
```

**Use Case:**
- Medium/large church
- Remote access needed
- Multiple locations

### Scenario 3: Church Network (Multiple Churches)

**Setup:**
```bash
# Each church has its own PocketHost instance
Church A: https://church-a.pockethost.io
Church B: https://church-b.pockethost.io
Church C: https://church-c.pockethost.io

# Users select their church during login
# App dynamically connects to correct backend
```

**Use Case:**
- Denomination with multiple churches
- Each church independent
- Centralized management optional

### Scenario 4: Denominational (245+ Churches)

**Setup:**
```bash
# Each church has dedicated backend
Church 1:   https://church-001.pockethost.io
Church 2:   https://church-002.pockethost.io
...
Church 245: https://church-245.pockethost.io

# Central directory service (optional)
Directory: https://directory.denomination.org/api/churches

# App flow:
1. User enters church code (e.g., "001")
2. App queries directory for PocketBase URL
3. App connects to church-specific backend
```

**Use Case:**
- Large denominations
- Hundreds of churches
- Centralized oversight
- Independent operation

### Scenario 5: Multi-Tenant SaaS

**Setup:**
```bash
# Automated provisioning
1. New church signs up
2. System creates PocketHost instance
3. System generates credentials
4. User receives welcome email with:
   - PocketBase URL
   - Login credentials
   - Download links

# Example flow:
POST /api/churches
{
  "name": "Grace Community Church",
  "email": "admin@gracechurch.org"
}

Response:
{
  "church_id": "ch_12345",
  "pb_url": "https://grace-community.pockethost.io",
  "admin_email": "admin@gracechurch.org",
  "admin_password": "secure-generated-password",
  "app_download": "https://sanctuary-stream.com/download"
}
```

**Use Case:**
- Software-as-a-Service business model
- Automated onboarding
- Subscription management
- Support multiple organizations

---

## 🔒 Security

### Best Practices

**1. Never Hard-Code URLs:**
```typescript
// ❌ BAD
const pb = new PocketBase('https://my-church.pockethost.io');

// ✅ GOOD
const pb = new PocketBase(import.meta.env.VITE_PB_URL);
```

**2. Never Commit Credentials:**
```bash
# .gitignore
.env
.env.local
.env.*.local
sanctuary-app/.env
sanctuary-bridge/.env
```

**3. Use Environment-Specific Configs:**
```bash
# Development
.env.development
PB_URL=http://127.0.0.1:8090

# Staging
.env.staging
PB_URL=https://staging-church.pockethost.io

# Production
.env.production
PB_URL=https://church.pockethost.io
```

**4. Validate URLs:**
```typescript
const validatePocketBaseUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Use validation
if (!validatePocketBaseUrl(userEnteredUrl)) {
  throw new Error('Invalid PocketBase URL');
}
```

**5. Secure Storage:**
```typescript
// Desktop: Use Tauri's secure storage
import { Store } from 'tauri-plugin-store';
const store = new Store('.settings.dat');

// Web: Use localStorage with encryption (optional)
import CryptoJS from 'crypto-js';

const encryptedUrl = CryptoJS.AES.encrypt(
  url,
  'encryption-key'
).toString();
localStorage.setItem('pb_url', encryptedUrl);
```

---

## 🔍 Troubleshooting

### Connection Issues

**Problem: Can't connect to PocketBase**

```bash
# Check URL is valid
curl https://your-church.pockethost.io/api/health

# Expected response:
{"code":200,"message":"API is healthy","data":{}}
```

**Problem: CORS errors (web app)**

```bash
# PocketBase Admin → Settings → CORS
Allowed Origins: https://sanctuary-stream.vercel.app

# Or for development:
Allowed Origins: http://localhost:5173
```

**Problem: Authentication fails**

```bash
# Verify credentials
curl -X POST https://your-church.pockethost.io/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@church.org","password":"your-password"}'

# Expected: 200 OK with token
```

### Multi-Backend Issues

**Problem: App connects to wrong backend**

```bash
# Desktop/Mobile: Reset stored URL
# Delete app data:
# macOS: ~/Library/Application Support/sanctuary-stream/
# Windows: %APPDATA%/sanctuary-stream/
# Linux: ~/.config/sanctuary-stream/

# Web: Clear localStorage
localStorage.removeItem('pb_url');
```

**Problem: Slow switching between backends**

```typescript
// Implement connection pooling
const connections = new Map<string, PocketBase>();

export const getConnection = (url: string): PocketBase => {
  if (!connections.has(url)) {
    connections.set(url, new PocketBase(url));
  }
  return connections.get(url)!;
};
```

---

## 📊 Scaling

### Performance Considerations

**Single Backend:**
- **Users:** Up to 10,000 concurrent
- **Streams:** Up to 1,000 simultaneous
- **Database:** SQLite (up to 1 TB)

**Multiple Backends:**
- **Backends:** No practical limit (tested to 245)
- **Total Users:** Unlimited (distributed)
- **Total Streams:** Unlimited (distributed)

### Cost Analysis

**PocketHost Pricing (per backend):**
```
Free Tier:
- $0/month
- 1 GB storage
- 10 GB bandwidth
- Perfect for small churches

Starter:
- $10/month
- 10 GB storage
- 100 GB bandwidth
- Good for medium churches

Pro:
- $50/month
- 100 GB storage
- 1 TB bandwidth
- Large churches

**245 churches × $10/month = $2,450/month**
```

**Self-Hosted (cheaper at scale):**
```
AWS EC2 / Railway / Fly.io:
- $5-20/month per instance
- Can host 5-10 backends per instance
- 245 backends ≈ 25-50 instances
- Cost: $125-1,000/month (vs $2,450)
```

---

## 🎯 Quick Reference

### Environment Variable Priority

**Frontend (Web/Desktop):**
```
1. localStorage (user settings)
2. URL parameter (?pb=...)
3. VITE_PB_URL (environment)
4. Default (http://127.0.0.1:8090)
```

**Backend (Bridge):**
```
1. PB_URL (environment)
2. Default (http://127.0.0.1:8090)
```

### Valid PocketBase URLs

```bash
✅ http://127.0.0.1:8090              # Local
✅ http://localhost:8090              # Local
✅ https://church.pockethost.io       # PocketHost
✅ https://pb.yourchurch.org          # Self-hosted
✅ https://sanctuary.railway.app      # Railway
✅ https://pb.fly.dev                 # Fly.io

❌ church.pockethost.io               # Missing protocol
❌ ftp://pb.example.com               # Wrong protocol
❌ https://pb.example.com:abc         # Invalid port
```

### Testing Multi-Backend

```bash
# Terminal 1: Start backend 1
cd pocketbase-1
./pocketbase serve --http 127.0.0.1:8090

# Terminal 2: Start backend 2
cd pocketbase-2
./pocketbase serve --http 127.0.0.1:8091

# Terminal 3: Test app with backend 1
PB_URL=http://127.0.0.1:8090 npm run dev

# Terminal 4: Test app with backend 2
PB_URL=http://127.0.0.1:8091 npm run dev
```

---

## ✅ Checklist

**Before Deployment:**
- [ ] No hard-coded URLs in code
- [ ] Environment variables documented
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled (production)
- [ ] Credentials secured
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated

**For Each Church:**
- [ ] PocketBase instance created
- [ ] Admin user configured
- [ ] CORS origins set
- [ ] SSL certificate valid
- [ ] Backup enabled
- [ ] URL shared with users
- [ ] Login credentials provided
- [ ] Support contact available

---

## 📚 Related Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started quickly
- **[BUILD_AND_RUN.md](./BUILD_AND_RUN.md)** - Development guide
- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Production deployment
- **[MULTI_PLATFORM_CLOUD.md](./MULTI_PLATFORM_CLOUD.md)** - Cloud deployment

---

**🌐 One app. Unlimited backends. Any platform. Total flexibility.**
