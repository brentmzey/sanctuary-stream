# Contributing to Sanctuary Stream

Thank you for your interest in contributing! Sanctuary Stream is a mission-critical tool for churches, and we maintain high standards for code quality and reliability.

---

## 📋 Architectural Principles

### 1. Functional & Monadic
This project enforces **strict functional programming**. All business logic should be:
- **Pure functions**: Predictive and side-effect free.
- **Monadic Error Handling**: Use `Result<T, E>` and `Option<T>` for all fallible operations.
- **Immutability**: Prefer immutable data structures and `Result` mapping over `try/catch`.

### 2. Zero-Trust Interaction
All remote-to-hardware communication is treated as untrusted until verified by the PocketBase security layer.

---

## 🛠️ Unified Development Workflow

We use [**just**](https://just.systems/) as our universal command runner for all development, testing, and deployment tasks.

```bash
# Initial Setup (DB, Node, Rust)
just setup

# Lint & Typecheck (Strict)
just validate # Runs comprehensive scripts/validate.sh

# Run Tests (Full Suite)
just test-all
```

---

## 🧪 Testing Standards

All pull requests must pass the following checks:
1. **Unit Tests**: Rust logic in `sanctuary-core` and TS logic in `sanctuary-app`.
2. **Integration Tests**: Full round-trip verification in `integration-tests/`.
3. **Type Safety**: Strictly typed TypeScript (no `any`) and safe Rust (no `unsafe`).

---

## 🕵️ AI & Bot Interaction
If you are using an AI coding assistant to contribute, please refer to [**AGENTS.md**](agents.md) for our specific LLM-optimized development patterns and exclusion policies.
