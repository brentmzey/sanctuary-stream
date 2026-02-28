# 🚀 Development Environment Automation Scripts

**One-command setup to run all Sanctuary Stream services**

---

## Quick Start

### Option 1: tmux (Recommended - Best for Linux/macOS)

```bash
# Start everything in tmux
./scripts/dev-tmux.sh

# What it does:
# ✅ Creates tmux session with 4 windows
# ✅ Starts PocketBase in window 0
# ✅ Starts Bridge in window 1
# ✅ Starts Web App in window 2
# ✅ Opens Logs/Utils in window 3
# ✅ Auto-attaches to session

# tmux controls:
# - Switch windows: Ctrl+B then [0-3]
# - Detach: Ctrl+B then D
# - Reattach: tmux attach -t sanctuary-stream
# - Kill session: tmux kill-session -t sanctuary-stream
```

### Option 2: iTerm2 (Best for macOS)

```bash
# Start everything in iTerm2 tabs
./scripts/dev-iterm.scpt

# What it does:
# ✅ Opens new iTerm2 window
# ✅ Creates 4 tabs (PocketBase, Bridge, App, Logs)
# ✅ Starts all services automatically
# ✅ Shows status in each tab

# iTerm2 controls:
# - Switch tabs: Cmd+[1-4]
# - Close tab: Cmd+W
```

### Option 3: Simple (Works Everywhere)

```bash
# Start everything in background with logs
./scripts/dev-simple.sh

# What it does:
# ✅ Starts all services in background
# ✅ Shows combined logs in terminal
# ✅ Creates stop script automatically
# ✅ Works on any system

# To stop:
./scripts/stop-dev.sh

# Or manually:
kill <PIDs shown on startup>
```

---

## Scripts Overview

| Script | Best For | Requires | Features |
|--------|----------|----------|----------|
| **dev-tmux.sh** | Linux/macOS power users | tmux | Multiple panes, detachable |
| **dev-iterm.scpt** | macOS users | iTerm2 | Beautiful tabs, native |
| **dev-simple.sh** | Everyone | Just bash | Simple, portable, logs |

---

## What Each Script Does

### 1. `dev-tmux.sh` - tmux Session

**Creates 4 windows**:
```
Window 0: 🗄️  PocketBase   (http://127.0.0.1:8090)
Window 1: ⚙️  Bridge       (OBS connection)
Window 2: 🌐 Web App      (http://localhost:5173)
Window 3: 📊 Logs/Utils   (commands & monitoring)
```

**Features**:
- Persistent sessions (detach/reattach)
- Scrollback buffer
- Copy/paste support
- Custom status bar
- Color-coded windows

**Usage**:
```bash
# Start
./scripts/dev-tmux.sh

# Detach (services keep running)
Ctrl+B then D

# Reattach later
tmux attach -t sanctuary-stream

# Kill when done
tmux kill-session -t sanctuary-stream
```

---

### 2. `dev-iterm.scpt` - iTerm2 AppleScript

**Creates 4 tabs**:
```
Tab 1: 🗄️  PocketBase
Tab 2: ⚙️  Bridge
Tab 3: 🌐 Web App
Tab 4: 📊 Logs & Utilities
```

**Features**:
- Native macOS experience
- Beautiful iTerm2 UI
- Tab titles with emoji
- Automatic command execution
- Notification on launch

**Usage**:
```bash
# Start (opens new iTerm2 window)
./scripts/dev-iterm.scpt

# Or double-click in Finder
# Switch tabs: Cmd+[1-4]
# Close: Cmd+W per tab
```

---

### 3. `dev-simple.sh` - Background Processes

**Starts 3 services**:
```
Service 1: PocketBase  → logs/pocketbase.log
Service 2: Bridge      → logs/bridge.log
Service 3: Web App     → logs/app.log
```

**Features**:
- Works on any system
- No dependencies (just bash)
- Background processes with PIDs
- Combined log output
- Auto-creates stop script

**Usage**:
```bash
# Start (shows logs in terminal)
./scripts/dev-simple.sh

# Ctrl+C stops log watching (services keep running)

# Stop all services
./scripts/stop-dev.sh

# Or manually
kill <PIDs from startup>
```

---

## Installation

### For tmux

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux

# Verify
tmux -V
```

### For iTerm2 (macOS only)

```bash
# Download from: https://iterm2.com
# Or via Homebrew:
brew install --cask iterm2

# Grant permissions:
# System Preferences → Security & Privacy → Automation
# ✅ Enable iTerm2
```

### For Simple (No installation needed)

Just bash - works everywhere!

---

## Service URLs

After starting any script, these services are available:

| Service | URL | Purpose |
|---------|-----|---------|
| **PocketBase Admin** | http://127.0.0.1:8090/_/ | Database admin UI |
| **PocketBase API** | http://127.0.0.1:8090/api/ | REST API |
| **Web App** | http://localhost:5173 | Control panel |
| **Bridge** | N/A | Connects to OBS |

---

## Default Credentials

**Web App Login**:
```
Email: admin@local.dev
Password: admin123456

