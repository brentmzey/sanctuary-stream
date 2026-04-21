#!/bin/bash
# ⛪ Sanctuary Stream - Automated Installer
# Usage: curl -sSL https://raw.githubusercontent.com/brentmzey/sanctuary-stream/main/install.sh | bash

set -e

REPO="brentmzey/sanctuary-stream"
API_URL="https://api.github.com/repos/$REPO/releases/latest"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        Sanctuary Stream - Automated Installer                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

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

if [ -z "$ASSETS" ]; then
    echo "❌ Error: Could not fetch release info. Please check your internet connection."
    exit 1
fi

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
    echo "❌ Error: No stable installer found for $OS_TYPE"
    echo "Falling back to development builds..."
    DOWNLOAD_URL=$(echo "$ASSETS" | head -n 1 | cut -d '"' -f 4)
    FILENAME="sanctuary-stream-latest"
fi

# 3. Download
echo "🚀 Downloading from: $DOWNLOAD_URL"
curl -L "$DOWNLOAD_URL" -o "$FILENAME"

echo "✅ Download complete: $FILENAME"

# 4. Instructions
echo ""
echo "🎉 Next Steps:"
if [ "$OS_TYPE" == "macos" ]; then
    echo "   1. Open $FILENAME"
    echo "   2. Drag Sanctuary Stream to your Applications folder."
    echo "   3. Launch from Applications (Right-click -> Open if prompted)."
elif [ "$OS_TYPE" == "linux" ]; then
    chmod +x "$FILENAME"
    echo "   1. Run the app: ./$FILENAME"
elif [ "$OS_TYPE" == "windows" ]; then
    echo "   1. Run $FILENAME to start the installer."
    echo "   2. Launch from your Start Menu."
fi

echo ""
echo ""
echo "⛪ Sanctuary Stream is now ready to use."
echo "Need help? Visit https://github.com/$REPO"
echo ""
