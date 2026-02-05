# 🚀 Complete Build, Test & Deploy Guide

**Everything you need to build, test, and deploy Sanctuary Stream**

---

## 📑 Quick Navigation

- [Quick Start](#-quick-start-5-minutes) - Get running in 5 minutes
- [Build](#-building) - How to build for production
- [Test](#-testing) - Running tests and validation
- [Deploy](#-deployment) - Deploy to production
- [Distribute](#-distribution) - Create installers

---

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Clone and install
git clone <repo-url> sanctuary-stream
cd sanctuary-stream
npm install

# 2. Set admin password
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# 3. Run setup (creates everything)
npm run setup

# 4. Start all services
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- PocketBase: http://127.0.0.1:8090/_
- Login: `pastor@local.dev` / `pastor123456`

---

## 🔨 Building

### Build Everything

```bash
# Production build (all components)
npm run build

# Output:
# - sanctuary-app/dist/ (frontend)
# - sanctuary-bridge/dist/ (backend service)
```

### Build Individual Components

```bash
# Frontend only
npm run build:app

# Bridge service only
npm run build:bridge
```

### Build Desktop Apps (Tauri)

```bash
cd sanctuary-app

# macOS (universal binary)
npm run tauri build -- --target universal-apple-darwin

# Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# Linux
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

**Outputs:**
- **macOS**: `sanctuary-app/src-tauri/target/release/bundle/macos/Sanctuary Stream.app`
- **Windows**: `sanctuary-app/src-tauri/target/release/bundle/msi/Sanctuary Stream_*.msi`
- **Linux**: `sanctuary-app/src-tauri/target/release/bundle/deb/sanctuary-stream_*.deb`

---

## 🧪 Testing

### Run All Tests

```bash
# Full test suite
npm test

# With coverage
npm run test:coverage

# Watch mode (development)
npm run test:watch
```

### Test Individual Components

```bash
# Frontend tests only
npm run test:app

# Bridge tests only
npm run test:bridge
```

### Type Checking

```bash
# Check all TypeScript
npm run typecheck

# Individual workspaces
npm run typecheck:app
npm run typecheck:bridge
```

### Linting

```bash
# Lint everything
npm run lint

# Auto-fix issues
npm run lint:fix

# Individual workspaces
npm run lint:app
npm run lint:bridge
```

### Full Validation (CI Pipeline)

```bash
# Run complete validation
npm run validate

# This runs:
# 1. Type checking (all workspaces)
# 2. Linting (all workspaces)
# 3. Tests (all workspaces)
# 4. Build (production)
```

---

## 🏃 Running Locally

### Development Mode

```bash
# Start everything together
npm run dev

# Services started:
# - PocketBase → :8090
# - Bridge → :3001
# - Frontend → :5173
```

### Start Services Individually

```bash
# Terminal 1: Database
npm run dev:pocketbase

# Terminal 2: Backend
npm run dev:bridge

# Terminal 3: Frontend
npm run dev:app

# Terminal 4: Mock OBS (optional)
npm run mock:obs
```

### Production Mode Locally

```bash
# Build first
npm run build

# Start PocketBase
cd pocketbase/local && pocketbase serve

# Start bridge
cd sanctuary-bridge && node dist/index.js

# Serve frontend
cd sanctuary-app/dist && npx serve -s .
```

---

## 🚀 Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
cd sanctuary-app
npm run build
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_POCKETBASE_URL = https://your-railway-app.railway.app
# VITE_BRIDGE_URL = https://your-bridge.railway.app
```

#### Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION=<password>
```

---

### Option 2: PocketHost (Managed Database)

```bash
# 1. Sign up at pockethost.io
# 2. Create new instance
# 3. Upload migrations from pocketbase/migrations/
# 4. Initialize schema:

export PB_SANCTUARY_STREAM_URL_PRODUCTION=https://your-instance.pockethost.io
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION=<password>
npm run schema:init:production
```

---

### Option 3: Docker

#### Using Docker Compose

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - ./pocketbase/local:/pb_data
      - ./pocketbase/migrations:/pb_migrations
    environment:
      - PB_ADMIN_EMAIL=admin@sanctuary.local
      - PB_ADMIN_PASSWORD=${PB_ADMIN_PASSWORD}

  bridge:
    build:
      context: .
      dockerfile: sanctuary-bridge/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - POCKETBASE_URL=http://pocketbase:8090
      - OBS_WEBSOCKET_URL=ws://obs:4455
    depends_on:
      - pocketbase

  app:
    build:
      context: .
      dockerfile: sanctuary-app/Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_POCKETBASE_URL=http://pocketbase:8090
      - VITE_BRIDGE_URL=http://bridge:3001
    depends_on:
      - pocketbase
      - bridge
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 4: Self-Hosted (VPS)

```bash
# On Ubuntu/Debian server

# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# 2. Clone and build
git clone <repo-url> /var/www/sanctuary-stream
cd /var/www/sanctuary-stream
npm install
npm run build

# 3. Install PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
sudo mv pocketbase /usr/local/bin/

# 4. Create systemd service for PocketBase
sudo tee /etc/systemd/system/pocketbase.service << 'EOF'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sanctuary-stream/pocketbase/local
ExecStart=/usr/local/bin/pocketbase serve --http=0.0.0.0:8090
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 5. Create systemd service for Bridge
sudo tee /etc/systemd/system/sanctuary-bridge.service << 'EOF'
[Unit]
Description=Sanctuary Bridge
After=network.target pocketbase.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/sanctuary-stream/sanctuary-bridge
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production
Environment=POCKETBASE_URL=http://localhost:8090

[Install]
WantedBy=multi-user.target
EOF

# 6. Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable pocketbase sanctuary-bridge
sudo systemctl start pocketbase sanctuary-bridge

# 7. Configure Nginx
sudo tee /etc/nginx/sites-available/sanctuary-stream << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/sanctuary-stream/sanctuary-app/dist;
        try_files $uri $uri/ /index.html;
    }

    # PocketBase API
    location /api/ {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Bridge API
    location /bridge/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/sanctuary-stream /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. Setup SSL with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# 9. Initialize database
cd /var/www/sanctuary-stream
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION="secure-password"
npm run schema:init:production
```

---

## 📱 Distribution

### Desktop Apps (Tauri)

#### macOS Distribution

```bash
cd sanctuary-app

# Build universal binary
npm run tauri build -- --target universal-apple-darwin

# Sign (requires Apple Developer account)
codesign --force --deep --sign "Developer ID Application: Your Name" \
  "src-tauri/target/release/bundle/macos/Sanctuary Stream.app"

# Create DMG installer
create-dmg \
  --volname "Sanctuary Stream" \
  --window-size 800 400 \
  --app-drop-link 600 185 \
  "Sanctuary-Stream-Installer.dmg" \
  "src-tauri/target/release/bundle/macos/Sanctuary Stream.app"
```

#### Windows Distribution

```bash
cd sanctuary-app

# Build installer
npm run tauri build -- --target x86_64-pc-windows-msvc

# Output: sanctuary-app/src-tauri/target/release/bundle/msi/Sanctuary Stream_*.msi

# Sign (requires code signing certificate)
signtool sign /f certificate.pfx /p password \
  "src-tauri/target/release/bundle/msi/Sanctuary Stream_*.msi"
```

#### Linux Distribution

```bash
cd sanctuary-app

# Build .deb package
npm run tauri build -- --target x86_64-unknown-linux-gnu

# Build .AppImage
npm run tauri build -- --target x86_64-unknown-linux-gnu --bundles appimage

# Build .rpm
cargo install cargo-generate-rpm
npm run tauri build -- --target x86_64-unknown-linux-gnu --bundles rpm
```

---

## 🤖 CI/CD

### GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm install
        
      - name: Run validation
        run: npm run validate
        
  build:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          
      - name: Install and build
        run: |
          npm install
          npm run build
        
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            sanctuary-app/dist/
            sanctuary-bridge/dist/
            
  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: npx vercel --token=${{ secrets.VERCEL_TOKEN }} --prod
```

---

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear caches
npm cache clean --force
rm -rf node_modules sanctuary-app/node_modules sanctuary-bridge/node_modules

# Reinstall
npm install

# Rebuild
npm run build
```

### Test Issues

```bash
# Run in CI mode
CI=true npm test

# Run sequentially
npm test -- --runInBand
```

### Deployment Issues

```bash
# Check environment
npm run validate

# Verify migrations
cd pocketbase/local
pocketbase migrate status

# Reset if needed
npm run clean
npm run setup
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations ready

### Production

- [ ] SSL certificates configured
- [ ] Domain configured
- [ ] Admin password set (strong)
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Error tracking enabled

### Post-Deployment

- [ ] Smoke tests passed
- [ ] Admin login works
- [ ] Stream controls work
- [ ] Recording works
- [ ] Logs accessible

---

## 📚 Related Documentation

- [QUICKSTART.md](./QUICKSTART.md) - 5-minute quick start
- [BUILD_AND_RUN.md](./BUILD_AND_RUN.md) - Detailed build guide
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines

---

**Ready to deploy! 🚀**
