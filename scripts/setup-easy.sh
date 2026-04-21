#!/bin/bash
# Sanctuary Stream - One-Click Setup for New Users
# Just run: ./scripts/setup-easy.sh

set -e

echo "🏛️  Sanctuary Stream - Easy Setup"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Please install Node.js first:"
    echo "   👉 https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo ""

# Install dependencies (including workspaces)
echo "📦 Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Build everything
echo "🏗️  Building project..."
npm run build --silent
echo "✅ Build complete"
echo ""

# Setup PocketBase
if [ -f "pocketbase/local/pocketbase" ]; then
    echo "✅ PocketBase binary found"
elif command -v pocketbase &> /dev/null; then
    echo "✅ PocketBase found in PATH"
else
    echo "⚠️  PocketBase not found."
    echo "   Run the full setup instead: ./scripts/setup.sh"
    echo "   It will download PocketBase automatically."
fi
echo ""

# Success!
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 To start everything:"
echo "   npm run dev:simple"
echo ""
echo "🌐 Then open:"
echo "   http://localhost:5173"
echo ""
echo "🔐 Test login:"
echo "   Email: pastor@local.dev"
echo "   Password: pastor123456"
echo ""
