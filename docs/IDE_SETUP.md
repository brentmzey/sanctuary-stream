# 💻 IDE Setup & Developer Support

This guide ensures you get the most out of your development environment when working on Sanctuary Stream's polyglot codebase (Rust, TypeScript, Java).

---

## 🚀 IntelliJ IDEA Ultimate / RustRover (Recommended)

Sanctuary Stream is optimized for JetBrains IDEs. We provide pre-configured run tasks and full cross-language indexing.

### 1. Initial Setup
1.  **Open Project:** Choose **Open** and select the **root directory** of the repository.
2.  **Trust Project:** Click **Trust Project** if prompted.
3.  **Plugins:** Ensure you have the following installed:
    *   **Rust**
    *   **JavaScript and TypeScript**
    *   **Gradle** (built-in)
4.  **JDK:** If prompted for a Project SDK, select **Java 17 or higher**. This is used for the SaaS orchestrator modules.
5.  **Cargo:** A notification may appear asking to "Attach Cargo.toml". Click **Attach** to enable full Rust indexing.

### 2. One-Click Workflows
Look at the **Run Configurations** dropdown (top right, near the Play button):
*   **🚀 Run All (Just Dev):** Boots the DB, Bridge, and UI in one unified console.
*   **🛠️ Run Tauri App (Native Debug):** Launches the desktop app with full Rust breakpoint debugging attached.
*   **☁️ SaaS Schema Sync:** Runs the orchestrator to sync schemas across parish instances.

### 3. 🆘 "IDE Won't Open" Reset
If IntelliJ hangs or fails to open the project, run this terminal command to reset the metadata while keeping your configurations:
```bash
# Reset IDE metadata and kill dangling locks
pkill -f pocketbase || true
pkill -f vite || true
find .idea -maxdepth 1 ! -name 'runConfigurations' ! -name '.idea' -exec rm -rf {} + 2>/dev/null || true
touch build.gradle Cargo.toml package.json
```

---

## ⚡ Visual Studio Code

### Required Extensions
*   **rust-analyzer:** Essential for Rust support.
*   **ESLint / Prettier:** For UI code style.
*   **Tauri:** For desktop-specific tooling.
*   **Tailwind CSS IntelliSense:** For styling.

### Workspace Setup
1.  Open the root folder in VS Code.
2.  The `rust-analyzer` will automatically detect the workspace members.
3.  Use the built-in terminal to run `just` commands.

---

## 🛠️ Command Line Power User (`just`)

Regardless of your IDE, the `justfile` is your source of truth.

| Command | Action |
| :--- | :--- |
| `just setup` | Full fresh-install initialization |
| `just dev` | Start the development stack |
| `just test-all` | Run Rust and TS tests |
| `just build-desktop` | Build native production installers |

---

## 🧪 Testing Concurrency
Because the core is written in **Concurrent Rust (Tokio)**, you can safely set breakpoints in the Rust code without freezing the UI. This is the primary advantage of our "Rust-First" architecture.
