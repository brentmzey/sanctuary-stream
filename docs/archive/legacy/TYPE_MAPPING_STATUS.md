# 🔗 Type Mapping Status - Rust ↔ TypeScript

**Status:** ⚠️ PARTIALLY COMPLETE - Needs Integration

---

## 🎯 Current Architecture

### Three Separate Systems (Not Fully Connected)

```
┌─────────────────────────────────────────────────────────┐
│  1. Tauri/Rust (Desktop App)                            │
│     - sanctuary-app/src-tauri/                          │
│     - Rust backend for desktop                          │
│     - Has Tauri commands                                │
│     - NOT actively used yet                             │
└─────────────────────────────────────────────────────────┘
                    ↓ (should call)
┌─────────────────────────────────────────────────────────┐
│  2. Node.js Bridge (OBS Connection)                     │
│     - sanctuary-bridge/                                 │
│     - TypeScript/Node.js                                │
│     - Connects to OBS WebSocket                         │
│     - ACTIVELY WORKING                                  │
└─────────────────────────────────────────────────────────┘
                    ↑ (talks to)
┌─────────────────────────────────────────────────────────┐
│  3. React Web App                                       │
│     - sanctuary-app/src/                                │
│     - TypeScript/React                                  │
│     - ACTIVELY WORKING                                  │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ What's Working

### 1. Web App ↔ PocketBase ✅
```typescript
// sanctuary-app/src/lib/pocketbase.ts
export const pb = new PocketBase('http://127.0.0.1:8090');

// Types defined in shared/types.ts
interface Command {
  action: CommandAction;
  executed: boolean;
  // ...
}
```
**Status:** ✅ WORKING

### 2. Bridge ↔ PocketBase ✅
```typescript
// sanctuary-bridge/src/index.ts
const pb = new PocketBase(process.env.PB_URL);

// Subscribes to commands
pb.collection('commands').subscribe('*', (e) => {
  // Execute OBS commands
});
```
**Status:** ✅ WORKING

### 3. Bridge ↔ OBS WebSocket ✅
```typescript
// sanctuary-bridge/src/index.ts
import OBSWebSocket from 'obs-websocket-js';
const obs = new OBSWebSocket();

// Connects and sends commands
await obs.call('StartStream');
```
**Status:** ✅ WORKING

---

## ⚠️ What's NOT Connected

### Tauri/Rust ↔ Web App ⚠️

**Problem:** Tauri commands exist but aren't called from React

**Rust Side (Exists):**
```rust
// sanctuary-app/src-tauri/src/main.rs
#[tauri::command]
async fn get_stream_status(
    pocketbase_url: String, 
    stream_id: String
) -> Result<StreamStatus, String> {
    // Implementation exists
}

#[tauri::command]
async fn send_command(
    pocketbase_url: String,
    action: String,
    auth_token: String,
    user_id: String,
) -> Result<String, String> {
    // Implementation exists
}
```

**TypeScript Side (NOT calling it):**
```typescript
// sanctuary-app/src/ - No Tauri imports found!
// Should have:
import { invoke } from '@tauri-apps/api/tauri';

