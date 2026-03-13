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

👉 **[Complete User Guide](USER_GUIDE.md)** ⭐
- Full installation guide
- OBS setup instructions
- Step-by-step first stream

### For Developers (Path B: SDK)
👉 **[Build, Test, Run Guide](../BUILD_TEST_RUN.md)** ⭐
- Local development setup
- Building all workspaces (Desktop, Mobile, Web)
- Running tests and smoke tests
- Complete pre-commit checklist

👉 **[Platform Support Verification](PLATFORM_SUPPORT.md)**
- Real-time WebSocket details
- Mobile (iOS/Android) support details
- Multi-backend architecture

---

## 💻 Development

### Code Standards & Style
📖 **[Functional Programming Style Guide](FUNCTIONAL_STYLE.md)**
- Architectural patterns used (Result<T,E>, Option<T>, AsyncIO<T>)
- Code examples
- What we accept/don't accept

### Contributing
📖 **[Contributing Guidelines](../CONTRIBUTING.md)**
- How to fork and set up development
- Pull request process
- Code of conduct

---

## 🏗️ Architecture & Design

### System Architecture
📖 **[Service Runtime & Visual Design (SRVDD)](../SRVDD.md)**
- Component diagrams
- Service interactions
- Zero-trust design principles

### Performance & Optimization
📖 **[Performance: Bun vs npm](PERFORMANCE.md)** ⚡
- Benchmark comparisons
- Why we use Bun for high performance
- How to switch to Bun

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

### Deployment & Operations
📖 **[Deployment, Installation, Backout, Rollback (DIBR)](../DIBR.md)**
- Fresh installation
- Environment promotion
- Emergency backout procedures
- Database rollback

---

## 📋 Other Resources

### Change Log
📖 **[CHANGELOG](../CHANGELOG.md)**
- Version history
- Breaking changes
- What's new

### License
📖 **[LICENSE](../LICENSE)**
- MIT License

### Compliance & AI Policy
📖 **[AI & Agents Policy](../agents.md)**
- AI and bot interaction policy
- Crawling rules

---

## 📁 Document Organization

### Root Level (Essential)
```
├── README.md                 # Main project README
├── BUILD_TEST_RUN.md         # Developer build/test/run guide ⭐
├── SRVDD.md                  # Architecture & design
├── DIBR.md                   # Deployment procedures
├── CONTRIBUTING.md           # Contributing guidelines
├── CHANGELOG.md              # Version history
├── agents.md                 # AI policy
└── LICENSE                   # MIT License
```

### Docs Directory (Reference)
```
docs/
├── INDEX.md (this file)              # Documentation index
├── USER_GUIDE.md                     # Full end-user installation ⭐
├── PLATFORM_SUPPORT.md               # Details on iOS/Android/Web
├── FUNCTIONAL_STYLE.md               # Code style & patterns
├── DISTRIBUTION_PATHS.md             # Path A vs B strategy
├── SUPER_USER_CONFIGURATION.md       # No-code setup
├── PRODUCTION_SETUP.md               # Production deployment
├── PROFESSIONAL_VIDEO_GUIDE.md       # Video encoding guide
├── OBS_INTEGRATION.md                # OBS WebSocket integration
└── RELEASING.md                      # CI/CD & release process
```

---

## 🎯 Quick Links by Task

| I want to... | Read this |
|--------------|-----------|
| Set up locally for development | [BUILD_TEST_RUN.md](../BUILD_TEST_RUN.md) |
| Follow a complete user guide | [USER_GUIDE.md](USER_GUIDE.md) |
| Check platform support (iOS/Android) | [PLATFORM_SUPPORT.md](PLATFORM_SUPPORT.md) |
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

---

**Last Updated:** 2026-03-11  
**Documentation Status:** ✅ Organized & Current
