import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreamStatus } from './StreamStatus';
import type { StreamRecord } from '../lib/pocketbase';
import { StreamStatus as PBStreamStatus } from '@shared/schema';

describe('StreamStatus', () => {
  const mockStream: StreamRecord = {
    id: 'stream-123',
    status: PBStreamStatus.Idle,
    heartbeat: new Date().toISOString(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };

  it('renders "System Ready" when status is idle', () => {
    render(<StreamStatus stream={mockStream} />);
    expect(screen.getByText(/System Ready/i)).toBeDefined();
  });

  it('renders "Streaming Live" when status is live', () => {
    render(<StreamStatus stream={{ ...mockStream, status: PBStreamStatus.Live }} />);
    expect(screen.getByText(/Streaming Live/i)).toBeDefined();
  });

  it('renders "Recording Session" when status is recording', () => {
    render(<StreamStatus stream={{ ...mockStream, status: PBStreamStatus.Recording }} />);
    expect(screen.getByText(/Recording Session/i)).toBeDefined();
  });

  it('renders "Connection Error" when status is error', () => {
    render(<StreamStatus stream={{ ...mockStream, status: PBStreamStatus.Error }} />);
    expect(screen.getByText(/Connection Error/i)).toBeDefined();
  });

  it('renders "Station Online" when heartbeat is fresh', () => {
    render(<StreamStatus stream={mockStream} />);
    expect(screen.getByText(/Station Online/i)).toBeDefined();
  });

  it('renders "Station Offline" when heartbeat is stale', () => {
    const staleDate = new Date(Date.now() - 60000).toISOString();
    render(<StreamStatus stream={{ ...mockStream, heartbeat: staleDate }} />);
    expect(screen.getByText(/Station Offline/i)).toBeDefined();
  });

  it('renders the stream ID', () => {
    render(<StreamStatus stream={mockStream} />);
    expect(screen.getByText('stream-123')).toBeDefined();
  });
});
