# 🤝 Contributing to Sanctuary Stream

Thank you for considering contributing to Sanctuary Stream! This document provides guidelines and standards for contributing to this open-source project.

## 📜 Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🎯 How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report**:
- Check the [existing issues](https://github.com/your-org/sanctuary-stream/issues)
- Verify you're using the latest version
- Try to reproduce in a clean environment

**Good bug reports include**:
- Clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, Node version, OBS version)
- Screenshots or logs (if applicable)

### Suggesting Features

Feature requests are welcome! Please:
- Use the feature request issue template
- Explain the problem your feature solves
- Describe your proposed solution
- Consider implementation complexity

### Pull Requests

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes following code standards
4. **Write** tests for new functionality
5. **Run** the test suite (`npm test`)
6. **Commit** using conventional commits
7. **Push** to your fork
8. **Open** a Pull Request

## 💻 Development Setup

### Prerequisites

- Node.js 18+ with npm/pnpm
- Rust 1.70+ (for Tauri development)
- OBS Studio 28+ (for Bridge testing)
- Git

### Local Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/sanctuary-stream.git
cd sanctuary-stream

# Install dependencies
npm install

# Set up environment files
cp .env.example .env
cp sanctuary-app/.env.example sanctuary-app/.env
cp sanctuary-bridge/.env.example sanctuary-bridge/.env

# Run tests
npm test

# Start development
npm run dev
```

## 📝 Code Standards

### TypeScript

- **Strict mode enabled**: No implicit any
- **Path aliases**: Use `@/` for imports
- **Explicit return types**: For public functions
- **No unused variables**: Clean up imports

```typescript
// ✅ Good
export async function createCommand(action: Action): Promise<Command> {
  const id = crypto.randomUUID();
  return await pb.collection('commands').create({ action, correlation_id: id });
}

// ❌ Bad
export async function createCommand(action) {
  var id = Math.random(); // Use crypto.randomUUID()
  return pb.collection('commands').create({ action, correlation_id: id });
}
```

### React Components

- **Functional components** with hooks
- **TypeScript interfaces** for props
- **Custom hooks** for logic reuse
- **Error boundaries** for production

```tsx
// ✅ Good
interface PastorViewProps {
  onStreamStart: () => Promise<void>;
}

export function PastorView({ onStreamStart }: PastorViewProps) {
  const [loading, setLoading] = useState(false);
  // ...
}

// ❌ Bad
export function PastorView(props) {
  // Missing types, using class component
}
```

### File Naming

- **React components**: PascalCase (`PastorView.tsx`)
- **Utilities**: camelCase (`pocketbase.ts`)
- **Types/Schemas**: PascalCase (`schema.ts` with exports)
- **Tests**: Match source file (`PastorView.test.tsx`)

### Code Style

We use ESLint + Prettier. Run before committing:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
npm run format      # Format with Prettier
```

## 🧪 Testing Requirements

All PRs must include tests. We aim for >80% coverage.

### Writing Tests

```typescript
// Unit test example
import { describe, it, expect } from 'vitest';
import { generateCorrelationId } from './utils';

describe('generateCorrelationId', () => {
  it('should generate unique UUIDs', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();
    expect(id1).not.toBe(id2);
  });
});

// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { PastorView } from './PastorView';

describe('PastorView', () => {
  it('should show loading state when clicked', async () => {
    render(<PastorView />);
    const button = screen.getByText('Begin Mass');
    fireEvent.click(button);
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific file
npm test PastorView.test.tsx
```

## 📦 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code change without fixing/adding features
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, configs

### Examples

```bash
# Good commits
feat(bridge): add retry logic for OBS connection
fix(app): prevent double-click command submission
docs(readme): update deployment instructions
test(bridge): add heartbeat integration tests

# Bad commits
update stuff
fixed bug
WIP
asdfasdf
```

### Scope Guidelines

- `bridge`: Sanctuary Bridge service
- `app`: Tauri frontend
- `pocketbase`: PocketBase schema/config
- `docs`: Documentation
- `ci`: CI/CD pipelines
- `deps`: Dependencies

## 🔍 Code Review Process

### For Contributors

Your PR will be reviewed for:
- **Code quality**: Follows standards above
- **Tests**: Adequate coverage and passing
- **Documentation**: Updated if needed
- **Breaking changes**: Clearly documented
- **Security**: No exposed secrets or vulnerabilities

### For Reviewers

- Be constructive and respectful
- Focus on code, not the person
- Suggest improvements, don't just criticize
- Approve if minor issues remain (can fix in follow-up)

## 🏗️ Project Structure

```
sanctuary-stream/
├── sanctuary-app/          # Tauri + React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript types
│   └── tests/              # Frontend tests
├── sanctuary-bridge/       # Node.js Bridge service
│   ├── src/
│   │   ├── services/       # OBS, PocketBase clients
│   │   ├── utils/          # Helpers
│   │   └── index.ts        # Entry point
│   └── tests/              # Bridge tests
├── docs/                   # Documentation
├── scripts/                # Build/deploy scripts
└── pocketbase/             # Schema exports
```

## 🐛 Debugging Tips

### Bridge Service

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Watch logs
tail -f logs/bridge.log

# Test OBS connection
npm run test:obs-connection
```

### Frontend

```bash
# Tauri dev mode with console
npm run tauri dev

# React dev tools
# Install browser extension

# PocketBase debugging
# Check Network tab for API calls
```

## 📚 Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [PocketBase Docs](https://pocketbase.io/docs/)
- [OBS WebSocket Protocol](https://github.com/obsproject/obs-websocket)
- [React Testing Library](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)

## 💬 Questions?

- Open a [Discussion](https://github.com/your-org/sanctuary-stream/discussions)
- Join our [Discord](https://discord.gg/sanctuary-stream) (if applicable)
- Email: dev@sanctuary-stream.dev

## 🎖️ Recognition

Contributors will be:
- Listed in [AUTHORS.md](./AUTHORS.md)
- Mentioned in release notes
- Credited in the README (for significant contributions)

Thank you for helping make Sanctuary Stream better! 🙏
