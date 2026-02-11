# 🏃 Build and Run - Complete Guide

This guide answers: **"How do I actually run this project?"**

---

## 🎯 TL;DR (Quick Start)

The fastest way to get a local development environment running is our automated setup script:

```bash
# 1. Run the automated setup
npm run setup
```

This script will:
- Check for prerequisites (Node.js, PocketBase)
- Install all dependencies
- Start a local PocketBase server
- Automatically create admin and test accounts
- Configure your `.env` files with the correct Stream IDs
- Verify the installation

Once complete, start the services in separate terminals:

```bash
# Terminal 1: Start Mock OBS
npm run mock:obs

# Terminal 2: Start Bridge Service
cd sanctuary-bridge && npm run dev

# Terminal 3: Start Frontend App
cd sanctuary-app && npm run dev
```

**Login Credentials:**
- Pastor: `pastor@local.dev / pastor123456`
- Admin:  `admin@local.dev / admin123456`
- Bridge: `bridge@local.dev / bridge123456`

---

## 📋 Prerequisites

Before starting, ensure you have:

| Tool | Version | Check Command | Install |
|------|---------|---------------|---------|
| **Node.js** | 18+ | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | `npm --version` | Included with Node.js |
| **PocketBase** | 0.36+ | `pocketbase --version` | See below |

### Installing PocketBase

The `npm run setup` script will attempt to install PocketBase via Homebrew on macOS. For other platforms or manual installation:

```bash
# macOS (Homebrew)
brew install pocketbase

# Linux (Download binary)
wget https://github.com/pocketbase/pocketbase/releases/download/v0.36.2/pocketbase_0.36.2_linux_amd64.zip
unzip pocketbase_0.36.2_linux_amd64.zip
sudo mv pocketbase /usr/local/bin/
chmod +x /usr/local/bin/pocketbase

# Or download manually from: https://pocketbase.io/docs/
```

---

## 🗄️ Schema Consistency Strategy

### The Problem
How do we ensure local, staging, and production databases have the same structure?

### The Solution: Schema-as-Code

**1. Single Source of Truth**: `pocketbase/schema-init.ts`
- Defines all collections, fields, and rules
- Idempotent (safe to run multiple times)
- Version controlled in Git
- Handles test user creation for local dev

**2. Environment-Specific Initialization**:
```bash
npm run schema:init:local       # http://127.0.0.1:8090
npm run schema:init:staging     # https://staging.pockethost.io
npm run schema:init:production  # https://production.pockethost.io
```

**3. Automatic Migrations**:
PocketBase migrations in `pocketbase/local/pb_migrations` are automatically applied when the server starts.

