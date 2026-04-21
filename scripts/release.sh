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
ROOT_VERSION=$(node -p "require('./package.json').version")
if [ -z "$1" ]; then
    echo -e "${YELLOW}Current versions:${NC}"
    echo -e "  Root:   $ROOT_VERSION"
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

# Check if version already exists
TAG_EXISTS=$(git tag -l "v$VERSION")
if [ "$VERSION" == "$ROOT_VERSION" ] || [ -n "$TAG_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Version $VERSION already exists (or matches current).${NC}"
    read -p "ARE YOU SURE YOU WANT TO OVERWRITE/RE-RELEASE? (y/N) " CONFIRM
    if [[ ! $CONFIRM =~ ^[yY]$ ]]; then
        log_error "Release aborted."
        exit 1
    fi
    
    # If tag exists, we'll need to handle it later (either delete or force tag)
    if [ -n "$TAG_EXISTS" ]; then
        log_warn "Tag v$VERSION already exists locally. It will be moved/overwritten."
    fi
fi

log_step "Releasing version v$VERSION..."

# 3. Bump Versions in all files
log_step "Updating version in configuration files..."

# Function to update JSON version
update_version() {
    FILE=$1
    NEW_VER=$2
    if [ ! -f "$FILE" ]; then
        log_warn "File $FILE not found, skipping..."
        return
    fi
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
update_version "sanctuary-cli/package.json" "$VERSION"
update_version "sanctuary-app/src-tauri/tauri.conf.json" "$VERSION"

# Update Rust crate versions
for cargo_file in sanctuary-core/Cargo.toml sanctuary-cli-rs/Cargo.toml sanctuary-app/src-tauri/Cargo.toml; do
    if [ -f "$cargo_file" ]; then
        sed -i.bak "s/^version = \".*\"/version = \"$VERSION\"/" "$cargo_file" && rm -f "${cargo_file}.bak"
        log_success "Updated $cargo_file"
    fi
done

# Update build.gradle
if [ -f "build.gradle" ]; then
    sed -i.bak "s/^version '.*'/version '$VERSION'/" "build.gradle" && rm -f "build.gradle.bak"
    log_success "Updated build.gradle"
fi

# Update package-lock.json
log_step "Updating package-lock.json..."
npm install --package-lock-only > /dev/null 2>&1 || log_warn "package-lock.json update failed, continuing..."

log_success "All versions updated to $VERSION"

# 4. Final Validation
log_step "Running automated setup and validation..."
npm run setup > /dev/null 2>&1 || log_warn "Setup failed, continuing with validation..."
./validate.sh

# 5. Commit Version Bump
log_step "Committing version bump..."
git add -A
# Only commit if there are changes
if ! git diff-index --quiet HEAD --; then
    git commit -m "chore: bump version to v$VERSION"
else
    log_warn "No version changes to commit."
fi

# 6. Merge and Tag
log_step "Merging to main and tagging..."
git checkout main
git pull origin main
git merge development --no-ff -m "chore: release v$VERSION" || (log_warn "Merge conflict or already up to date, continuing..." && git merge --abort >/dev/null 2>&1 || true)

# Force tag if it already exists
if [ -n "$(git tag -l "v$VERSION")" ]; then
    log_warn "Forcing tag v$VERSION..."
    git tag -a "v$VERSION" -m "Release v$VERSION" -f
else
    git tag -a "v$VERSION" -m "Release v$VERSION"
fi

# 7. Push everything
log_step "Pushing changes to GitHub..."
git push origin main
git push origin "v$VERSION" --force

# 8. Return to development
log_step "Syncing development branch..."
git checkout development
git merge main || (log_warn "Merge back to development failed, please check manually." && exit 1)
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
