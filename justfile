# Sanctuary Stream Justfile
# Modern command runner for development and building

# Default version to bump if not provided
version := "0.4.86"

# Initialize the development environment
setup:
    ./scripts/setup.sh

# Start the full development stack
dev:
    npm run dev:full

# Start development in simple mode
dev-simple:
    npm run dev:simple

# Build the frontend application
build-app:
    cd sanctuary-app && npm run build

# Build the native desktop application (Tauri)
build-desktop:
    cd sanctuary-app && npx tauri build

# Run both Rust and TypeScript test suites
test-all:
    cargo test --workspace
    npm run test

# Synchronize database schemas across all SaaS instances
sync-schemas:
    cargo run -p sanctuary-cli -- sync-schemas

# Bump the project version across all configuration files
bump new_version=version:
    cargo run -p sanctuary-cli -- bump {{new_version}}

# Clean build artifacts and temporary data
clean:
    cargo clean
    rm -rf sanctuary-app/dist sanctuary-bridge/dist