### Schema Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Define Schema in Code                                    │
│     pocketbase/schema-init.js                                │
│     - Collections, fields, indexes                           │
│     - RBAC rules                                             │
│     - Unique constraints                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Initialize Local Database                                │
│     npm run schema:init:local                                │
│     - Creates collections                                    │
│     - Adds test users (local only)                           │
│     - Creates default records                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Develop & Test Locally                                   │
│     - Run all services                                       │
│     - Test idempotency                                       │
│     - Test RBAC rules                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Export Schema Changes                                    │
│     cd pocketbase/local                                      │
│     pocketbase admin backup                                  │
│     unzip -p pb_data/backups/*.zip pb_schema.json > ../v2.json
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Version Control                                          │
│     git add pocketbase/schema-v2.json                        │
│     git commit -m "feat: add viewer_count field"            │
│     git tag schema-v2.0.0                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Apply to Staging/Production                              │
│     npm run schema:init:staging                              │
│     npm run schema:init:production                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Idempotency Implementation

### Level 1: Database Constraints (PocketBase)

```javascript
// In schema-init.js
const schema = [
  {
    name: 'correlation_id',
    type: 'text',
    required: true
  }
];

const indexes = [
  'CREATE UNIQUE INDEX idx_correlation_id ON commands (correlation_id)'
];
```

**Result**: Second insert with same `correlation_id` fails with 400 error.

### Level 2: Frontend (Tauri App)

```typescript
// Generate unique ID per button click
const correlationId = crypto.randomUUID();

try {
  await pb.collection('commands').create({
    action: 'START',
    correlation_id: correlationId,
    executed: false
  });
} catch (error) {
  if (error.status === 400 && error.data?.data?.correlation_id) {
    // Duplicate detected - show friendly message
    toast.info('Request already in progress');
  } else {
    throw error;
  }
}
```

### Level 3: Bridge Service (Church PC)

```typescript
// In-memory tracking (for paranoid defense-in-depth)
private processedIds = new Set<string>();

async processCommand(command: Command) {
  // Check if already processed in this session
  if (this.processedIds.has(command.correlation_id)) {
    logger.warn('Command already processed');
    return;
  }

  // Check database state
  if (command.executed) {
    logger.info('Command already executed in database');
    return;
  }

  // Execute OBS action
  await this.obs.call('StartStream');

  // Mark as executed (atomic update)
  await this.pb.collection('commands').update(command.id, {
    executed: true
  });

  // Track in memory
  this.processedIds.add(command.correlation_id);
}
```

### Testing Idempotency

```typescript
// Test 1: Database constraint
describe('Database Idempotency', () => {
  it('should reject duplicate correlation_id', async () => {
    const id = crypto.randomUUID();
    
    await pb.collection('commands').create({
      action: 'START',
      correlation_id: id
    });

    // Second insert should fail
    await expect(
      pb.collection('commands').create({
        action: 'START',
        correlation_id: id  // Same ID!
      })
    ).rejects.toThrow('correlation_id must be unique');
  });
});

// Test 2: Bridge service
describe('Bridge Idempotency', () => {
  it('should only execute command once', async () => {
    const mockOBS = createMockOBS();
    const processor = new CommandProcessor(mockOBS);

    const command = { 
      id: '1', 
      action: 'START', 
      correlation_id: 'uuid-123',
      executed: false 
    };

    // Process twice
    await processor.processCommand(command);
    await processor.processCommand({ ...command, executed: true });

    // OBS called only once
    expect(mockOBS.startStreamCallCount).toBe(1);
  });
});
```

---

## 🌍 Running in Different Environments

### Local Development

```bash
# .env (Local)
PB_URL=http://127.0.0.1:8090
BRIDGE_EMAIL=bridge@local.dev
BRIDGE_PASS=bridge123
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=test123
LOG_LEVEL=debug
NODE_ENV=development
```

```bash
# Start services
npm run mock:obs              # Terminal 1
cd pocketbase/local && pocketbase serve  # Terminal 2
cd sanctuary-bridge && npm run dev       # Terminal 3
cd sanctuary-app && npm run tauri dev    # Terminal 4
```

### Staging (Pre-Production Testing)

```bash
# .env.staging
PB_URL=https://staging-sanctuary.pockethost.io
BRIDGE_EMAIL=bridge@sanctuary.staging
BRIDGE_PASS=<from-secrets-manager>
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=<obs-staging-password>
LOG_LEVEL=info
NODE_ENV=staging
```

```bash
# Deploy schema
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_STAGING=<password>
npm run schema:init:staging

# Run bridge on staging church PC
cd sanctuary-bridge
cp .env.staging .env
npm run build
pm2 start dist/index.js --name sanctuary-bridge-staging
```

### Production

```bash
# .env.production
PB_URL=https://sanctuary-stream.pockethost.io
BRIDGE_EMAIL=bridge@sanctuary.church
BRIDGE_PASS=<from-secrets-manager>
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=<obs-production-password>
LOG_LEVEL=warn
NODE_ENV=production
```

```bash
# Deploy schema
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION=<password>
npm run schema:init:production

# Run bridge on church PC
cd sanctuary-bridge
cp .env.production .env
npm run build
pm2 start dist/index.js --name sanctuary-bridge
pm2 startup  # Auto-start on reboot
pm2 save
```

---

## 🧪 Verifying Schema Consistency

### Test 1: Schema Hash Comparison

```bash
# Generate hash of local schema
cd pocketbase/local
pocketbase admin backup
unzip -p pb_data/backups/*.zip pb_schema.json | shasum -a 256

# Compare with staging
# (manually or via script)
```

### Test 2: Automated Schema Tests

```typescript
// tests/schema-consistency.test.ts
import { describe, it, expect } from 'vitest';
import PocketBase from 'pocketbase';

describe('Schema Consistency', () => {
  const environments = {
    local: 'http://127.0.0.1:8090',
    staging: process.env.PB_URL_STAGING,
    production: process.env.PB_URL_PRODUCTION
  };

  for (const [env, url] of Object.entries(environments)) {
    it(`${env} should have commands collection with correlation_id unique index`, async () => {
      const pb = new PocketBase(url);
      await pb.admins.authWithPassword(/*...*/);

      const collection = await pb.collections.getOne('commands');
      
      expect(collection.schema).toContainEqual(
        expect.objectContaining({ name: 'correlation_id' })
      );

      expect(collection.indexes).toContain(
        expect.stringContaining('UNIQUE INDEX idx_correlation_id')
      );
    });
  }
});
```

### Test 3: Manual Verification Checklist

- [ ] All environments have 3 collections: users, commands, streams
- [ ] `commands.correlation_id` has unique index
- [ ] RBAC rules match: pastor can CREATE commands, tech can UPDATE streams
- [ ] Test users exist in local (not in production!)
- [ ] Default stream record exists

---

## 📦 Current Project Status

### ✅ What's Ready Now (Phase 0)

- Documentation (README, ROADMAP, CONTRIBUTING, etc.)
- Schema initialization script (`pocketbase/schema-init.js`)
- Mock OBS server (`scripts/mock-obs.js`)
- Environment templates (`.env.example`)
- Package.json with scripts
- TypeScript configuration

### 🚧 What's Next (Phases 1-5)

**Phase 1**: PocketBase schema (use `schema-init.js`)
**Phase 2**: Bridge service implementation (use ROADMAP.md AI prompts)
**Phase 3**: Tauri frontend (use ROADMAP.md AI prompts)
**Phase 4**: Testing (>80% coverage)
**Phase 5**: Production deployment

---

## 🎯 Success Criteria

You know everything is working when:

✅ PocketBase running locally (http://127.0.0.1:8090)  
✅ Schema initialized (3 collections created)  
✅ Mock OBS accepts connections  
✅ Bridge service sends heartbeats  
✅ Frontend login works  
✅ Can create commands via UI  
✅ Commands execute idempotently  
✅ Status syncs in real-time  
✅ Double-clicks don't create duplicates  
✅ RBAC rules enforced  

---

## 📞 Need Help?

- **Quick Start**: See `QUICKSTART.md`
- **Detailed Development**: See `docs/DEVELOPMENT.md`
- **Implementation Plan**: See `ROADMAP.md`
- **Issues**: Open GitHub issue with template

---

**Ready to start?** Run `npm run schema:init:local` and follow QUICKSTART.md! 🚀
