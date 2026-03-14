import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn((p: string) => {
        if (p.endsWith('config.json')) return true;
        return actual.existsSync(p);
      }),
      statSync: vi.fn((p: string) => {
        if (p.endsWith('config.json')) return { isDirectory: () => false };
        return actual.statSync(p);
      }),
      readFileSync: vi.fn((p: string, enc: any) => {
        if (p.endsWith('config.json')) {
          if (process.env.TEST_FS_ERROR) throw new Error('fs error');
          return JSON.stringify({ STREAM_ID: 'config-stream' });
        }
        return actual.readFileSync(p, enc);
      }),
    }
  };
});

// Mock logger
vi.mock('./logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

describe('SanctuaryBridge Configuration & Initialization', () => {
  const originalEnv = process.env.NODE_ENV;
  let originalOn: any;

  beforeEach(() => {
    vi.resetModules();
    process.env.STREAM_ID = '';
    delete process.env.TEST_FS_ERROR;
    originalOn = process.on;
    process.on = vi.fn() as any;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.on = originalOn;
  });

  it('loads advanced config from config.json', async () => {
    const { SanctuaryBridge } = await import('./index');
    expect(() => new SanctuaryBridge()).not.toThrow();
  });
it('handles config.json parse error gracefully', async () => {
  process.env.TEST_FS_ERROR = '1';
  process.env.STREAM_ID = 'fallback-stream'; 
  const { SanctuaryBridge } = await import('./index');
  expect(() => new SanctuaryBridge()).not.toThrow();
});
});
