import { describe, it, expect, vi } from 'vitest';
import { SanctuaryBridge } from './index';

// Mock PocketBase and OBSWebSocket
vi.mock('pocketbase');
vi.mock('obs-websocket-js');

describe('SanctuaryBridge', () => {
  it('should initialize with environment variables', () => {
    process.env.STREAM_ID = 'test-stream-id';
    process.env.PB_URL = 'http://localhost:8090';
    
    const bridge = new SanctuaryBridge();
    expect(bridge).toBeDefined();
    expect(process.env.STREAM_ID).toBe('test-stream-id');
  });

  it('should throw error if STREAM_ID is missing', () => {
    const originalStreamId = process.env.STREAM_ID;
    delete process.env.STREAM_ID;
    
    expect(() => new SanctuaryBridge()).toThrow('STREAM_ID environment variable is required');
    
    process.env.STREAM_ID = originalStreamId;
  });
});
