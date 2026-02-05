# 🚀 How to Build, Run, Test & Deploy - Sanctuary Stream

**Complete guide for developers, testers, and operators**

---

## 📚 Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Build](#build)
5. [Run (Development)](#run-development)
6. [Test](#test)
7. [Deploy](#deploy)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Clone & Install
git clone <repo-url> sanctuary-stream
cd sanctuary-stream
npm install

# 2. Configure (local dev only)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# 3. Setup (creates database, migrations, test users)
npm run setup

# 4. Run everything
npm run dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend:  http://localhost:8090/_
# Login:    pastor@local.dev / pastor123456
```

Done! ✅

---

## ⚙️ Prerequisites

### Required

- **Node.js** 18+ (22+ recommended)
- **npm** 8+
- **PocketBase** (CLI tool)
- **Git**

### Optional (for development)

- **OBS Studio** (for real streaming tests)
- **Docker** (for containerized deployment)

### Install PocketBase

```bash
# macOS
brew install pocketbase

# Linux
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip pocketbase_linux_amd64.zip
sudo mv pocketbase /usr/local/bin/

# Windows (PowerShell as Admin)
# Download from https://pocketbase.io/docs/
```

Verify:
```bash
pocketbase --version
node --version
npm --version
```

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone <your-repo-url> sanctuary-stream
cd sanctuary-stream
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# This automatically runs:
# - npm install in sanctuary-app/
# - npm install in sanctuary-bridge/
# - Sets up git hooks (husky)
```

### 3. Configure Environment

Create environment-specific variables:

```bash
# Local Development
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# Staging (if needed)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_STAGING="<staging-password>"
export PB_SANCTUARY_STREAM_URL_STAGING="https://staging.pockethost.io"

# Production (if needed)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION="<production-password>"
export PB_SANCTUARY_STREAM_URL_PRODUCTION="https://sanctuary.pockethost.io"
```

**Permanent Setup** (optional):

Add to `~/.bashrc` or `~/.zshrc`:
```bash
echo 'export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Run Setup

```bash
npm run setup
```

This script:
1. ✅ Checks prerequisites (Node, npm, PocketBase)
2. ✅ Installs all npm dependencies
3. ✅ Starts PocketBase server
4. ⏸️ **WAITS FOR YOU** to create admin account
5. ✅ Runs database migrations (creates collections)
6. ✅ Creates test users (local only)
7. ✅ Creates default stream record

**Important**: When prompted, open http://127.0.0.1:8090/_ and create:
- Email: `admin@local.dev`
- Password: `admin123456` (or your env var value)

---

## 🏗️ Build

### Build Everything

```bash
npm run build
```

This builds:
- `sanctuary-app/` → `sanctuary-app/dist/`
- `sanctuary-bridge/` → `sanctuary-bridge/dist/`

### Build Individual Components

```bash
# Frontend only
npm run build:app

# Bridge only
npm run build:bridge
```

### Build Output

```
sanctuary-app/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── favicon.ico

sanctuary-bridge/dist/
├── index.js
└── index.js.map
```

### Production Build

```bash
# Optimized production build
NODE_ENV=production npm run build

# Analyze bundle size
npm run build -- --analyze
```

---

## 🚀 Run (Development)

### Run Everything (Recommended)

```bash
npm run dev
```

Starts:
- **PocketBase** → http://127.0.0.1:8090
- **Bridge** → WS on port 8080
- **Frontend** → http://localhost:5173

### Run Individual Services

```bash
# Frontend only (Vite dev server)
npm run dev:app

# Bridge only (watches for changes)
npm run dev:bridge

# Database only
npm run dev:pocketbase

# Mock OBS (for testing without OBS)
npm run mock:obs
```

### Run All with Mock OBS

```bash
npm run dev:all
```

This runs:
- Mock OBS WebSocket server (port 4455)
- Bridge
- Frontend

### Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main UI |
| PocketBase API | http://127.0.0.1:8090/api/ | REST API |
| PocketBase Admin | http://127.0.0.1:8090/_ | Database UI |
| Bridge WS | ws://localhost:8080 | WebSocket |
| Mock OBS | ws://localhost:4455 | Test OBS |

### Hot Reload

All services support hot reload:
- **Frontend**: Vite HMR (instant updates)
- **Bridge**: Nodemon watches TypeScript files
- **PocketBase**: Auto-reloads on migration changes

---

## 🧪 Test

### Run All Tests

```bash
npm test
```

### Run Tests by Component

```bash
# Frontend tests (Vitest)
npm run test:app

# Bridge tests
npm run test:bridge
```

### Test with Coverage

```bash
npm run test:coverage
```

Generates coverage reports in:
- `sanctuary-app/coverage/`
- `sanctuary-bridge/coverage/`

### Watch Mode

```bash
# Watch and re-run tests on changes
npm run test -- --watch
```

### Specific Test Files

```bash
# Run specific test file
npm run test:app -- stream.test.ts

# Run tests matching pattern
npm run test -- --grep "WebSocket"
```

---

## 🔍 Quality Checks

### Lint

```bash
# Lint all code
npm run lint

# Auto-fix issues
npm run lint:fix

# Lint specific workspace
npm run lint:app
npm run lint:bridge
```

### Type Check

```bash
# Check TypeScript types
npm run typecheck

# Per workspace
npm run typecheck:app
npm run typecheck:bridge
```

### Format Code

```bash
# Format with Prettier
npm run format
```

### Full Validation (CI)

```bash
# Run full validation suite (like CI)
npm run validate
```

This runs:
1. Lint all code
2. Type check all TypeScript
3. Run all tests
4. Build all packages

---

## 🚢 Deploy

### Deployment Options

| Platform | Best For | Cost | Docs |
|----------|----------|------|------|
| **Vercel** | Frontend | Free tier | [Guide](#vercel-deployment) |
| **Railway** | Bridge | $5/mo | [Guide](#railway-deployment) |
| **PocketHost** | Database | Free tier | [Guide](#pockethost-deployment) |
| **Docker** | All-in-one | Self-hosted | [Guide](#docker-deployment) |

---

### Vercel Deployment (Frontend)

**Option 1: CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd sanctuary-app
vercel

# Production
vercel --prod
```

**Option 2: GitHub Integration**

1. Push to GitHub
2. Import project in Vercel dashboard
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `sanctuary-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

**Environment Variables:**
```
VITE_POCKETBASE_URL=https://your-pb-instance.pockethost.io
VITE_BRIDGE_URL=wss://your-bridge.railway.app
```

---

### Railway Deployment (Bridge)

**Option 1: CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd sanctuary-bridge
railway init

# Deploy
railway up
```

**Option 2: GitHub Integration**

1. Connect GitHub repo to Railway
2. Configure service:
   - **Root Directory**: `sanctuary-bridge`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`

**Environment Variables:**
```
POCKETBASE_URL=https://your-pb-instance.pockethost.io
POCKETBASE_ADMIN_EMAIL=admin@yourdomain.com
POCKETBASE_ADMIN_PASSWORD=<secure-password>
OBS_WEBSOCKET_URL=ws://your-obs-server:4455
OBS_WEBSOCKET_PASSWORD=<obs-password>
```

**Port Configuration:**
- Railway auto-assigns `PORT` environment variable
- Bridge listens on `process.env.PORT || 8080`

---

### PocketHost Deployment (Database)

**Steps:**

1. **Sign up**: https://pockethost.io
2. **Create Instance**:
   - Name: `sanctuary-stream`
   - Region: Choose closest
3. **Upload Migrations**:
   ```bash
   # ZIP migrations
   cd pocketbase/migrations
   zip -r migrations.zip *.js
   
   # Upload via PocketHost dashboard
   ```
4. **Create Admin**:
   - Email: `admin@yourdomain.com`
   - Strong password
5. **Configure CORS**:
   - Allow your Vercel domain
   - Allow your Railway domain

**Database URL:**
```
https://sanctuary-stream.pockethost.io
```

---

### Docker Deployment

**All-in-One Container:**

```dockerfile
# Dockerfile (root of project)
FROM node:22-alpine AS builder

# Build frontend
WORKDIR /app/sanctuary-app
COPY sanctuary-app/package*.json ./
RUN npm ci
COPY sanctuary-app/ ./
RUN npm run build

# Build bridge
WORKDIR /app/sanctuary-bridge
COPY sanctuary-bridge/package*.json ./
RUN npm ci
COPY sanctuary-bridge/ ./
RUN npm run build

# Runtime image
FROM node:22-alpine

# Install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip \
    && unzip pocketbase_linux_amd64.zip \
    && mv pocketbase /usr/local/bin/ \
    && rm pocketbase_linux_amd64.zip

# Copy built artifacts
COPY --from=builder /app/sanctuary-app/dist /app/frontend
COPY --from=builder /app/sanctuary-bridge/dist /app/bridge
COPY --from=builder /app/sanctuary-bridge/node_modules /app/bridge/node_modules
COPY pocketbase/migrations /app/pocketbase/migrations

# Setup script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8090 8080 5173

CMD ["/docker-entrypoint.sh"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  sanctuary-stream:
    build: .
    ports:
      - "8090:8090"  # PocketBase
      - "8080:8080"  # Bridge
      - "5173:5173"  # Frontend
    environment:
      - PB_ADMIN_EMAIL=admin@local.dev
      - PB_ADMIN_PASSWORD=admin123456
      - OBS_WEBSOCKET_URL=ws://host.docker.internal:4455
      - OBS_WEBSOCKET_PASSWORD=your-obs-password
    volumes:
      - pb-data:/app/pocketbase/pb_data
    restart: unless-stopped

volumes:
  pb-data:
```

**Run:**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🐛 Troubleshooting

### Setup Issues

**Problem**: `PocketBase failed to start`
```bash
# Check if port is in use
lsof -ti:8090
kill -9 <PID>

# Check PocketBase logs
cat pocketbase/local/pb.log
```

**Problem**: `Collections not found after setup`
```bash
# Migrations didn't run - check migration files
ls -la pocketbase/migrations/

# Restart PocketBase (migrations run on startup)
pkill pocketbase
cd pocketbase/local && pocketbase serve
```

### Build Issues

**Problem**: `Type errors during build`
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Problem**: `Out of memory during build`
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Runtime Issues

**Problem**: `Bridge won't connect to PocketBase`
```bash
# Check PocketBase is running
curl http://127.0.0.1:8090/api/health

# Check admin credentials
echo $PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL

# Check bridge logs
npm run dev:bridge
```

**Problem**: `Frontend shows "Connection failed"`
```bash
# Check all services are running
lsof -ti:5173  # Frontend
lsof -ti:8080  # Bridge
lsof -ti:8090  # PocketBase

# Check browser console for errors
# Open DevTools → Console
```

### Test Issues

**Problem**: `Tests fail with timeout`
```bash
# Increase test timeout
npm run test -- --testTimeout=10000
```

**Problem**: `Mock OBS connection fails`
```bash
# Start mock OBS first
npm run mock:obs

# Then run bridge in another terminal
npm run dev:bridge
```

---

## 🎯 Common Workflows

### Fresh Start

```bash
# Nuclear option - clean everything
npm run clean:all
npm install
npm run setup
npm run dev
```

### Update Dependencies

```bash
# Update all packages
npm update

# Update specific workspace
npm update --workspace=sanctuary-app
```

### Add New Dependency

```bash
# Root workspace
npm install <package>

# Specific workspace
npm install <package> --workspace=sanctuary-app
```

### Create Production Build

```bash
# Build optimized bundles
NODE_ENV=production npm run build

# Verify build
cd sanctuary-app/dist && npx serve
```

### Deploy to Production

```bash
# 1. Tag release
git tag v1.0.0
git push origin v1.0.0

# 2. Build and test
npm run validate

# 3. Deploy frontend (Vercel)
cd sanctuary-app && vercel --prod

# 4. Deploy bridge (Railway)
cd sanctuary-bridge && railway up

# 5. Upload DB migrations (PocketHost)
# Via PocketHost dashboard
```

---

## 📖 Additional Resources

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[BUILD_AND_RUN.md](./BUILD_AND_RUN.md)** - Detailed build guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design
- **[API.md](./docs/API.md)** - API documentation

---

## ✅ Summary Checklist

### Development Setup
- [ ] Node.js 18+ installed
- [ ] PocketBase installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] Setup script run (`npm run setup`)
- [ ] Admin account created
- [ ] Dev server running (`npm run dev`)

### Before Committing
- [ ] Code linted (`npm run lint`)
- [ ] Types checked (`npm run typecheck`)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)

### Before Deploying
- [ ] Full validation passes (`npm run validate`)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Production build tested locally
- [ ] Rollback plan ready

---

**Need Help?**

- Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Review [GitHub Issues](./issues)
- Contact: dev@sanctuary-stream.com

---

*Last Updated: 2026-02-04*
*Version: 1.0.0*
