import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreamHealthMonitor } from './StreamHealthMonitor';
import { StreamStatus } from '@shared/schema';

describe('StreamHealthMonitor', () => {
  it('renders nothing if stream is not live', () => {
    const { container } = render(<StreamHealthMonitor stream={{ status: StreamStatus.Idle, id: '', heartbeat: '', metadata: {}, created: '', updated: '' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders excellent health metrics', () => {
    const stream = {
      id: '1',
      status: StreamStatus.Live,
      heartbeat: '',
      created: '',
      updated: '',
      metadata: {
        outputActive: true,
        outputDuration: 60000,
        outputBytes: 37500000, // 37.5MB = 300Mb / 60s = 5000 Kbps
        quality: {
          fps: 30,
          dropped_frames: 0,
          cpu_usage: 40
        }
      }
    };
    render(<StreamHealthMonitor stream={stream} />);
    
    expect(screen.getByText('excellent')).toBeDefined();
    expect(screen.getByText('5,000')).toBeDefined(); // Bitrate
    expect(screen.getByText('0.0%')).toBeDefined(); // Drops
    expect(screen.getByText('40%')).toBeDefined(); // CPU
    expect(screen.getByText('1m 0s')).toBeDefined(); // Uptime
    expect(screen.getByText(/Stream health is optimal/i)).toBeDefined();
  });

  it('renders critical health for high frame drops', () => {
    const stream = {
      id: '1',
      status: StreamStatus.Live,
      heartbeat: '',
      created: '',
      updated: '',
      metadata: {
        outputActive: true,
        outputDuration: 10000, // 10s -> 300 frames
        outputBytes: 100000,
        quality: {
          fps: 30,
          dropped_frames: 30, // 10% drop
          cpu_usage: 90
        }
      }
    };
    render(<StreamHealthMonitor stream={stream} />);
    
    expect(screen.getByText('critical')).toBeDefined();
    expect(screen.getByText('10.0%')).toBeDefined(); // Drops
    expect(screen.getByText('90%')).toBeDefined(); // CPU
    expect(screen.getByText(/High frame drops detected/i)).toBeDefined();
    expect(screen.getByText(/High CPU usage/i)).toBeDefined();
  });

  it('renders poor health for some frame drops', () => {
    const stream = {
      id: '1',
      status: StreamStatus.Live,
      heartbeat: '',
      created: '',
      updated: '',
      metadata: {
        outputDuration: 10000, // 300 frames
        quality: { fps: 30, dropped_frames: 10 } // 3.3% drop
      }
    };
    render(<StreamHealthMonitor stream={stream} />);
    expect(screen.getByText('poor')).toBeDefined();
    expect(screen.getByText(/Some frame drops occurring/i)).toBeDefined();
  });

  it('renders fair health for minor frame drops', () => {
    const stream = {
      id: '1',
      status: StreamStatus.Live,
      heartbeat: '',
      created: '',
      updated: '',
      metadata: {
        outputDuration: 10000, // 300 frames
        quality: { fps: 30, dropped_frames: 3 } // 1.0% drop
      }
    };
    render(<StreamHealthMonitor stream={stream} />);
    expect(screen.getByText('fair')).toBeDefined();
    expect(screen.getByText(/Minor frame drops/i)).toBeDefined();
  });

  it('detects low bitrate', () => {
    const stream = {
      id: '1',
      status: StreamStatus.Live,
      heartbeat: '',
      created: '',
      updated: '',
      metadata: {
        outputDuration: 40000, // >30s
        outputBytes: 1000000, // 8Mb / 40s = 200 Kbps (low)
        quality: { fps: 30, dropped_frames: 0, cpu_usage: 10 }
      }
    };
    render(<StreamHealthMonitor stream={stream} />);
    expect(screen.getByText('critical')).toBeDefined();
    expect(screen.getByText(/Very low bitrate detected/i)).toBeDefined();
  });
});
