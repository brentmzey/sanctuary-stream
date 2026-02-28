# 💻 Sanctuary CLI

**One command to rule them all.**

The Sanctuary CLI is a powerful TypeScript-based tool for managing development, testing, and deployment of the Sanctuary Stream ecosystem.

---

## 🚀 Installation

The CLI is included in the project dependencies.

```bash
npm install
```

---

## 🛠️ Usage

Run the CLI using `npm run sanctuary` or directly via `tsx`.

### Core Commands

| Command | Description |
| :--- | :--- |
| `npm run sanctuary dev` | Starts all services (PB, Bridge, App). |
| `npm run sanctuary build` | Builds all components for production. |
| `npm run sanctuary test` | Runs JS/TS and Rust unit tests. |
| `npm run sanctuary ci` | Runs the full local CI suite (lint, typecheck, tests, build check). |
| `npm run sanctuary push` | Commits all changes and pushes to GitHub. |

---

## ⚙️ Detailed Command Reference

### `dev`
Starts the development environment.
- `--simple`: Use simple log output instead of concurrent tabs.

### `build`
Optimizes all workspaces for production.
- `--app`: Build the frontend only.
- `--bridge`: Build the OBS bridge only.

### `test`
Validates logic across the entire monorepo.
- `--e2e`: Runs Playwright integration tests.

### `ci` (Continuous Integration)
Mirrors the logic used in GitHub Actions. Run this before pushing to ensure your code will pass the remote build.

### `push`
Automates the git lifecycle.
1. Formats code
2. Runs CI
3. Commits with a standard message
4. Pushes to `main` branch

---

## 🛠️ Developer Setup (CLI Internal)

Source code: `sanctuary-cli/src/index.ts`

To add new commands:
1. Open `sanctuary-cli/src/index.ts`
2. Add a new `.command()` block using the `commander` API.
3. Use `execSync` for shell interactions.
