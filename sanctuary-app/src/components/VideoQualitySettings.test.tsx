import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { VideoQualitySettings } from './VideoQualitySettings';
import { sendCommand } from '../lib/pocketbase';

vi.mock('../lib/pocketbase', () => ({
  sendCommand: vi.fn(),
}));

describe('VideoQualitySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and shows data usage estimate', () => {
    render(<VideoQualitySettings />);
    expect(screen.getByText(/Broadcast Engine/i)).toBeDefined();
    expect(screen.getByText(/Visual Configuration/i)).toBeDefined();
  });

  it('updates resolution and bitrate', async () => {
    render(<VideoQualitySettings />);
    
    const resolutionSelect = screen.getByLabelText(/Resolution Profile/i);
    const bitrateInput = screen.getByRole('slider');
    
    await act(async () => {
      fireEvent.change(resolutionSelect, { target: { value: '1280x720' } });
      fireEvent.change(bitrateInput, { target: { value: '2500' } });
    });

    expect((resolutionSelect as HTMLSelectElement).value).toBe('1280x720');
    expect((bitrateInput as HTMLInputElement).value).toBe('2500');
  });

  it('calls sendCommand with correct parameters when saved', async () => {
    vi.mocked(sendCommand).mockResolvedValue({} as any);
    render(<VideoQualitySettings />);
    
    const submitBtn = screen.getByText(/Synchronize Engine/i);
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Default settings assertions
    expect(sendCommand).toHaveBeenCalledWith('SET_VIDEO_SETTINGS', { 
      baseWidth: 1920, baseHeight: 1080, outputWidth: 1920, outputHeight: 1080, fpsNum: 30, fpsDen: 1 
    });
    expect(sendCommand).toHaveBeenCalledWith('SET_STREAM_ENCODER', {
      encoder: 'obs_x264',
      settings: { bitrate: 3500, keyint_sec: 2, preset: 'fast', profile: 'high', rate_control: 'CBR' }
    });
    expect(sendCommand).toHaveBeenCalledWith('SET_AUDIO_SETTINGS', {
      sampleRate: 48000, channels: 2, bitrate: 160
    });
    
    expect(screen.getByText(/Quality settings synchronized with station!/i)).toBeDefined();
  });

  it('shows error when sendCommand fails', async () => {
    vi.mocked(sendCommand).mockRejectedValue(new Error('Failed'));
    render(<VideoQualitySettings />);
    
    const submitBtn = screen.getByText(/Synchronize Engine/i);
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/Failed to update quality settings/i)).toBeDefined();
  });

  it('handles FPS and Audio changes', async () => {
    vi.mocked(sendCommand).mockResolvedValue({} as any);
    render(<VideoQualitySettings />);
    
    const fps60Btn = screen.getByText(/60 FPS/i);
    const audioSelect = screen.getByLabelText(/Audio quality/i);
    const encoderSelect = screen.getByLabelText(/Hardware Encoder/i);
    
    await act(async () => {
      fireEvent.click(fps60Btn);
      fireEvent.change(audioSelect, { target: { value: '320' } });
      fireEvent.change(encoderSelect, { target: { value: 'ffmpeg_nvenc' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Synchronize Engine/i));
    });

    expect(sendCommand).toHaveBeenCalledWith('SET_VIDEO_SETTINGS', { 
      baseWidth: 1920, baseHeight: 1080, outputWidth: 1920, outputHeight: 1080, fpsNum: 60, fpsDen: 1 
    });
    expect(sendCommand).toHaveBeenCalledWith('SET_STREAM_ENCODER', {
      encoder: 'ffmpeg_nvenc',
      settings: { bitrate: 3500, keyint_sec: 2, preset: 'fast', profile: 'high', rate_control: 'CBR' }
    });
  });
});
