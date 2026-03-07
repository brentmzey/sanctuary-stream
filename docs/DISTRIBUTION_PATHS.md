# Sanctuary Stream: Distribution & Usage Paths

Sanctuary Stream is designed to serve two distinct groups of users: 
1. **Parishes and non-technical staff** who need an immediate, "it just works" broadcasting solution without writing code.
2. **Developers and large organizations** who want to use the core streaming engine as a customizable "SDK" to build deeply integrated platforms.

This document clearly maps out these two paths, their architectures, and how to utilize them.

---

## Path A: The "No-Code" Configurable Default (Out of the Box)
**Target Audience:** Pastors, church tech volunteers, and small-to-medium parishes.
**Goal:** Download the app, enter a server URL, and start streaming within 5 minutes. No IDE required.

### 1. The Architecture
In this path, the user downloads pre-compiled binaries from the GitHub Releases page or App Stores. 

*   **Frontend Apps:** Pre-built `.dmg`/`.app` (macOS), `.msi` (Windows), `.apk` (Android), and iOS App Store builds.
*   **Backend (PocketBase/PocketHost):** The user is encouraged to spin up a free/cheap managed PocketBase instance via a service like [PocketHost.io](https://pockethost.io/), requiring zero local server management.
*   **Bridge (OBS Integration):** A standalone executable (`sanctuary-bridge.exe` or `.app`) downloaded directly to the machine running OBS. 

### 2. User Journey (Setup)
1. **Infrastructure:** The user registers a PocketHost instance (e.g., `https://my-church.pockethost.io`).
2. **Bridge:** On the computer running OBS in the sanctuary, the user runs the `sanctuary-bridge` executable. A simple CLI prompt asks for the PocketHost URL and OBS WebSocket details. It connects.
3. **App:** The user downloads the Sanctuary Stream app on their iPad or PC. On first launch, the `SetupWizard` asks for their PocketHost URL.
4. **Broadcast:** The app connects to the remote backend, which communicates with the local bridge, which controls OBS. The user never touches `.env` files or a terminal.

### 3. CI/CD Requirements for Path A
To support this path, our release pipelines must automatically build:
*   `sanctuary-app` via Tauri (macOS/Windows binaries).
*   `sanctuary-app` via Capacitor (Android APKs, iOS TestFlight).
*   `sanctuary-bridge` packaged via tools like `pkg` or `nexe` into a single, dependency-free binary.

---

## Path B: The "SDK" & Customizable Developer Path
**Target Audience:** Open-source contributors, large ministries with internal IT teams, software engineers.
**Goal:** Clone the repository, modify the UI/UX, extend the PocketBase schema, and write custom OBS integrations.

### 1. The Architecture
In this path, Sanctuary Stream acts as an expansive Monorepo framework. The user pulls down the entire source code and modifies it to fit bespoke requirements (e.g., integrating with specific church management software like Planning Center).

*   **Frontend Apps:** Vite/React codebase is heavily customized. New components are added, branding is overhauled.
*   **Backend (PocketBase):** The user utilizes the provided PocketBase schema migrations but adds new collections and custom Go/JS hooks to the backend.
*   **Bridge (OBS Integration):** The `sanctuary-bridge` TypeScript source is extended. Perhaps the church uses vMix instead of OBS, so the developer swaps out the `obs-websocket-js` implementation with a vMix HTTP API integration.

### 2. Developer Journey (Setup)
1. **Clone & Install:** `git clone ... && bun install`
2. **Backend:** Run local PocketBase via `bun run pb:serve`.
3. **Bridge:** Add custom logic to `sanctuary-bridge/src/index.ts`, run via `bun run dev` in the bridge directory.
4. **App:** Modify React components in `sanctuary-app/src`, run via `bun run dev` (Vite).
5. **Build:** The developer runs `bun run build` and uses their own code-signing certificates for Tauri/Capacitor to distribute internally to their staff.

### 3. CI/CD Requirements for Path B
To support this path, our repository must maintain:
*   A rigorous automated test suite (Unit, Integration, E2E) across the monorepo to ensure PRs don't break the core engine.
*   Comprehensive type safety (TypeScript) in the `@shared` workspace so custom implementations map correctly to the database.
*   Strict separation of concerns: The UI must remain decoupled from the `shared` domain logic so developers can easily rip out the UI and use the underlying API logic for a headless deployment.

---

## Summary of the Dual Approach

| Feature | Path A (No-Code Default) | Path B (SDK/Developer) |
| :--- | :--- | :--- |
| **Installation** | App Stores / GitHub Releases (.exe, .dmg) | `git clone`, `bun install`, `bun run dev` |
| **Backend** | Cloud-hosted (e.g., PocketHost) | Self-hosted or customized local instance |
| **Configuration** | Setup Wizard UI (Runtime) | `.env` files and code modification (Build-time) |
| **Customization** | Built-in UI Settings (Themes, Streams) | Full React/TypeScript code access |
| **Updates** | Auto-updater via Tauri/Capacitor | `git pull` and re-compile |
| **OBS Bridge** | Standalone Executable | Node.js script execution |
