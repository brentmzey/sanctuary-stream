# Contributing to Sanctuary Stream

Thank you for your interest in contributing! 🎉

---

## 📋 Before You Start

### Required Reading

**⚠️ MANDATORY:** Read [docs/FUNCTIONAL_STYLE.md](./docs/FUNCTIONAL_STYLE.md) before writing any code.

This project enforces **strict functional programming**:
- Pure functions only
- Immutable data structures
- No side effects in business logic
- Explicit error handling (Result<T, E>)
- Type safety (no `any` in TypeScript)

**All PRs must follow these principles.**

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone git@github.com:YOUR_USERNAME/sanctuary-stream.git
cd sanctuary-stream
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Development Environment

```bash
# Configure
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# Setup database
npm run setup

# Start development
npm run dev
```

### 4. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

---

## ✅ Code Standards

### TypeScript

```typescript
// ✅ Good - Pure, immutable, typed
const updateUser = (user: User, age: number): User => ({
  ...user,
  age
});

// ❌ Bad - Mutation, side effects
function updateUser(user: User, age: number) {
  user.age = age;
  console.log("Updated user"); // Side effect!
  return user;
}
```

### Rust

```rust
// ✅ Good - Pure, immutable
fn update_age(user: User, age: i32) -> User {
    User { age, ..user }
}

// ❌ Bad - Mutation
fn update_age(user: &mut User, age: i32) {
    user.age = age; // Mutation!
}
```

**See [docs/FUNCTIONAL_STYLE.md](./docs/FUNCTIONAL_STYLE.md) for complete guide.**

---

## 🧪 Testing

**Before submitting PR:**

```bash
# Type check
npm run typecheck        # Must pass with zero errors

# Lint
npm run lint             # Must pass with zero warnings

# Test
npm test                 # All tests must pass

# Full validation
npm run validate         # Complete CI/CD check
```

**All checks must pass!**

---

## 📝 Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples:
feat: add scene switching support
fix: resolve OBS connection timeout
docs: update installation guide
refactor: simplify stream status logic
test: add tests for user authentication
```

**Format:**
```
<type>: <description>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## 🔄 Pull Request Process

### 1. Ensure Quality

- [ ] Read [docs/FUNCTIONAL_STYLE.md](./docs/FUNCTIONAL_STYLE.md)
- [ ] All code follows functional style
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run validate` passes

### 2. Create PR

```bash
git push origin feature/your-feature-name
```

Then create PR on GitHub with:
- Clear title
- Description of changes
- Why the change is needed
- Any breaking changes

### 3. Code Review

- Address all review comments
- Keep commits clean
- Squash if needed

### 4. Merge

Once approved, maintainers will merge.

---

## 🎯 What We Accept

### ✅ Welcome

- Bug fixes
- New features (discuss first in issue)
- Documentation improvements
- Performance optimizations
- Test additions
- Refactoring (if improves code quality)

### ❌ Won't Accept

- Breaking changes without discussion
- Code that doesn't follow functional style
- Code with side effects in business logic
- Non-functional patterns (classes, mutations, etc.)
- Code without tests (for new features)
- Code that fails validation

---

## 🐛 Reporting Bugs

**Use GitHub Issues:**

Include:
1. Description of bug
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment (OS, version, etc.)
6. Logs (if applicable)

---

## 💡 Suggesting Features

**Use GitHub Discussions:**

Include:
1. Description of feature
2. Why it's needed
3. How it would work
4. Example use cases
5. Implementation ideas (optional)

**Discuss before coding!**

---

## 📚 Areas Needing Help

- [ ] Additional tests
- [ ] Documentation improvements
- [ ] Performance optimizations
- [ ] Cloud integrations (AWS, RabbitMQ, etc.)
- [ ] Mobile app refinements
- [ ] Accessibility improvements

**Check [Issues](https://github.com/brentmzey/sanctuary-stream/issues) for good first issues**

---

## 🎓 Learning Resources

### Functional Programming
- [Mostly Adequate Guide](https://mostly-adequate.gitbook.io/)
- [fp-ts (TypeScript)](https://gcanti.github.io/fp-ts/)
- [Functional Rust](https://www.fpcomplete.com/rust/)

### Our Stack
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [React Docs](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [PocketBase Docs](https://pocketbase.io/docs/)

---

## 🤝 Code of Conduct

- Be respectful
- Be constructive
- Help others
- Focus on solutions
- Assume good intentions

**This is a ministry project. Act accordingly.**

---

## 📞 Questions?

- 💬 [Discussions](https://github.com/brentmzey/sanctuary-stream/discussions)
- 📧 Email: support@sanctuary-stream.com

---

**Thank you for contributing! 🙏**

**Together we're building better tools for churches worldwide.**
