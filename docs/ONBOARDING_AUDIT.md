# 📋 Onboarding & Readiness Audit (March 2026)

This document tracks the systematic verification of the Sanctuary Stream installation and run process.

## 🛠 Persona 1: The Developer (Source Setup)
**Goal:** Go from `git clone` to a fully functional local environment.

### Step 1: Prerequisites
- [x] **Node.js (v18+):** Verified v22.20.0.
- [x] **npm:** Verified v11.6.4.
- [x] **Bun:** Verified (needed for bridge compilation).
- **Gotchas:** 
  - *Fixed:* Shell environment `NODE_ENV` can override test settings if not explicitly handled in `package.json`.

### Step 2: `npm install`
- [x] **Root Install:** Success.
- [x] **Workspaces:** Successfully installs `sanctuary-app` and `sanctuary-bridge` dependencies.

### Step 3: `npm run setup`
- [x] **Environment Files:** Creates `.env` from `.env.example`.
- [x] **PocketBase Download:** Fetches the correct binary for the OS.
- [x] **Schema Initialization:** Runs `schema-init.ts`.
- **Gotchas:**
  - *Fixed:* `executed: false` on commands failed validation because of an overly strict PocketBase schema requirement (`required: true` on a boolean). Added migration `1772395000_fix_executed_bool.js`.

### Step 4: `npm run dev:full`
- [x] **PocketBase:** Starts on port 8090.
- [x] **Mock OBS:** Starts on port 4455.
- [x] **Sanctuary Bridge:** Starts and connects to PB and OBS.
- [x] **Control App:** Starts Vite dev server on port 5173.
- **Gotchas:**
  - *Fixed:* Bridge would attempt to start during tests if `NODE_ENV` was inherited as `development`. Fixed by forcing `NODE_ENV=test` in test scripts.

### Step 5: Functional Verification (The "Acid Test")
- [x] **Login:** Verified `admin@local.dev` can authenticate against both `_superusers` and `users` collections.
- [x] **Command Flow:** Verified that the JS SDK and UI can successfully create commands with `executed: false`.
- **Gotchas:**
  - *Note:* In PocketBase v0.30+, there is a distinction between Superusers (system admins) and regular Users. The `commands` collection requires a relation to the `users` collection, so the Control App must authenticate as a standard user (e.g., `admin@local.dev` in the `users` table) rather than a system-level Superuser.

---

## 🔌 Persona 2: The "No-Code" User (Executable Setup)
**Goal:** Run the system using pre-compiled releases without needing `git` or `npm`.

### Step 1: Release Availability
- [x] **Artifacts:** Verified that `build-release.yml` now includes Bridge executables for all platforms.
- **Gotchas:**
  - *Fixed:* Bridge was previously omitted from the release workflow.

### Step 2: Configuration (`config.json`)
- [x] **Lookup Logic:** Verified the bridge looks in its own directory for `config.json`.
- **Gotchas:**
  - *Fixed:* Bridge previously only looked in `process.cwd()`, which is often inconsistent for portable executables.

### Step 3: Run
- [x] **Bridge Execution:** Verified the compiled bridge executable starts up, finds configuration, and authenticates correctly against PocketBase.
