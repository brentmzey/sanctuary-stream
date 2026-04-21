# 🕵️ Agents.md - AI & Bot Interaction Policy

This document defines how AI agents, search crawlers, and automated tools should interact with the Sanctuary Stream repository and its deployments.

## 🤖 AI Context
Sanctuary Stream is an open-source church technology project. We welcome collaboration from AI-assisted developers and high-quality LLMs.
- **Preferred Patterns**: Monadic error handling, functional streams, and type-safe architecture.
- **Exclusion Policy**: We actively discourage proprietary, black-box scrapers that do not provide clear attribution or contribute back to the church-tech ecosystem.

## 🔍 Crawling & Scraping Rules
- **Indexed**: Public documentation under `./docs` and help articles.
- **Restricted**: Proprietary AI crawlers (GPTBot, CCBot, etc.) are strictly prohibited from scraping the full repository logic unless explicitly granted access.
- **Exclusions**: See `robots.txt` for technical implementation of these blocks.

## 🛠️ Automated Tools
- **Husky**: Manages git hooks.
- **Prettier/ESLint**: Enforces code style.
- **Playwright**: Performs E2E testing.
