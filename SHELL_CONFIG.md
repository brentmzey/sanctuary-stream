# 🚀 Sanctuary Stream - Shell Configuration

**Add these environment variables to your shell config**

---

## 📝 Option 1: ~/.zshenv (Recommended)

Add this to `~/.zshenv` for all shell sessions:

```bash
# Sanctuary Stream - PocketBase Admin Passwords
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_STAGING="your-staging-password"
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION="your-production-password"
```

**Quick add:**
```bash
cat >> ~/.zshenv << 'EOF'

# Sanctuary Stream - PocketBase Admin Passwords
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_STAGING="your-staging-password"
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION="your-production-password"
EOF

source ~/.zshenv
```

---

## 📝 Option 2: ~/.zshrc (Alternative)

Add this to `~/.zshrc` for interactive shells only:

```bash
# Sanctuary Stream - PocketBase Admin Passwords
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"
```

**Quick add:**
```bash
echo 'export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"' >> ~/.zshrc
source ~/.zshrc
```

---

## 💡 Difference Between Files

| File | Loaded When | Best For |
|------|-------------|----------|
| `~/.zshenv` | **All shells** (login, non-login, scripts) | ✅ Environment variables |
| `~/.zshrc` | **Interactive shells** only | Aliases, functions, prompts |

**Recommendation**: Use `~/.zshenv` so the variable is available to scripts and background processes.

---

## ✅ Verify It's Set

```bash
# Check if variable is set
echo $PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL
# Should output: admin123456
```

---

## 🚀 Quick Start After Adding Variable

```bash
# 1. Reload your shell config
source ~/.zshenv

# 2. Run setup (will use the env var automatically)
cd ~/sanctuary-stream
./scripts/setup.sh

# 3. Setup will:
#    - Stop any existing PocketBase
#    - Start fresh instance
#    - Use your password from env var
#    - Initialize schema
#    - Create test users
```

---

## 🔐 Security Note

The local development password (`admin123456`) is fine for local testing. 

For staging/production:
- Use strong, unique passwords
- Never commit passwords to git
- Consider using a password manager
- Rotate passwords regularly

---

## 🎯 Environment-Specific Passwords

```bash
# Local Development (weak password is OK)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# Staging (use stronger password)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_STAGING="Staging!2024$Secure"

# Production (use very strong password)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION="Prod!V3ry$trongP@ss2024"
```

---

## 📦 What Uses These Variables

The setup script (`scripts/setup.sh`) automatically:
1. Reads `PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL`
2. Passes it to `pocketbase/schema-init.js`
3. Uses it to authenticate with PocketBase Admin API
4. Creates collections and test users

You don't need to set it manually when running setup!

---

## 🔄 Re-running Setup

The setup is idempotent - run it as many times as you want:

```bash
./scripts/setup.sh  # First run
./scripts/setup.sh  # Second run - stops old PocketBase, starts fresh
./scripts/setup.sh  # Third run - still works!
```

Each run:
- ✅ Stops existing PocketBase
- ✅ Cleans old data
- ✅ Starts fresh instance
- ✅ Re-initializes schema

---

## ✨ Done!

After adding the env var to your shell config, you're ready to develop! 🎉
