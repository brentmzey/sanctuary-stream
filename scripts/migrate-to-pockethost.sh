#!/usr/bin/env bash
# scripts/migrate-to-pockethost.sh
#
# Migrates pb_migrations and pb_hooks to the PocketHost production instance.
#
# What this does:
#   1. FTPs the migration files to the PocketHost pb_migrations directory
#   2. FTPs the hook files to the PocketHost pb_hooks directory
#   3. Runs schema-init.ts against production to apply the migrations via PB API
#
# Usage:
#   bash scripts/migrate-to-pockethost.sh
#
# Prerequisites:
#   - .env file with POCKETHOST_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASS set
#   - curl installed (standard on macOS)
#   - npx / tsx available (node_modules already installed)
#
# PocketHost FTP details:
#   Host: ftp.pockethost.io  Port: 21
#   Username: Your PocketHost account email
#   Password: your PocketHost account password
#
# Directories available on the FTP server:
#   pb_data       — PocketBase data (don't touch this one)
#   pb_public     — Static frontend files
#   pb_migrations — PocketBase migration JS files  ← we write here
#   pb_hooks      — PocketBase JS hook files        ← we write here

set -euo pipefail

# ---------------------------------------------------------------------------
# Load env vars from .env (ignore if not present — CI sets them directly)
# ---------------------------------------------------------------------------
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a && source .env && set +a
fi

# ---------------------------------------------------------------------------
# Validate required vars
# ---------------------------------------------------------------------------
: "${POCKETHOST_URL:?POCKETHOST_URL is required. Set it in .env or the environment.}"
: "${PB_ADMIN_EMAIL:?PB_ADMIN_EMAIL is required.}"
: "${PB_ADMIN_PASS:?PB_ADMIN_PASS is required.}"
: "${POCKETHOST_FTP_USER:?POCKETHOST_FTP_USER is required. This is your PocketHost account email.}"
: "${POCKETHOST_FTP_PASS:?POCKETHOST_FTP_PASS is required. This is your PocketHost account password.}"

# FTP credentials
FTP_USER="${POCKETHOST_FTP_USER}"
FTP_PASS="${POCKETHOST_FTP_PASS}"
FTP_HOST="ftp.pockethost.io"
FTP_PORT="21"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║    Sanctuary Stream — PocketHost Migration           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "→ Target: ${POCKETHOST_URL}"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Upload pb_migrations via FTP
# ---------------------------------------------------------------------------
echo "📁 Step 1/3: Uploading pb_migrations..."

MIGRATIONS_DIR="pocketbase/local/pb_migrations"
MIGRATION_COUNT=0

for f in "${MIGRATIONS_DIR}"/*.js; do
  [ -f "$f" ] || continue
  filename=$(basename "$f")

  curl --silent --show-error \
    --ftp-create-dirs \
    --user "${FTP_USER}:${FTP_PASS}" \
    --upload-file "$f" \
    "ftp://${FTP_HOST}:${FTP_PORT}/pb_migrations/${filename}"

  echo "  ✓ Uploaded: ${filename}"
  MIGRATION_COUNT=$((MIGRATION_COUNT + 1))
done

echo "  → ${MIGRATION_COUNT} migration file(s) uploaded."
echo ""

# ---------------------------------------------------------------------------
# Step 2: Upload pb_hooks via FTP
# ---------------------------------------------------------------------------
echo "🔗 Step 2/3: Uploading pb_hooks..."

HOOKS_DIR="pocketbase/pb_hooks"
HOOK_COUNT=0

for f in "${HOOKS_DIR}"/*.pb.js; do
  [ -f "$f" ] || continue
  filename=$(basename "$f")

  curl --silent --show-error \
    --ftp-create-dirs \
    --user "${FTP_USER}:${FTP_PASS}" \
    --upload-file "$f" \
    "ftp://${FTP_HOST}:${FTP_PORT}/pb_hooks/${filename}"

  echo "  ✓ Uploaded: ${filename}"
  HOOK_COUNT=$((HOOK_COUNT + 1))
done

echo "  → ${HOOK_COUNT} hook file(s) uploaded."
echo ""

# ---------------------------------------------------------------------------
# Step 3: Run schema-init against production PocketBase via API
#
# This applies any pending migrations by calling the PocketBase Admin API
# through schema-init.ts — it handles auth, collection creation, and
# field patching all in one shot.
# ---------------------------------------------------------------------------
echo "🗄️  Step 3/3: Applying migrations via PocketBase Admin API..."

PB_URL="${POCKETHOST_URL}" \
PB_ADMIN_EMAIL="${PB_ADMIN_EMAIL}" \
PB_ADMIN_PASS="${PB_ADMIN_PASS}" \
  npx tsx pocketbase/schema-init.ts production

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Migration complete!                             ║"
echo "║                                                      ║"
echo "║  Verify at:                                          ║"
echo "║  ${POCKETHOST_URL}/_/                               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Collections to verify in the admin UI:"
echo "  • users (with name + role fields)"
echo "  • commands"
echo "  • streams"
echo "  • sermons    ← NEW"
echo "  • announcements ← NEW"
echo "  • resources  ← NEW"
echo ""
echo "Hooks to verify (check pb_hooks folder in admin):"
echo "  • cron.pb.js    — command cleanup + stale stream detection"
echo "  • webhooks.pb.js — sermon published + command audit log"
echo ""
