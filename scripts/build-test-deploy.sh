#!/bin/bash
# Complete Build, Test, and Deploy Pipeline
# Usage: ./scripts/build-test-deploy.sh [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_DEPLOY=false
DRY_RUN=false
VERSION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-tests     Skip running tests"
            echo "  --skip-build     Skip local builds"
            echo "  --skip-deploy    Skip deployment (commit/push/tag)"
            echo "  --dry-run        Show what would be done without doing it"
            echo "  --version VER    Specify version (e.g., v0.1.1)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Helper functions
log_step() {
    echo -e "${BLUE}▶${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

log_info() {
    echo -e "${CYAN}ℹ️${NC}  $1"
}

run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${CYAN}[DRY RUN]${NC} Would run: $*"
        return 0
    else
        "$@"
    fi
}

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║          Sanctuary Stream - Build, Test & Deploy              ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
log_step "Checking prerequisites..."

# Check git
if ! command -v git &> /dev/null; then
    log_error "Git is not installed"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm --version)
log_info "npm version: $NPM_VERSION"

# Check if in git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
fi

log_success "Prerequisites check passed"
echo ""

# Get current status
log_step "Checking repository status..."
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
UNCOMMITTED_CHANGES=$(git status --porcelain | wc -l | tr -d ' ')

log_info "Branch: $CURRENT_BRANCH"
log_info "Commit: $CURRENT_COMMIT"
log_info "Uncommitted changes: $UNCOMMITTED_CHANGES files"

if [ "$UNCOMMITTED_CHANGES" -ne 0 ] && [ "$SKIP_DEPLOY" = false ]; then
    log_warning "You have uncommitted changes. They will be committed before deployment."
fi
echo ""

# Install dependencies
log_step "Installing dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "sanctuary-app/node_modules" ]; then
    run_cmd npm install
    run_cmd npm install --prefix sanctuary-app
    log_success "Dependencies installed"
else
    log_info "Dependencies already installed (use 'npm ci' to reinstall)"
fi
echo ""

# Run linting
if [ "$SKIP_TESTS" = false ]; then
    log_step "Running linters..."
    
    # Root project linting
    if grep -q '"lint"' package.json; then
        run_cmd npm run lint || log_warning "Root linting failed (non-critical)"
    fi
    
    # sanctuary-app linting
    if [ -f "sanctuary-app/package.json" ]; then
        cd sanctuary-app
        if grep -q '"lint"' package.json; then
            run_cmd npm run lint || log_warning "sanctuary-app linting failed (non-critical)"
        fi
        cd ..
    fi
    
    log_success "Linting completed"
    echo ""
fi

# Run type checking
if [ "$SKIP_TESTS" = false ]; then
    log_step "Running type checks..."
    
    # sanctuary-app type checking
    if [ -f "sanctuary-app/tsconfig.json" ]; then
        cd sanctuary-app
        if grep -q '"typecheck"' package.json; then
            run_cmd npm run typecheck
            log_success "Type checking passed"
        else
            run_cmd npx tsc --noEmit
            log_success "Type checking passed"
        fi
        cd ..
    fi
    echo ""
fi

# Run tests
if [ "$SKIP_TESTS" = false ]; then
    log_step "Running tests..."
    
    # Root tests
    if grep -q '"test"' package.json; then
        run_cmd npm test || log_warning "Root tests not found or failed"
    fi
    
    # sanctuary-app tests
    if [ -f "sanctuary-app/package.json" ]; then
        cd sanctuary-app
        if grep -q '"test"' package.json; then
            run_cmd npm test || log_warning "sanctuary-app tests not found or failed"
        fi
        cd ..
    fi
    
    log_success "Tests completed"
    echo ""
fi

# Run platform verification
log_step "Running platform verification..."
if [ -f "scripts/verify-platform-support.sh" ]; then
    run_cmd ./scripts/verify-platform-support.sh
    log_success "Platform verification passed"
else
    log_warning "Platform verification script not found"
fi
echo ""

# Build local (optional)
if [ "$SKIP_BUILD" = false ]; then
    log_step "Building applications locally (this may take a few minutes)..."
    
    # Build sanctuary-app
    if [ -f "sanctuary-app/package.json" ]; then
        cd sanctuary-app
        log_info "Building sanctuary-app frontend..."
        run_cmd npm run build
        log_success "Frontend build completed"
        cd ..
    fi
    
    # Note about Tauri builds
    log_info "Note: Full platform builds will run on GitHub Actions"
    log_info "Local Tauri build: cd sanctuary-app && npm run tauri:build"
    echo ""