// Should call:
const status = await invoke('get_stream_status', {
  pocketbaseUrl: 'http://127.0.0.1:8090',
  streamId: 'xxx'
});
```

**Status:** ⚠️ Code exists but not wired up

---

## 🔍 Type Mapping Analysis

### Rust Types (src-tauri/src/main.rs)
```rust
#[derive(Debug, Serialize, Deserialize)]
struct StreamQualityMetrics {
    fps: Option<f64>,
    bitrate: Option<u64>,
    dropped_frames: Option<u64>,
    cpu_usage: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct StreamStatus {
    status: String,
    youtube_url: Option<String>,
    metadata: Option<StreamMetadata>,
}
```

### TypeScript Types (shared/types.ts)
```typescript
export interface StreamStatus {
  status: 'idle' | 'live' | 'error';
  youtube_url?: string;
  facebook_url?: string;
  // ...
}

export interface Command {
  action: CommandAction;
  executed: boolean;
  correlation_id: string;
  // ...
}
```

**Analysis:**
- ✅ Types exist in both
- ⚠️ Names match
- ❌ Not actually communicating
- ❌ No Tauri invoke calls in React

---

## 📊 Integration Status by Component

| Component | Rust | TypeScript | Connected | Status |
|-----------|------|------------|-----------|--------|
| **Stream Status** | ✅ Exists | ✅ Exists | ❌ No | Not used |
| **Commands** | ✅ Exists | ✅ Exists | ❌ No | Not used |
| **Notifications** | ✅ Exists | ✅ Exists | ❌ No | Not used |
| **Cloud (AWS)** | ✅ Exists | ❌ Missing | ❌ No | Optional |
| **Cloud (RabbitMQ)** | ✅ Exists | ❌ Missing | ❌ No | Optional |

---

## 🎯 Current Working Architecture

**What Actually Runs:**

```
User Browser
    ↓ (HTTP/WebSocket)
React Web App (sanctuary-app/src)
    ↓ (HTTP REST API)
PocketBase (http://127.0.0.1:8090)
    ↓ (Real-time WebSocket)
Node.js Bridge (sanctuary-bridge)
    ↓ (OBS WebSocket)
OBS Studio
```

**Tauri/Rust is NOT in this chain!**

---

## 🚀 What Needs to Happen

### For Desktop App to Work:

1. **Wire up Tauri invoke calls in React:**
```typescript
// sanctuary-app/src/lib/tauri.ts (NEW FILE NEEDED)
import { invoke } from '@tauri-apps/api/tauri';

export async function getStreamStatus(streamId: string) {
  return await invoke('get_stream_status', {
    pocketbaseUrl: import.meta.env.VITE_PB_URL,
    streamId
  });
}

export async function sendCommand(action: string) {
  return await invoke('send_command', {
    pocketbaseUrl: import.meta.env.VITE_PB_URL,
    action,
    authToken: pb.authStore.token,
    userId: pb.authStore.model?.id
  });
}
```

2. **Update React components to use Tauri when in desktop mode:**
```typescript
// sanctuary-app/src/components/StreamControl.tsx
import { isTauri } from '@tauri-apps/api/core';
import { getStreamStatus } from '@/lib/tauri';

function StreamControl() {
  const loadStatus = async () => {
    if (await isTauri()) {
      // Desktop mode - use Rust backend
      const status = await getStreamStatus(streamId);
    } else {
      // Web mode - use PocketBase directly
      const status = await pb.collection('streams').getOne(streamId);
    }
  };
}
```

3. **Ensure type parity:**
```typescript
// Create sanctuary-app/src/types/tauri.ts
// Mirror Rust types exactly

export interface StreamStatus {
  status: string;
  youtube_url: string | null;
  metadata: StreamMetadata | null;
}

export interface StreamMetadata {
  outputActive: boolean | null;
  outputDuration: number | null;
  outputBytes: number | null;
  quality: StreamQualityMetrics | null;
}
```

---

## ✅ What's Already Good

### Shared Types Work Well
```typescript
// shared/types.ts
export interface Command {
  action: CommandAction;
  executed: boolean;
  // Used by both web app and bridge
}
```
**Status:** ✅ Web app and Node bridge share types perfectly

### Bridge Works Perfectly
```typescript
// sanctuary-bridge/src/index.ts
// TypeScript types match PocketBase schema
// OBS commands work
// Google Drive integration works
```
**Status:** ✅ All type-safe

---

## 🎯 Modes of Operation

### Mode 1: Web App (Currently Working) ✅
```
Browser → React → PocketBase → Bridge → OBS
```
- No Rust involved
- TypeScript end-to-end
- Works perfectly NOW

### Mode 2: Desktop App (Needs Wire-up) ⚠️
```
Tauri App → Rust Commands → ... → Bridge → OBS
```
- Rust backend exists
- Not called from React
- Needs invoke() calls added

### Mode 3: Mobile App (Future) 🔵
```
Capacitor → Web view → PocketBase → Bridge → OBS
```
- Will use web mode
- No Rust involved
- Should work like web

---

## 🔧 Quick Fix Needed

**To make desktop app actually use Rust backend:**

1. Install Tauri API in React:
```bash
cd sanctuary-app
bun add @tauri-apps/api
```

2. Create wrapper:
```bash
# Create sanctuary-app/src/lib/tauri.ts
# Add invoke() calls for all Rust commands
```

3. Update components:
```bash
# Check for Tauri context
# Use Rust backend if in Tauri
# Fall back to direct PocketBase in web
```

**Time:** ~2-3 hours  
**Complexity:** Medium  
**Risk:** Low (web mode still works)

---

## ✅ Summary

### What Works NOW:
- ✅ Web app (TypeScript only)
- ✅ Bridge (TypeScript/Node)
- ✅ Types shared (TypeScript)
- ✅ End-to-end flow

### What's Built But Not Connected:
- ⚠️ Tauri/Rust backend (exists, not called)
- ⚠️ Type mappings (exist, not used)
- ⚠️ Desktop commands (defined, not invoked)

### What's Needed:
1. Add `@tauri-apps/api` import
2. Create Tauri wrapper functions
3. Detect Tauri context
4. Call Rust from React
5. Test desktop build

### Risk Assessment:
- ✅ **Low risk:** Web mode works regardless
- ✅ **Low breaking:** Changes are additive
- ✅ **Low effort:** ~2-3 hours work
- ✅ **High value:** Desktop apps work native

---

## 🎬 Next Steps

**Want me to wire up the Tauri integration?**

I can:
1. Add `@tauri-apps/api`
2. Create wrapper functions
3. Update components
4. Test the integration
5. Make desktop builds work

**Or keep as-is:**
- Web mode works perfectly
- Desktop can be done later
- No urgency since web works

**Your call!** 🚀
