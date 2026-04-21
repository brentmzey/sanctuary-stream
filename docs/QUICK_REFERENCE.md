# 🚀 Quick Reference - Essential Commands

Fast reference for common development tasks.

---

## 🏗️ Getting Started

```bash
# Automated setup (dependencies, PocketBase, schema, .env)
# 🚀 Use Bun for 2-3x faster setup!
bun run setup
# Or fallback to npm
npm run setup

# Start everything (PocketBase, App, Bridge, Mock OBS)
bun run dev:full
# Or fallback to npm
npm run dev:full
```

---

## 📦 Setup & Install

```bash
# Install all dependencies (manual)
bun install
# Or fallback to npm
npm install

# Clean install (fresh node_modules)
bun install --no-save
# Or fallback to npm
npm ci

# Full clean + reinstall
bun run clean:all && bun install
# Or fallback to npm
npm run clean:all && npm install
```

---

## 🚀 Local Development

```bash
# Start all services (PocketBase, App, Bridge)
bun run dev
# Or fallback to npm
npm run dev

# Start with mock OBS (Full stack)
bun run dev:full

# Start individual services
bun run dev:pocketbase  # Database (port 8090)
bun run dev:app         # Frontend (port 5173)
bun run dev:bridge      # Backend service
```
# Access at: http://localhost:5173
# Login: admin@local.dev / admin123456
```
---

## 🚢 Release

```bash
# Automated release (from development branch)
# Bumps versions, merges to main, tags, and pushes
npm run release
```

---

## 🧹 Clean Up

```bash
# Remove build artifacts
npm run clean

# Full clean (includes node_modules)
npm run clean:all

# Kill stuck processes
killall node pocketbase
```

---

## 📝 Code Quality

```bash
# Format code with Prettier
npm run format

# Full pre-commit validation
./validate.sh

# Check specific validation
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm test                # Unit tests
npm audit --production  # Security
```

---

## 🔍 Troubleshooting

```bash
# Port already in use
lsof -i :8090          # Find process on port 8090
kill -9 <PID>          # Kill the process

# Dependencies issue
npm cache clean --force
rm -rf node_modules
npm install

# Build cache issue
npm run clean && npm run build

# Verify everything works
./validate.sh
```

---

## 📊 Status Checks

```bash
# Check everything
./validate.sh

# Quick health check
npm run typecheck && npm run lint && npm test
```

---

## 📚 Documentation

| Need | Document |
|------|----------|
| Detailed build/test guide | [DEVELOPMENT.md](DEVELOPMENT.md) |
| Contributing guidelines | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Operations/Deployment | [OPERATIONS.md](OPERATIONS.md) |
| Production Setup | [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) |
| Code style | [FUNCTIONAL_STYLE.md](FUNCTIONAL_STYLE.md) |
| All docs | [INDEX.md](INDEX.md) |

---

**Pro Tip:** Run `./validate.sh` before every commit!
