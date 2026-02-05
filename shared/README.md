# Shared Types

Strongly-typed definitions shared across all Sanctuary Stream components.

## Files

- **types.ts** - TypeScript type definitions
  - Used by: Frontend (React), Bridge (Node.js), Tests
  - Provides: Full type safety for PocketBase collections, WebSocket messages, API responses

- **types.rs** - Rust type definitions (future)
  - Will be used by: Bridge rewrite in Rust
  - Provides: Zero-cost abstractions, compile-time guarantees

## Usage

### TypeScript

```typescript
import type { Command, CommandAction, Stream, StreamStatus } from '../shared/types';

// Fully typed!
const command: Command = {
  id: '...',
  action: 'START',
  executed: false,
  // ...
};
```

### Package.json exports

Add to root package.json:

```json
{
  "exports": {
    "./shared/types": "./shared/types.ts"
  }
}
```

## Type Safety

All types are:
- ✅ Strongly typed (no `any`)
- ✅ Validated with type guards
- ✅ Aligned with PocketBase schema
- ✅ Consistent across languages
- ✅ Self-documenting

## Maintenance

When updating schema migrations, also update these type files to keep them in sync.
