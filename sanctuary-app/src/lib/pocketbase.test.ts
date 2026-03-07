import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  pb, 
  sendCommand, 
  getStreamStatus, 
  setPocketBaseUrl, 
  testConnection, 
  getSermons, 
  getAnnouncements, 
  getResources,
  getFileUrl
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
  });

  describe('URL Configuration', () => {
    it('sets and gets URL correctly', () => {
      const result = setPocketBaseUrl('https://my-church.pockethost.io');
      expect(result._tag).toBe('success');
      expect(pb.baseUrl).toBe('https://my-church.pockethost.io');
      expect(localStorage.getItem('pb_url')).toBe('https://my-church.pockethost.io');
    });

    it('rejects invalid URLs', () => {
      const result = setPocketBaseUrl('not-a-url');
      expect(result._tag).toBe('failure');
    });
  });

  describe('testConnection', () => {
    it('returns true on successful fetch', async () => {
      vi.mocked(global.fetch).mockResolvedValue({ ok: true } as any);
      const isConnected = await testConnection('http://localhost:8090').unsafeRunAsync();
      expect(isConnected).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8090/api/health');
    });

    it('returns false on failed fetch', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Failed'));
      const isConnected = await testConnection('http://localhost:8090').unsafeRunAsync();
      expect(isConnected).toBe(false);
    });
  });

  describe('sendCommand', () => {
    it('fails if not authenticated', async () => {
      await expect(sendCommand('START').unsafeRunAsync()).rejects.toThrow('Not authenticated');
    });

    it('uses Rust invoke if no payload is provided', async () => {
      pb.authStore.save('token', { id: 'user-123' } as any);
      vi.mocked(invoke).mockResolvedValue('corr-id');
      
      await sendCommand('START').unsafeRunAsync();
      
      expect(invoke).toHaveBeenCalledWith('send_command', expect.objectContaining({
        action: 'START',
        userId: 'user-123'
      }));
    });

    it('falls back to JS SDK if Rust fails or payload is present', async () => {
      pb.authStore.save('token', { id: 'user-123' } as any);
      const mockCreate = vi.fn().mockResolvedValue({ id: 'cmd-1' });
      pb.collection = vi.fn().mockReturnValue({ create: mockCreate });

      await sendCommand('SET_VIDEO_SETTINGS', { fpsNum: 60 }).unsafeRunAsync();
      
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        action: 'SET_VIDEO_SETTINGS',
        created_by: 'user-123',
        payload: { fpsNum: 60 }
      }));
    });
  });

  describe('getStreamStatus', () => {
    it('uses Rust invoke first', async () => {
      vi.mocked(invoke).mockResolvedValue({ status: 'live' });
      const status = await getStreamStatus('stream-1').unsafeRunAsync();
      expect(status).toEqual({ status: 'live' });
      expect(invoke).toHaveBeenCalledWith('get_stream_status', expect.any(Object));
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

    it('fetches announcements', async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [{ id: 'a1' }] });
      pb.collection = vi.fn().mockReturnValue({ getList: mockGetList });
      const announcements = await getAnnouncements().unsafeRunAsync();
      expect(announcements).toEqual([{ id: 'a1' }]);
    });

    it('fetches resources', async () => {
      const mockGetList = vi.fn().mockResolvedValue({ items: [{ id: 'r1' }] });
      pb.collection = vi.fn().mockReturnValue({ getList: mockGetList });
      const resources = await getResources('free').unsafeRunAsync();
      expect(resources).toEqual([{ id: 'r1' }]);
      expect(mockGetList).toHaveBeenCalledWith(1, 50, expect.objectContaining({
        filter: expect.stringContaining("category = 'free'")
      }));
    });

    it('constructs file URL', () => {
      const url = getFileUrl('col-1', 'rec-1', 'test.jpg');
      expect(url).toBe(`${pb.baseUrl}/api/files/col-1/rec-1/test.jpg`);
    });
  });
});
