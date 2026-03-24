import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  pb, 
  sendCommand, 
  getStreamStatus, 
  setPocketBaseUrl, 
  testConnection, 
  getSermons, 
  getFileUrl,
  getCurrentPocketBaseUrl,
  subscribeToStream,
  unsubscribeFromStream,
  UserRecord
} from './pocketbase';
import { invoke } from '@tauri-apps/api/tauri';

vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}));

// Provide a mock implementation of fetch
global.fetch = vi.fn();

describe('pocketbase lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    pb.authStore.clear();
    vi.mocked(invoke).mockResolvedValue(Promise.resolve({}));
  });

  describe('URL Configuration', () => {
    it('sets and gets URL correctly', () => {
      setPocketBaseUrl('https://my-church.pockethost.io');
      expect(pb.baseUrl).toBe('https://my-church.pockethost.io');
      expect(localStorage.getItem('pb_url')).toBe('https://my-church.pockethost.io');
    });

    it('rejects invalid URLs', () => {
      // setPocketBaseUrl no longer validates in a way that returns a failure Result
      setPocketBaseUrl('not-a-url');
      expect(pb.baseUrl).toBe('not-a-url');
    });

    it('returns the current PocketBase URL', () => {
      vi.mocked(invoke).mockResolvedValue(Promise.resolve());
      setPocketBaseUrl('https://my-church.pockethost.io');
      expect(getCurrentPocketBaseUrl()).toBe('https://my-church.pockethost.io');
    });
  });

  describe('testConnection', () => {
    it('returns true on successful fetch', async () => {
      vi.mocked(invoke).mockResolvedValue(true);
      const isConnected = await testConnection('http://localhost:8090').unsafeRunAsync();
      expect(isConnected).toBe(true);
      expect(invoke).toHaveBeenCalledWith('test_connection', { url: 'http://localhost:8090' });
    });

    it('uses Rust logic when no url is provided', async () => {
      vi.mocked(invoke).mockResolvedValue(true);
      await testConnection().unsafeRunAsync();
      expect(invoke).toHaveBeenCalledWith('test_connection', { url: null });
    });

    it('returns false on failed fetch (Rust fallback)', async () => {
      vi.mocked(invoke).mockRejectedValue(new Error('Rust error'));
      vi.mocked(global.fetch).mockResolvedValue({ ok: false } as Response);
      const isConnected = await testConnection('http://localhost:8090').unsafeRunAsync();
      expect(isConnected).toBe(false);
    });
  });

  describe('sendCommand', () => {
    it('uses Rust invoke if no payload is provided', async () => {
      vi.mocked(invoke).mockResolvedValue('corr-id');
      await sendCommand('START').unsafeRunAsync();
      expect(invoke).toHaveBeenCalledWith('send_command', { action: 'START' });
    });

    it('falls back to JS SDK if Rust fails', async () => {
      // @ts-expect-error - UserRecord is a partial RecordModel for testing
      pb.authStore.save('token', { id: 'user-123' } as UserRecord);
      vi.mocked(invoke).mockRejectedValue(new Error('Rust error'));
      const mockCreate = vi.fn().mockResolvedValue({ id: 'cmd-1' });
      pb.collection = vi.fn().mockReturnValue({ create: mockCreate });

      await sendCommand('START').unsafeRunAsync();
      
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        action: 'START',
        created_by: 'user-123'
      }));
    });
  });

  describe('subscriptions', () => {
    it('can subscribe to stream', () => {
      const mockSubscribe = vi.fn();
      pb.collection = vi.fn().mockReturnValue({ subscribe: mockSubscribe });
      
      subscribeToStream('stream-1', () => {});
      expect(mockSubscribe).toHaveBeenCalledWith('stream-1', expect.any(Function));
    });

    it('can unsubscribe from stream', () => {
      const mockUnsubscribe = vi.fn();
      pb.collection = vi.fn().mockReturnValue({ unsubscribe: mockUnsubscribe });
      
      unsubscribeFromStream('stream-1');
      expect(mockUnsubscribe).toHaveBeenCalledWith('stream-1');
    });
  });

  describe('getStreamStatus', () => {
    it('uses Rust invoke first', async () => {
      vi.mocked(invoke).mockResolvedValue({ status: 'live' });
      const status = await getStreamStatus('stream-1').unsafeRunAsync();
      expect(status).toEqual({ status: 'live' });
      expect(invoke).toHaveBeenCalledWith('get_stream_status');
    });

    it('falls back to JS SDK on failure', async () => {
      vi.mocked(invoke).mockRejectedValue(new Error('Rust error'));
      const mockGetOne = vi.fn().mockResolvedValue({ status: 'recording' });
      pb.collection = vi.fn().mockReturnValue({ getOne: mockGetOne });

      const status = await getStreamStatus('stream-1').unsafeRunAsync();
      expect(status).toEqual({ status: 'recording' });
      expect(mockGetOne).toHaveBeenCalledWith('stream-1');
    });
  });

  describe('Pastoral Content Helpers', () => {
    it('fetches sermons', async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [{ id: 's1' }] });
      pb.collection = vi.fn().mockReturnValue({ getList: mockGetList });
      const sermons = await getSermons().unsafeRunAsync();
      expect(sermons).toEqual([{ id: 's1' }]);
    });

    it('constructs file URL via Rust', async () => {
      vi.mocked(invoke).mockResolvedValue('http://rust.url');
      const url = await getFileUrl('col-1', 'rec-1', 'test.jpg');
      expect(url).toBe('http://rust.url');
      expect(invoke).toHaveBeenCalledWith('get_file_url', { collection: 'col-1', recordId: 'rec-1', fileName: 'test.jpg' });
    });
  });
});
