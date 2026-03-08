# 📚 Sanctuary Stream Documentation Index

Welcome to the Sanctuary Stream documentation. Use this index to find what you need.

---

## 🚀 Getting Started

**Start here based on your role:**

### For End Users (Path A: No-Code)
👉 **[Super User Configuration Guide](SUPER_USER_CONFIGURATION.md)**
- How to set up Sanctuary Stream without touching code
- Configuration options
- Troubleshooting

### For Developers (Path B: SDK)
👉 **[Build, Test, Run Guide](../BUILD_TEST_RUN.md)** (at root level)
- Local development setup
- Building all workspaces
- Running tests and smoke tests
- Complete pre-commit checklist

---

## 💻 Development

### Code Standards & Style
📖 **[Functional Programming Style Guide](FUNCTIONAL_STYLE.md)**
- Architectural patterns used (Result<T,E>, Option<T>, AsyncIO<T>)
- Code examples
- What we accept/don't accept

### Contributing
📖 **[Contributing Guidelines](../CONTRIBUTING.md)** (at root level)
- How to fork and set up development
- Pull request process
- Code of conduct

---

## 🏗️ Architecture & Design

### System Architecture
📖 **[Service Runtime & Visual Design (SRVDD)](../SRVDD.md)** (at root level)
- Component diagrams
- Service interactions
- Zero-trust design principles

### Distribution Paths
📖 **[Distribution Paths](DISTRIBUTION_PATHS.md)**
- Path A: No-Code (for parishes)
- Path B: SDK (for developers)
- Decision matrix

---

## 🎬 Technical References

### Video Encoding & Quality
📖 **[Professional Video Guide](PROFESSIONAL_VIDEO_GUIDE.md)**
- Encoder selection (CPU, NVENC, QuickSync, AMF)
- Resolution and bitrate recommendations
- Performance optimization

### OBS Integration
📖 **[OBS Integration Guide](OBS_INTEGRATION.md)**
- WebSocket setup
- Command execution
- Health monitoring

---

## 🚢 Deployment & Operations

### Production Setup
📖 **[Production Setup Guide](PRODUCTION_SETUP.md)**
- Self-hosting setup
- Configuration for production
- Security considerations

### Release & CI/CD
📖 **[Releasing Guide](RELEASING.md)**
- GitHub Actions pipeline
- Version naming conventions
- Release checklist

### Deployment, Backout, Rollback
📖 **[DIBR Guide](../DIBR.md)** (at root level)
- Fresh installation
- Environment promotion
- Emergency backout procedures
- Database rollback

---

## 📋 Other Resources

### Change Log
📖 **[CHANGELOG](../CHANGELOG.md)** (at root level)
- Version history
- Breaking changes
- What's new

### License
📖 **[LICENSE](../LICENSE)** (at root level)
- MIT License

### Compliance & AI Policy
📖 **[agents.md](../agents.md)** (at root level)
- AI and bot interaction policy
- Crawling rules

---

## 📁 Document Organization

### Root Level (Essential)
```
├── README.md                 # Main project README
├── BUILD_TEST_RUN.md         # Developer build/test/run guide ⭐
├── CONTRIBUTING.md           # Contributing guidelines
├── CHANGELOG.md              # Version history
├── SRVDD.md                  # Architecture & design
├── DIBR.md                   # Deployment procedures
├── agents.md                 # AI policy
├── robots.txt                # Web crawler directives
└── LICENSE                   # MIT License
```

### Docs Directory (Reference)
```
docs/
├── INDEX.md (this file)              # Documentation index
├── FUNCTIONAL_STYLE.md               # Code style & patterns
├── DISTRIBUTION_PATHS.md             # Path A vs B strategy
├── SUPER_USER_CONFIGURATION.md       # No-code setup
├── PRODUCTION_SETUP.md               # Production deployment
├── PROFESSIONAL_VIDEO_GUIDE.md       # Video encoding guide
├── OBS_INTEGRATION.md                # OBS WebSocket integration
├── RELEASING.md                      # CI/CD & release process
├── archive/                          # Archived/deprecated docs
│   └── (31 docs from development history)
```

---

## 🎯 Quick Links by Task

| I want to... | Read this |
|--------------|-----------|
| Set up locally for development | [BUILD_TEST_RUN.md](../BUILD_TEST_RUN.md) |
| Contribute code | [CONTRIBUTING.md](../CONTRIBUTING.md) + [FUNCTIONAL_STYLE.md](FUNCTIONAL_STYLE.md) |
| Deploy to production | [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) + [DIBR.md](../DIBR.md) |
| Configure without coding | [SUPER_USER_CONFIGURATION.md](SUPER_USER_CONFIGURATION.md) |
| Optimize video quality | [PROFESSIONAL_VIDEO_GUIDE.md](PROFESSIONAL_VIDEO_GUIDE.md) |
| Understand the architecture | [SRVDD.md](../SRVDD.md) |
| Release a new version | [RELEASING.md](RELEASING.md) |
| Roll back or recover | [DIBR.md](../DIBR.md) |
| Find what's new | [CHANGELOG.md](../CHANGELOG.md) |

---

## 🔍 Finding What You Need

**By Role:**
- 👨‍💼 **Church Administrator** → SUPER_USER_CONFIGURATION.md, PRODUCTION_SETUP.md
- 👨‍💻 **Developer** → BUILD_TEST_RUN.md, CONTRIBUTING.md, FUNCTIONAL_STYLE.md
- 🛠️ **DevOps/Operations** → PRODUCTION_SETUP.md, RELEASING.md, DIBR.md
- 📹 **Video/Streaming Tech** → PROFESSIONAL_VIDEO_GUIDE.md, OBS_INTEGRATION.md

**By Task:**
- 🚀 Getting started → BUILD_TEST_RUN.md
- 🧪 Testing & validation → BUILD_TEST_RUN.md (smoke tests section)
- 🏗️ Building → BUILD_TEST_RUN.md (building section)
- 🚢 Production deployment → PRODUCTION_SETUP.md
- 🔄 Rollback/recovery → DIBR.md
- 📊 Video optimization → PROFESSIONAL_VIDEO_GUIDE.md

**By Technology:**
- React/Frontend → FUNCTIONAL_STYLE.md
- TypeScript → FUNCTIONAL_STYLE.md
- PocketBase → SUPER_USER_CONFIGURATION.md, PRODUCTION_SETUP.md
- OBS → OBS_INTEGRATION.md, PROFESSIONAL_VIDEO_GUIDE.md
- CI/CD → RELEASING.md
- Docker/Containers → PRODUCTION_SETUP.md

---

## 📞 Getting Help

- **Questions about code?** → See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Architecture questions?** → See [SRVDD.md](../SRVDD.md)
- **Bugs or issues?** → Go to [GitHub Issues](https://github.com/sanctuary-stream/sanctuary-stream/issues)
- **Discussions?** → Go to [GitHub Discussions](https://github.com/sanctuary-stream/sanctuary-stream/discussions)
- **Contact us?** → Email: support@sanctuarystream.com

---

**Last Updated:** 2026-03-08  
**Documentation Status:** ✅ Organized & Current
