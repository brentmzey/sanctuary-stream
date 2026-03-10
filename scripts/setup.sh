#!/bin/bash
# Sanctuary Stream - Complete Setup Script
# Run this to go from zero to working local development

set -e  # Exit on error

echo "🏛️ Sanctuary Stream - Automated Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check for PocketBase
PB_BIN="pocketbase"
if [ -f "pocketbase/local/pocketbase" ]; then
    PB_BIN="./pocketbase/local/pocketbase"
    echo -e "${GREEN}✅ Local PocketBase binary found${NC}"
elif command -v pocketbase &> /dev/null; then
    PB_BIN="pocketbase"
    echo -e "${GREEN}✅ PocketBase found in PATH${NC}"
else
    echo -e "${YELLOW}⚠️  PocketBase not found. Installing locally...${NC}"
    mkdir -p pocketbase/local
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ $(uname -m) == 'arm64' ]]; then
            URL="https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_arm64.zip"
        else
            URL="https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip"
    else
        echo -e "${RED}❌ Unsupported OS for automatic PocketBase download.${NC}"
        exit 1
    fi
    
    curl -L $URL -o pocketbase/local/pb.zip
    unzip -o pocketbase/local/pb.zip -d pocketbase/local
    rm pocketbase/local/pb.zip
    chmod +x pocketbase/local/pocketbase
    PB_BIN="./pocketbase/local/pocketbase"
    echo -e "${GREEN}✅ PocketBase installed locally${NC}"
fi

echo ""
echo "📦 Step 2: Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "🗄️ Step 3: Setting up PocketBase..."

if lsof -Pi :8090 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:8090 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

mkdir -p pocketbase/local
cd pocketbase/local
nohup ../../$PB_BIN serve --http=127.0.0.1:8090 > pb.log 2>&1 &
PB_PID=$!
echo $PB_PID > pb.pid

echo "Waiting for PocketBase to start..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PocketBase started${NC}"
        break
    fi
    sleep 1
done
cd ../..

echo ""
echo "🔐 Step 4: Creating admin account..."
cd pocketbase/local
../../$PB_BIN superuser upsert admin@local.dev admin123456 > /dev/null 2>&1
cd ../..

echo ""
echo "🏗️ Step 5: Initializing Database Schema..."
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL=admin123456
npm run schema:init:local
echo -e "${GREEN}✅ Schema initialized${NC}"

echo ""
echo "📝 Step 6: Creating environment files..."
STREAM_ID=$(curl -s http://127.0.0.1:8090/api/collections/streams/records | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
STREAM_ID=${STREAM_ID:-"default_stream"}

cat > sanctuary-bridge/.env << EOF
PB_URL=http://127.0.0.1:8090
BRIDGE_EMAIL=bridge@local.dev
BRIDGE_PASS=bridge123
OBS_URL=ws://127.0.0.1:4455
STREAM_ID=${STREAM_ID}
EOF

cat > sanctuary-app/.env << EOF
VITE_PB_URL=http://127.0.0.1:8090
VITE_STREAM_ID=${STREAM_ID}
EOF

echo -e "${GREEN}✅ Environment files configured${NC}"

echo ""
echo "🔍 Step 7: Verifying installation..."
./scripts/validate.sh

echo ""
echo "✅ Setup Complete!"
echo "======================================"
echo "🚀 Next Steps:"
echo -e "   ${GREEN}npm run dev:full${NC}"
echo "======================================"
