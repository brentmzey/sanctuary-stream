import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StreamControlsExtended } from './StreamControlsExtended';
import * as pbLib from '../lib/pocketbase';

// Mock the pocketbase library
vi.mock('../lib/pocketbase', () => ({
  sendCommand: vi.fn().mockResolvedValue({}),
}));

describe('StreamControlsExtended', () => {
  const mockStream: any = {
    id: 'stream-123',
    metadata: {
      scenes: ['Scene 1', 'Scene 2'],
      currentScene: 'Scene 1',
      inputs: [
        { name: 'Mic/Aux', muted: false, volume: 0 },
        { name: 'Desktop Audio', muted: true, volume: 0 },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders scenes and audio inputs', () => {
    render(<StreamControlsExtended stream={mockStream} />);
    
    expect(screen.getByText('Scene 1')).toBeTruthy();
    expect(screen.getByText('Scene 2')).toBeTruthy();
    expect(screen.getByText('Mic/Aux')).toBeTruthy();
    expect(screen.getByText('Desktop Audio')).toBeTruthy();
  });

  it('calls sendCommand when clicking a scene', async () => {
    render(<StreamControlsExtended stream={mockStream} />);
    
    const scene2Button = screen.getByText('Scene 2');
    fireEvent.click(scene2Button);
    
    expect(pbLib.sendCommand).toHaveBeenCalledWith('SET_SCENE', { sceneName: 'Scene 2' });
  });

  it('calls sendCommand when toggling mute', async () => {
    render(<StreamControlsExtended stream={mockStream} />);
    
    // Find the mute button for Mic/Aux (the one that is not muted)
    const micAuxContainer = screen.getByText('Mic/Aux').parentElement;
    const muteButton = micAuxContainer?.querySelector('button');
    
    if (muteButton) {
      fireEvent.click(muteButton);
    }
    
    expect(pbLib.sendCommand).toHaveBeenCalledWith('SET_MUTE', { inputName: 'Mic/Aux', muted: true });
  });

  it('renders empty states when no data available', () => {
    const emptyStream: any = { id: 'empty', metadata: {} };
    render(<StreamControlsExtended stream={emptyStream} />);
    
    expect(screen.getByText('No scenes detected from OBS.')).toBeTruthy();
    expect(screen.getByText('No audio inputs detected from OBS.')).toBeTruthy();
  });
});
