import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RecordingsList } from './RecordingsList';
import * as pbLib from '../lib/pocketbase';
import { RecordingRecord } from '../lib/pocketbase';

// Mock the pocketbase library
vi.mock('../lib/pocketbase', () => ({
  getRecordings: vi.fn(),
  pb: {
    collection: vi.fn(),
  },
}));

describe('RecordingsList', () => {
  const mockStreamId = 'stream-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // @ts-expect-error - testing with mocked function
    vi.mocked(pbLib.getRecordings).mockReturnValue({
      unsafeRunAsync: () => new Promise<RecordingRecord[]>(() => {}), // Never resolves
    });

    render(<RecordingsList streamId={mockStreamId} />);
    expect(document.querySelector('.spinner-large')).toBeTruthy();
  });

  it('renders empty state when no recordings found', async () => {
    // @ts-expect-error - testing with mocked function
    vi.mocked(pbLib.getRecordings).mockReturnValue({
      unsafeRunAsync: () => Promise.resolve<RecordingRecord[]>([]),
    });

    render(<RecordingsList streamId={mockStreamId} />);

    await waitFor(() => {
      expect(screen.getByText('No recordings found for this stream.')).toBeTruthy();
    });
  });

  it('renders list of recordings when available', async () => {
    const mockRecordings: RecordingRecord[] = [
      {
        id: 'rec-1',
        title: 'Sunday Service',
        created: '2024-03-01T10:00:00Z',
        updated: '2024-03-01T10:00:00Z',
        stream_id: mockStreamId,
        file_id: 'drive-file-1',
        size: 1024 * 1024 * 500, // 500 MB
      },
      {
        id: 'rec-2',
        title: 'Wednesday Bible Study',
        created: '2024-02-28T18:00:00Z',
        updated: '2024-02-28T18:00:00Z',
        stream_id: mockStreamId,
        file_id: 'drive-file-2',
        size: 1024 * 1024 * 250, // 250 MB
      },
    ];

    // @ts-expect-error - testing with mocked function
    vi.mocked(pbLib.getRecordings).mockReturnValue({
      unsafeRunAsync: () => Promise.resolve<RecordingRecord[]>(mockRecordings),
    });

    render(<RecordingsList streamId={mockStreamId} />);

    await waitFor(() => {
      expect(screen.getByText('Sunday Service')).toBeTruthy();
      expect(screen.getByText('Wednesday Bible Study')).toBeTruthy();
      expect(screen.getByText(/500\.00 MB/)).toBeTruthy();
      expect(screen.getByText(/250\.00 MB/)).toBeTruthy();
    });

    const links = screen.getAllByRole('link', { name: /View on Drive/i });
    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute('href')).toContain('drive-file-1');
    expect(links[1]?.getAttribute('href')).toContain('drive-file-2');
  });

  it('handles recordings with missing size', async () => {
    const mockRecordings: RecordingRecord[] = [
      {
        id: 'rec-1',
        title: 'No Size Recording',
        created: '2024-03-01T10:00:00Z',
        updated: '2024-03-01T10:00:00Z',
        stream_id: mockStreamId,
        file_id: 'drive-file-1',
      },
    ];

    // @ts-expect-error - testing with mocked function
    vi.mocked(pbLib.getRecordings).mockReturnValue({
      unsafeRunAsync: () => Promise.resolve<RecordingRecord[]>(mockRecordings),
    });

    render(<RecordingsList streamId={mockStreamId} />);

    await waitFor(() => {
      expect(screen.getByText('No Size Recording')).toBeTruthy();
      expect(screen.getByText(/0 MB/)).toBeTruthy();
    });
  });
});
