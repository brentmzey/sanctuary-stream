import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile } from './google-drive';
import fs from 'fs';
import { google } from 'googleapis';
import { logger } from './logger';

vi.mock('fs', () => ({
  default: {
    promises: {
      readFile: vi.fn(),
    },
    createReadStream: vi.fn(),
  },
}));

vi.mock('googleapis', () => ({
  google: {
    auth: {
      fromJSON: vi.fn(),
      GoogleAuth: vi.fn(),
    },
    drive: vi.fn(),
  },
}));

vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('google-drive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authenticates using saved token and uploads file', async () => {
    // Mock token existence
    vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify({ type: 'authorized_user' }));
    
    const mockAuthClient = { credentials: {} };
    vi.mocked(google.auth.fromJSON).mockReturnValue(mockAuthClient as any);

    const mockCreate = vi.fn().mockResolvedValue({ data: { id: 'test-file-id' } });
    vi.mocked(google.drive).mockReturnValue({
      files: { create: mockCreate },
    } as any);

    const result = await uploadFile('test-video.mp4');

    expect(result._tag).toBe('success');
    if (result._tag === 'success') {
      expect(result.value).toBe('test-file-id');
    }

    expect(fs.promises.readFile).toHaveBeenCalled();
    expect(google.auth.fromJSON).toHaveBeenCalled();
    expect(google.drive).toHaveBeenCalledWith({ version: 'v3', auth: mockAuthClient });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      requestBody: { name: 'test-video.mp4', parents: [] },
      fields: 'id',
    }));
  });

  it('falls back to Service Account if no token exists', async () => {
    // Mock token file missing
    vi.mocked(fs.promises.readFile).mockRejectedValue(new Error('ENOENT: no such file or directory'));
    
    const mockGetClient = vi.fn().mockResolvedValue({ serviceAccount: true });
    vi.mocked(google.auth.GoogleAuth).mockImplementation(function() {
      return { getClient: mockGetClient };
    } as any);

    const mockCreate = vi.fn().mockResolvedValue({ data: { id: 'fallback-file-id' } });
    vi.mocked(google.drive).mockReturnValue({
      files: { create: mockCreate },
    } as any);

    const result = await uploadFile('fallback-video.mp4');

    expect(result._tag).toBe('success');
    if (result._tag === 'success') {
      expect(result.value).toBe('fallback-file-id');
    }

    expect(google.auth.GoogleAuth).toHaveBeenCalled();
    expect(mockGetClient).toHaveBeenCalled();
    expect(google.drive).toHaveBeenCalledWith({ version: 'v3', auth: { serviceAccount: true } });
  });

  it('handles upload errors gracefully', async () => {
    vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify({}));
    vi.mocked(google.auth.fromJSON).mockReturnValue({} as any);

    const mockCreate = vi.fn().mockRejectedValue(new Error('Drive API error'));
    vi.mocked(google.drive).mockReturnValue({
      files: { create: mockCreate },
    } as any);

    const result = await uploadFile('error-video.mp4');

    expect(result._tag).toBe('failure');
    if (result._tag === 'failure') {
      expect(result.error.message).toBe('Drive API error');
    }
  });
});
