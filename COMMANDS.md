# ⚡ COMMANDS - Quick Reference

**All the commands you need - simple and obvious!**

---

## 🚀 GET STARTED (First Time)

```bash
npm install
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"
npm run setup
npm run dev
```

**Open:** http://localhost:5173  
**Login:** `pastor@local.dev` / `pastor123456`

---

## 🏃 RUN (Development)

```bash
npm run dev
```

Starts everything: database, backend, frontend

---

## 🔨 BUILD (Production)

```bash
npm run build
```

Creates production-ready files in `dist/` folders

---

## 🧪 TEST

```bash
npm test                # Run tests
npm run validate        # Full check (types, lint, tests, build)
```

---

## 🚀 DEPLOY

### Web (Vercel)
```bash
npm install -g vercel
cd sanctuary-app
vercel --prod
```

### Docker
```bash
docker-compose up -d
```

### Desktop Apps
```bash
cd sanctuary-app
npm run tauri build
```

---

## 📋 ALL COMMANDS

| Command | What It Does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run setup` | First-time setup (database, users) |
| `npm run dev` | Start everything (development) |
| `npm run dev:app` | Start frontend only |
| `npm run dev:bridge` | Start backend only |
| `npm run dev:pocketbase` | Start database only |
| `npm run build` | Build everything for production |
| `npm run build:app` | Build frontend only |
| `npm run build:bridge` | Build backend only |
| `npm test` | Run all tests |
| `npm run test:app` | Test frontend |
| `npm run test:bridge` | Test backend |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style issues |
| `npm run format` | Format code with Prettier |
| `npm run validate` | Full validation (CI pipeline) |
| `npm run clean` | Clean build files |
| `npm run clean:all` | Clean everything including node_modules |

---

## 🔧 INDIVIDUAL SERVICES

Run these in separate terminals:

```bash
# Terminal 1
npm run dev:pocketbase

# Terminal 2
npm run dev:bridge

# Terminal 3
npm run dev:app
```

---

## 🐛 TROUBLESHOOTING

**Something not working?**

```bash
npm run clean
npm install
npm run setup
npm run dev
```

**Still stuck?** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 📚 MORE INFO

- [BUILD_COMMANDS.md](./BUILD_COMMANDS.md) - Detailed build guide
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute tutorial
- [DEPLOY.md](./DEPLOY.md) - Deployment guide
- [START_HERE.md](./START_HERE.md) - Full navigation

---

**TL;DR:**
```bash
npm install → npm run setup → npm run dev
```