Other accounts:
- pastor@local.dev / pastor123456
- bridge@local.dev / bridge123456
```

**PocketBase Admin**:
```
Create on first startup at: http://127.0.0.1:8090/_/
```

---

## Logs

### With tmux/iTerm2
- Each window/tab shows its own logs
- Scroll up to see history

### With Simple Script
```bash
# Combined logs
tail -f logs/*.log

# Individual logs
tail -f logs/pocketbase.log
tail -f logs/bridge.log
tail -f logs/app.log
```

---

## Stopping Services

### tmux
```bash
# From inside session
Ctrl+C in each window, then exit

# From outside
tmux kill-session -t sanctuary-stream
```

### iTerm2
```bash
# Close each tab with Cmd+W
# Or close entire window
```

### Simple Script
```bash
# Use generated stop script
./scripts/stop-dev.sh

# Or manually kill PIDs
kill <PID1> <PID2> <PID3>
```

---

## Troubleshooting

### "Port already in use"
```bash
# Kill processes on ports
lsof -ti:8090 | xargs kill -9  # PocketBase
lsof -ti:5173 | xargs kill -9  # Vite
pkill -f sanctuary-bridge      # Bridge
```

### "tmux not found"
```bash
# Install tmux first
brew install tmux           # macOS
sudo apt install tmux       # Linux
```

### "Permission denied"
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.scpt
```

### "PocketBase not found"
```bash
# Download PocketBase
cd pocketbase/local
# Download from: https://pocketbase.io/docs/
# Extract pocketbase binary here
chmod +x pocketbase
```

### iTerm2 permission errors
```bash
# Grant automation permissions:
# System Preferences → Security & Privacy → Automation
# ✅ Enable iTerm2 for System Events
```

---

## Advanced Usage

### tmux Custom Layouts

```bash
# Edit dev-tmux.sh to customize:
# - Window layout
# - Status bar colors
# - Key bindings
# - Pane splits
```

### iTerm2 Profiles

```bash
# Edit dev-iterm.scpt to use custom profiles:
# tell application "iTerm"
#   set newWindow to (create window with profile "Sanctuary")
```

### Background Services

```bash
# Keep services running after logout (Linux)
nohup ./scripts/dev-simple.sh &

# Or use systemd/launchd (see INSTALLATION_GUIDE.md)
```

---

## Examples

### Quick Demo Session

```bash
# 1. Start with tmux (best for demo)
./scripts/dev-tmux.sh

# 2. Open browser
open http://localhost:5173

# 3. Login
# Email: admin@local.dev
# Password: admin123456

# 4. Test features
# - Go to Stream Control
# - Click "🎬 Video Quality"
# - Try "High Quality" preset
# - Monitor stream health

# 5. When done, kill session
tmux kill-session -t sanctuary-stream
```

### Development Workflow

```bash
# Morning: Start services
./scripts/dev-tmux.sh

# During day: Detach and reattach as needed
Ctrl+B, D                    # Detach
# ... do other work ...
tmux attach -t sanctuary-stream  # Reattach

# Evening: Stop everything
tmux kill-session -t sanctuary-stream
```

---

## Comparison

| Feature | tmux | iTerm2 | Simple |
|---------|------|--------|--------|
| **Persistent** | ✅ Yes | ❌ No | ⚠️ Background |
| **Detachable** | ✅ Yes | ❌ No | ❌ No |
| **Beautiful UI** | ⚠️ Basic | ✅ Native | ❌ Terminal |
| **Cross-platform** | ✅ Yes | ❌ macOS only | ✅ Yes |
| **Ease of use** | ⚠️ Medium | ✅ Easy | ✅ Easy |
| **Log viewing** | ✅ Per pane | ✅ Per tab | ⚠️ Combined |

**Recommendation**:
- **Linux**: Use tmux
- **macOS**: Use iTerm2 (or tmux if you prefer)
- **Windows WSL**: Use tmux
- **Windows Native**: Use Simple script
- **CI/CD**: Use Simple script

---

## 🎉 Summary

**One command to start everything**:
```bash
# Choose your favorite:
./scripts/dev-tmux.sh      # tmux (best for power users)
./scripts/dev-iterm.scpt   # iTerm2 (best for macOS)
./scripts/dev-simple.sh    # Simple (works everywhere)
```

**All scripts**:
- ✅ Start PocketBase (database)
- ✅ Start Bridge (OBS connection)
- ✅ Start Web App (control panel)
- ✅ Show logs and status
- ✅ Provide stop commands

**You're ready to develop in 5 seconds! 🚀**

---

**Need help?** See `INSTALLATION_GUIDE.md` for full setup instructions.
