import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ControlButtons } from './ControlButtons';
import * as pb from '../lib/pocketbase';

// Mock the pocketbase library
vi.mock('../lib/pocketbase', () => ({
  sendCommand: vi.fn(),
}));

describe('ControlButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Go Live" when not live', () => {
    render(<ControlButtons isLive={false} isRecording={false} />);
    expect(screen.getByText(/Go Live/i)).toBeDefined();
  });

  it('renders "End Stream" when live', () => {
    render(<ControlButtons isLive={true} isRecording={false} />);
    expect(screen.getByText(/End Stream/i)).toBeDefined();
  });

  it('renders "Start Recording" when not recording', () => {
    render(<ControlButtons isLive={false} isRecording={false} />);
    expect(screen.getByText(/Start Recording/i)).toBeDefined();
  });

  it('renders "Stop Recording" when recording', () => {
    render(<ControlButtons isLive={false} isRecording={true} />);
    expect(screen.getByText(/Stop Recording/i)).toBeDefined();
  });

  it('calls sendCommand with START when clicking Go Live', async () => {
    render(<ControlButtons isLive={false} isRecording={false} />);
    const button = screen.getByText(/Go Live/i).closest('button');
    fireEvent.click(button!);
    expect(pb.sendCommand).toHaveBeenCalledWith('START');
  });

  it('calls sendCommand with STOP when clicking End Stream', async () => {
    render(<ControlButtons isLive={true} isRecording={false} />);
    const button = screen.getByText(/End Stream/i).closest('button');
    fireEvent.click(button!);
    expect(pb.sendCommand).toHaveBeenCalledWith('STOP');
  });

  it('calls sendCommand with RECORD_START when clicking Start Recording', async () => {
    render(<ControlButtons isLive={false} isRecording={false} />);
    const button = screen.getByText(/Start Recording/i).closest('button');
    fireEvent.click(button!);
    expect(pb.sendCommand).toHaveBeenCalledWith('RECORD_START');
  });

  it('calls sendCommand with RECORD_STOP when clicking Stop Recording', async () => {
    render(<ControlButtons isLive={false} isRecording={true} />);
    const button = screen.getByText(/Stop Recording/i).closest('button');
    fireEvent.click(button!);
    expect(pb.sendCommand).toHaveBeenCalledWith('RECORD_STOP');
  });

  it('disables buttons when disabled prop is true', () => {
    render(<ControlButtons isLive={false} isRecording={false} disabled={true} />);
    const goLiveBtn = screen.getByText(/Go Live/i).closest('button');
    const startRecBtn = screen.getByText(/Start Recording/i).closest('button');
    expect(goLiveBtn).toHaveProperty('disabled', true);
    expect(startRecBtn).toHaveProperty('disabled', true);
  });

  it('shows loading state while command is executing', async () => {
    // Make sendCommand return a promise that we can control
    let resolveCommand: (val: any) => void;
    const commandPromise = new Promise((resolve) => {
      resolveCommand = resolve;
    });
    vi.mocked(pb.sendCommand).mockReturnValue(commandPromise as any);

    render(<ControlButtons isLive={false} isRecording={false} />);
    const button = screen.getByText(/Go Live/i).closest('button');
    fireEvent.click(button!);

    // Should be in loading state
    expect(button).toHaveProperty('disabled', true);
    
    // Resolve the promise
    resolveCommand!(null);

    await waitFor(() => {
      expect(button).toHaveProperty('disabled', false);
    });
  });
});