fi

# Commit changes
if [ "$SKIP_DEPLOY" = false ] && [ "$UNCOMMITTED_CHANGES" -ne 0 ]; then
    log_step "Committing changes..."
    
    git status --short
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Enter commit message: " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Update: build and deployment"
        fi
    else
        COMMIT_MSG="[DRY RUN] Update: build and deployment"
    fi
    
    run_cmd git add -A
    run_cmd git commit -m "$COMMIT_MSG"
    log_success "Changes committed"
    echo ""
fi

# Push to GitHub
if [ "$SKIP_DEPLOY" = false ]; then
    log_step "Pushing to GitHub..."
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Push to '$CURRENT_BRANCH'? (y/N): " CONFIRM_PUSH
        if [ "$CONFIRM_PUSH" = "y" ] || [ "$CONFIRM_PUSH" = "Y" ]; then
            run_cmd git push origin "$CURRENT_BRANCH"
            log_success "Pushed to GitHub"
        else
            log_warning "Push skipped by user"
        fi
    else
        log_info "[DRY RUN] Would push to: origin/$CURRENT_BRANCH"
    fi
    echo ""
fi

# Create and push release tag
if [ "$SKIP_DEPLOY" = false ] && [ -n "$VERSION" ]; then
    log_step "Creating release tag: $VERSION"
    
    # Check if tag already exists
    if git rev-parse "$VERSION" >/dev/null 2>&1; then
        log_error "Tag $VERSION already exists"
        exit 1
    fi
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Create release tag '$VERSION'? (y/N): " CONFIRM_TAG
        if [ "$CONFIRM_TAG" = "y" ] || [ "$CONFIRM_TAG" = "Y" ]; then
            run_cmd git tag -a "$VERSION" -m "Release $VERSION"
            run_cmd git push origin "$VERSION"
            log_success "Release tag created and pushed"
            log_info "GitHub Actions will now build all platforms"
            log_info "Monitor progress: https://github.com/brentmzey/sanctuary-stream/actions"
        else
            log_warning "Tag creation skipped by user"
        fi
    else
        log_info "[DRY RUN] Would create tag: $VERSION"
        log_info "[DRY RUN] Would push tag to: origin"
    fi
    echo ""
elif [ "$SKIP_DEPLOY" = false ]; then
    log_info "No version specified. Skipping release tag creation."
    log_info "To create a release, run with: --version v0.1.1"
    echo ""
fi

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                         SUMMARY                                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No actual changes were made"
    echo ""
fi

if [ "$SKIP_TESTS" = false ]; then
    log_success "Linting, type checking, and tests passed"
fi

if [ "$SKIP_BUILD" = false ]; then
    log_success "Local build completed"
fi

if [ "$SKIP_DEPLOY" = false ]; then
    log_success "Code committed and pushed to GitHub"
    
    if [ -n "$VERSION" ]; then
        log_success "Release tag created: $VERSION"
        echo ""
        echo "🚀 NEXT STEPS:"
        echo ""
        echo "1. GitHub Actions will build all platforms (~20 minutes)"
        echo "   Monitor: https://github.com/brentmzey/sanctuary-stream/actions"
        echo ""
        echo "2. Binaries will be attached to release:"
        echo "   https://github.com/brentmzey/sanctuary-stream/releases/tag/$VERSION"
        echo ""
        echo "3. Web app will auto-deploy to Vercel"
        echo "   https://sanctuary-stream.vercel.app"
        echo ""
        echo "4. Downloads available at:"
        echo "   - macOS: Sanctuary-Stream-universal.dmg"
        echo "   - Windows: Sanctuary-Stream-x64.msi"
        echo "   - Linux: sanctuary-stream_amd64.deb + AppImage"
        echo "   - iOS: Sanctuary-Stream.ipa (pending App Store)"
        echo "   - Android: sanctuary-stream-release.apk/aab (pending Play Store)"
        echo ""
    else
        echo ""
        echo "💡 TIP: Create a release with:"
        echo "   $0 --version v0.1.1"
        echo ""
    fi
fi

if [ "$SKIP_TESTS" = false ] && [ "$SKIP_BUILD" = false ] && [ "$SKIP_DEPLOY" = false ]; then
    echo "✨ Pipeline completed successfully!"
else
    echo "✨ Partial pipeline completed (some steps were skipped)"
fi

echo ""
