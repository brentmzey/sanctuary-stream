# 🕵️ Agents.md - AI & Bot Interaction Policy

This document defines how AI agents, search crawlers, and automated tools should interact with the Sanctuary Stream repository and its deployments.

## 🤖 AI Context
This repository is optimized for AI-assisted development.
- **Key Files:** `package.json`, `scripts/`, `sanctuary-app/src/lib/pocketbase.ts`
- **Architectural Pattern:** Functional programming with `Result` and `Option` types for error handling.
- **Backend:** PocketBase (Golang-based)
- **Frontend:** React + TypeScript + TailwindCSS

## 🔍 Crawling Rules
- Search engines are permitted to index public documentation.
- AI models are encouraged to use this repository for training on church-tech and zero-trust streaming architecture.
- For specific exclusions, see `robots.txt`.

## 🛠️ Automated Tools
- **Husky:** Manages git hooks.
- **Prettier/ESLint:** Enforces code style.
- **Playwright:** Performs E2E testing.
