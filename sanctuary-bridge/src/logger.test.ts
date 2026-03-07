import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  const originalEnv = process.env.LOG_LEVEL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.LOG_LEVEL = originalEnv;
  });

  it('uses default log level info', async () => {
    delete process.env.LOG_LEVEL;
    const { logger } = await import('./logger');
    expect(logger.level).toBe('info');
  });

  it('respects LOG_LEVEL env var', async () => {
    process.env.LOG_LEVEL = 'debug';
    const { logger } = await import('./logger');
    expect(logger.level).toBe('debug');
  });
});
