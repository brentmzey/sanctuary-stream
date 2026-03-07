import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { StreamSettings } from './StreamSettings';
import { sendCommand } from '../lib/pocketbase';

vi.mock('../lib/pocketbase', () => ({
  sendCommand: vi.fn(),
}));

describe('StreamSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<StreamSettings />);
    expect(screen.getByText(/Integration Profiles/i)).toBeDefined();
  });

  it('shows error if stream key is empty', async () => {
    render(<StreamSettings />);
    await act(async () => {
      fireEvent.click(screen.getByText(/Push to Station/i));
    });
    expect(screen.getByText(/Stream Key is required/i)).toBeDefined();
  });

  it('calls sendCommand with correct parameters', async () => {
    vi.mocked(sendCommand).mockResolvedValue({} as any);
    render(<StreamSettings />);
    
    const keyInput = screen.getByPlaceholderText('••••••••••••••••');
    await act(async () => {
      fireEvent.change(keyInput, { target: { value: 'my-secret-key' } });
      fireEvent.click(screen.getByText(/Push to Station/i));
    });

    expect(sendCommand).toHaveBeenCalledWith('SET_STREAM_SETTINGS', {
      service: 'YouTube - RTMPS',
      server: 'auto',
      key: 'my-secret-key'
    });
    expect(screen.getByText(/Settings pushed to station!/i)).toBeDefined();
  });

  it('handles custom server input', async () => {
    vi.mocked(sendCommand).mockResolvedValue({} as any);
    render(<StreamSettings />);
    
    const select = screen.getByRole('combobox');
    await act(async () => {
      fireEvent.change(select, { target: { value: 'Custom' } });
    });

    const serverInput = screen.getByPlaceholderText('rtmp://custom.server.com/live');
    const keyInput = screen.getByPlaceholderText('••••••••••••••••');
    
    await act(async () => {
      fireEvent.change(serverInput, { target: { value: 'rtmp://test.local/live' } });
      fireEvent.change(keyInput, { target: { value: 'custom-key' } });
      fireEvent.click(screen.getByText(/Push to Station/i));
    });

    expect(sendCommand).toHaveBeenCalledWith('SET_STREAM_SETTINGS', {
      service: 'Custom',
      server: 'rtmp://test.local/live',
      key: 'custom-key'
    });
  });

  it('shows error message when sendCommand fails', async () => {
    vi.mocked(sendCommand).mockRejectedValue(new Error('Network error'));
    render(<StreamSettings />);
    
    const keyInput = screen.getByPlaceholderText('••••••••••••••••');
    await act(async () => {
      fireEvent.change(keyInput, { target: { value: 'my-secret-key' } });
      fireEvent.click(screen.getByText(/Push to Station/i));
    });

    expect(screen.getByText(/Failed to update settings/i)).toBeDefined();
  });
});
