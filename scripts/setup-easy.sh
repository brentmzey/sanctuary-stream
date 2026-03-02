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

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

# Build everything
echo "🏗️  Building project..."
npm run build --silent
echo "✅ Build complete"
echo ""

# Setup PocketBase symlink if needed
if ! command -v pocketbase &> /dev/null; then
    echo "⚠️  PocketBase not found globally"
    echo "   Install with: brew install pocketbase (macOS)"
    echo "   Or download from: https://pocketbase.io"
else
    echo "✅ PocketBase found"
    cd pocketbase/local
    ln -sf $(which pocketbase) pocketbase 2>/dev/null || true
    cd ../..
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
