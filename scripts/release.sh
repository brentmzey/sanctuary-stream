#!/bin/bash
# scripts/release.sh
# Automated version bumping and release process for Sanctuary Stream

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_step() { echo -e "${BLUE}▶${NC} $1"; }
log_success() { echo -e "${GREEN}✅${NC} $1"; }
log_error() { echo -e "${RED}❌${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠️${NC}  $1"; }

# 1. Safety Checks
log_step "Running safety checks..."

CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "development" ]; then
    log_error "Releases must be started from the 'development' branch."
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    log_error "Working tree is not clean. Please commit or stash changes first."
    exit 1
fi

# 2. Get Version
if [ -z "$1" ]; then
    echo -e "${YELLOW}Current versions:${NC}"
    echo -e "  Root:   $(node -p "require('./package.json').version")"
    echo -e "  App:    $(node -p "require('./sanctuary-app/package.json').version")"
    echo -e "  Tauri:  $(node -p "require('./sanctuary-app/src-tauri/tauri.conf.json').package.version")"
    echo ""
    read -p "Enter new version (e.g., 0.1.0): " VERSION
else
    VERSION=$1
fi

# Basic version format validation (X.Y.Z)
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
    log_error "Invalid version format. Use X.Y.Z or X.Y.Z-TAG"
    exit 1
fi

log_step "Releasing version v$VERSION..."

# 3. Bump Versions in all files
log_step "Updating version in configuration files..."

# Function to update JSON version
update_version() {
    FILE=$1
    NEW_VER=$2
    # Use node to reliably update JSON
    node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$FILE', 'utf8'));
        if ('$FILE'.includes('tauri.conf.json')) {
            data.package.version = '$NEW_VER';
        } else {
            data.version = '$NEW_VER';
        }
        fs.writeFileSync('$FILE', JSON.stringify(data, null, 2) + '\n');
    "
}

update_version "package.json" "$VERSION"
update_version "sanctuary-app/package.json" "$VERSION"
update_version "sanctuary-bridge/package.json" "$VERSION"
update_version "sanctuary-cli/package.json" "$VERSION"
update_version "sanctuary-app/src-tauri/tauri.conf.json" "$VERSION"

# Update package-lock.json
log_step "Updating package-lock.json..."
npm install --package-lock-only > /dev/null 2>&1

log_success "All versions updated to $VERSION"

# 4. Final Validation
log_step "Running automated setup and validation..."
npm run setup > /dev/null 2>&1
./validate.sh

# 5. Commit Version Bump
log_step "Committing version bump..."
git add -A
git commit -m "chore: bump version to v$VERSION"

# 6. Merge and Tag
log_step "Merging to main and tagging..."
git checkout main
git pull origin main
git merge development --no-ff -m "chore: release v$VERSION"
git tag -a "v$VERSION" -m "Release v$VERSION"

# 7. Push everything
log_step "Pushing changes to GitHub..."
git push origin main
git push origin "v$VERSION"

# 8. Return to development
log_step "Syncing development branch..."
git checkout development
git merge main
git push origin development

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║             🎉 RELEASE v$VERSION SUCCESSFULLY CUT! 🎉           ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "🚀 NEXT STEPS:"
echo "1. GitHub Actions will now build binaries for all platforms."
echo "2. Monitor progress: https://github.com/brentmzey/sanctuary-stream/actions"
echo "3. Draft release notes on GitHub: https://github.com/brentmzey/sanctuary-stream/releases"
echo ""
