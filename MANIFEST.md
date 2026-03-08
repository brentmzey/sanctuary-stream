# Root Level Documentation Manifest

Essential documents at the repository root level.

## 📌 Core Documents

### README.md
The main project README with quick start instructions, features, platform support, and tech stack.
- **Audience:** Everyone (project overview)
- **Purpose:** Project introduction and quick reference

### BUILD_TEST_RUN.md ⭐ **START HERE**
Complete guide for local development: building, testing, running, and smoke testing.
- **Audience:** Developers
- **Purpose:** Local development workflow
- **Covers:** Build, test, run, smoke tests, pre-commit checklist, troubleshooting

### CONTRIBUTING.md
Guidelines for contributing code to the project.
- **Audience:** Open-source contributors
- **Purpose:** Contribution workflow and standards
- **References:** docs/FUNCTIONAL_STYLE.md for code standards

### CHANGELOG.md
Version history and what's new in each release.
- **Audience:** Everyone
- **Purpose:** Track changes and breaking changes

### SRVDD.md
Service Runtime & Visual Design Document - technical architecture overview.
- **Audience:** Architects, senior developers
- **Purpose:** System architecture and component design

### DIBR.md
Deployment, Installation, Backout, Rollback procedures.
- **Audience:** DevOps, operations
- **Purpose:** Deployment and recovery procedures

### agents.md
AI and bot interaction policy, crawling rules, and automated tools.
- **Audience:** AI/ML, crawlers
- **Purpose:** Define interaction policies with automated systems

### robots.txt
Web crawler directives (standard).
- **Audience:** Search engines
- **Purpose:** SEO and crawler control

### LICENSE
MIT License (standard open source license).
- **Audience:** Legal
- **Purpose:** Define usage rights

---

## 📁 Documentation Structure

```
./
├── README.md                 ← Start here for overview
├── BUILD_TEST_RUN.md         ← Start here for development ⭐
├── CONTRIBUTING.md           ← Start here to contribute
├── CHANGELOG.md              ← Track versions
├── SRVDD.md                  ← Architecture
├── DIBR.md                   ← Deployment procedures
├── agents.md                 ← AI policy
├── robots.txt                ← Crawler control
├── LICENSE                   ← MIT License
├── docs/
│   ├── INDEX.md              ← Docs navigation guide
│   ├── FUNCTIONAL_STYLE.md   ← Code standards (referenced by CONTRIBUTING.md)
│   ├── DISTRIBUTION_PATHS.md ← Path A vs B strategy
│   ├── SUPER_USER_CONFIGURATION.md ← No-code setup
│   ├── PRODUCTION_SETUP.md   ← Production deployment
│   ├── PROFESSIONAL_VIDEO_GUIDE.md ← Video quality guide
│   ├── OBS_INTEGRATION.md    ← OBS WebSocket setup
│   ├── RELEASING.md          ← CI/CD & release process
│   └── archive/              ← Deprecated/historical docs (30+ files)
└── [project files & directories]
```

---

## 🎯 Quick Reference

| Task | Start Here |
|------|-----------|
| Understand the project | README.md |
| Set up for development | BUILD_TEST_RUN.md |
| Contribute code | CONTRIBUTING.md |
| Deploy to production | docs/PRODUCTION_SETUP.md |
| Understand architecture | SRVDD.md |
| Set up without coding | docs/SUPER_USER_CONFIGURATION.md |
| Find what's new | CHANGELOG.md |
| Understand code style | docs/FUNCTIONAL_STYLE.md |
| Find all docs | docs/INDEX.md |

---

**Last Updated:** 2026-03-08
