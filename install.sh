#!/bin/bash
# Sanctuary Stream - One-Command Installer
# Usage: curl -sSL https://raw.githubusercontent.com/brentmzey/sanctuary-stream/main/install.sh | bash

set -e

REPO="brentmzey/sanctuary-stream"
API_URL="https://api.github.com/repos/$REPO/releases/latest"

echo "🏛️ Sanctuary Stream - Automated Installer"
echo "=========================================="

# 1. Detect OS
OS_TYPE="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "win32"* ]]; then
    OS_TYPE="windows"
fi

echo "🔍 Detected OS: $OS_TYPE"

# 2. Get download URL
echo "📥 Fetching latest release information..."
ASSETS=$(curl -s $API_URL | grep "browser_download_url")

DOWNLOAD_URL=""
FILENAME=""

if [ "$OS_TYPE" == "macos" ]; then
    DOWNLOAD_URL=$(echo "$ASSETS" | grep ".dmg" | head -n 1 | cut -d '"' -f 4)
    FILENAME="sanctuary-stream.dmg"
elif [ "$OS_TYPE" == "linux" ]; then
    DOWNLOAD_URL=$(echo "$ASSETS" | grep ".AppImage" | head -n 1 | cut -d '"' -f 4)
    FILENAME="sanctuary-stream.AppImage"
elif [ "$OS_TYPE" == "windows" ]; then
    DOWNLOAD_URL=$(echo "$ASSETS" | grep ".msi" | head -n 1 | cut -d '"' -f 4)
    FILENAME="sanctuary-stream-setup.msi"
fi

if [ -z "$DOWNLOAD_URL" ]; then
    echo "❌ Error: Could not find a suitable download for $OS_TYPE"
    echo "Please visit https://github.com/$REPO/releases to download manually."
    exit 1
fi

# 3. Download
echo "🚀 Downloading from $DOWNLOAD_URL..."
curl -L "$DOWNLOAD_URL" -o "$FILENAME"

echo "✅ Download complete: $FILENAME"

# 4. Instructions
if [ "$OS_TYPE" == "macos" ]; then
    echo "👉 To install: Open $FILENAME and drag Sanctuary Stream to your Applications folder."
elif [ "$OS_TYPE" == "linux" ]; then
    chmod +x "$FILENAME"
    echo "👉 To install: Run ./$FILENAME"
elif [ "$OS_TYPE" == "windows" ]; then
    echo "👉 To install: Run $FILENAME to start the installer."
fi

# 5. Backend prompt
echo ""
echo "🗄️  Note: This installs the Control App only."
echo "   If you need to set up a new server/bridge, see the documentation:"
echo "   https://github.com/$REPO/blob/main/docs/PRODUCTION_SETUP.md"
