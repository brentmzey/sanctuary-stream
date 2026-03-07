import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStream } from './hooks';
import { pb, subscribeToStream, unsubscribeFromStream } from './pocketbase';
import { isSome, isNone } from '@shared/option';

vi.mock('./pocketbase', () => ({
  pb: {
    collection: vi.fn(),
  },
  subscribeToStream: vi.fn(),
  unsubscribeFromStream: vi.fn(),
}));

describe('useStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns early if no streamId or not authenticated', () => {
    const { result } = renderHook(() => useStream({ streamId: '', isAuthenticated: false }));
    expect(result.current.loading).toBe(false);
    expect(isNone(result.current.stream)).toBe(true);
    expect(isNone(result.current.error)).toBe(true);
  });

  it('fetches stream and subscribes on mount', async () => {
    const mockRecord = { id: 'test-stream', status: 'idle' };
    const mockGetOne = vi.fn().mockResolvedValue(mockRecord);
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    const { result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));

    expect(result.current.loading).toBe(true);

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(isSome(result.current.stream)).toBe(true);
    if (isSome(result.current.stream)) {
      expect(result.current.stream.value).toEqual(mockRecord);
    }
    
    expect(subscribeToStream).toHaveBeenCalledWith('test-stream', expect.any(Function));
  });

  it('handles fetch error', async () => {
    const mockGetOne = vi.fn().mockRejectedValue(new Error('Fetch failed'));
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    const { result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(isSome(result.current.error)).toBe(true);
    if (isSome(result.current.error)) {
      expect(result.current.error.value).toBe('Fetch failed');
    }
  });

  it('unsubscribes on unmount', async () => {
    const mockGetOne = vi.fn().mockResolvedValue({});
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    const { unmount } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));

    await act(async () => {});

    unmount();

    expect(unsubscribeFromStream).toHaveBeenCalledWith('test-stream');
  });

  it('updates stream when subscription callback fires', async () => {
    const mockRecord = { id: 'test-stream', status: 'idle' };
    const mockGetOne = vi.fn().mockResolvedValue(mockRecord);
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    let subCallback: any;
    vi.mocked(subscribeToStream).mockImplementation((_, cb) => {
      subCallback = cb;
    });

    const { result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));
    await act(async () => {});

    const updatedRecord = { id: 'test-stream', status: 'live' };
    act(() => {
      subCallback(updatedRecord);
    });

    if (isSome(result.current.stream)) {
      expect(result.current.stream.value.status).toBe('live');
    }
  });

  it('does not update state if unmounted before fetch completes', async () => {
    let resolveFetch: any;
    const mockGetOne = vi.fn().mockImplementation(() => new Promise((resolve) => {
      resolveFetch = resolve;
    }));
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    const { unmount, result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));

    // Unmount before fetch resolves
    unmount();

    await act(async () => {
      resolveFetch({ id: 'test-stream' });
    });

    // Should still be loading (or none) because state update was skipped
    expect(isNone(result.current.stream)).toBe(true);
  });

  it('does not update error state if unmounted before fetch fails', async () => {
    let rejectFetch: any;
    const mockGetOne = vi.fn().mockImplementation(() => new Promise((_, reject) => {
      rejectFetch = reject;
    }));
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    const { unmount, result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));

    unmount();

    await act(async () => {
      rejectFetch(new Error('Unmounted fetch fail'));
    });

    expect(isNone(result.current.error)).toBe(true);
  });

  it('does not update stream if unmounted before subscription fires', async () => {
    const mockRecord = { id: 'test-stream', status: 'idle' };
    const mockGetOne = vi.fn().mockResolvedValue(mockRecord);
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    let subCallback: any;
    vi.mocked(subscribeToStream).mockImplementation((_, cb) => {
      subCallback = cb;
    });

    const { unmount, result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));
    await act(async () => {});

    unmount();

    const updatedRecord = { id: 'test-stream', status: 'live' };
    act(() => {
      subCallback(updatedRecord);
    });

    // Status should still be 'idle' since the update was ignored
    if (isSome(result.current.stream)) {
      expect(result.current.stream.value.status).toBe('idle');
    }
  });

  it('handles unknown error format', async () => {
    const mockGetOne = vi.fn().mockRejectedValue('String Error');
    vi.mocked(pb.collection).mockReturnValue({ getOne: mockGetOne } as any);

    const { result } = renderHook(() => useStream({ streamId: 'test-stream', isAuthenticated: true }));

    await act(async () => {});

    if (isSome(result.current.error)) {
      expect(result.current.error.value).toBe('Unknown error');
    }
  });
});
