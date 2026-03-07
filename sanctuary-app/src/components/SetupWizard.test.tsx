import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SetupWizard } from './SetupWizard';
import { pb, setPocketBaseUrl, testConnection } from '../lib/pocketbase';

import { AsyncIO } from '@shared/io';

vi.mock('../lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(),
  },
  setPocketBaseUrl: vi.fn(),
  testConnection: vi.fn(),
}));

describe('SetupWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step 1 initially', () => {
    render(<SetupWizard onComplete={() => {}} />);
    expect(screen.getByText(/Initial Setup/i)).toBeDefined();
    expect(screen.getByText(/Establish Connection/i)).toBeDefined();
  });

  it('handles connection success', async () => {
    vi.mocked(testConnection).mockReturnValue(AsyncIO.pure(true));
    render(<SetupWizard onComplete={() => {}} />);
    
    const urlInput = screen.getByPlaceholderText('http://127.0.0.1:8090');
    fireEvent.change(urlInput, { target: { value: 'http://localhost:8090' } });
    
    const connectBtn = screen.getByText(/Establish Connection/i);
    await act(async () => {
      fireEvent.click(connectBtn);
    });

    expect(setPocketBaseUrl).toHaveBeenCalledWith('http://localhost:8090');
    expect(screen.getByText(/Handshake Successful/i)).toBeDefined();
  });

  it('handles connection failure', async () => {
    vi.mocked(testConnection).mockReturnValue(AsyncIO.pure(false));
    render(<SetupWizard onComplete={() => {}} />);
    
    const connectBtn = screen.getByText(/Establish Connection/i);
    await act(async () => {
      fireEvent.click(connectBtn);
    });

    expect(screen.getByText(/Could not connect to PocketBase/i)).toBeDefined();
  });

  it('handles connection error exception', async () => {
    vi.mocked(testConnection).mockReturnValue(new AsyncIO(() => Promise.reject(new Error('Network Error'))));
    render(<SetupWizard onComplete={() => {}} />);
    
    const connectBtn = screen.getByText(/Establish Connection/i);
    await act(async () => {
      fireEvent.click(connectBtn);
    });

    expect(screen.getByText(/Invalid URL format/i)).toBeDefined();
  });

  it('handles login and stream creation successfully', async () => {
    vi.mocked(testConnection).mockReturnValue(AsyncIO.pure(true));
    const mockAuth = vi.fn().mockResolvedValue({});
    const mockCreate = vi.fn().mockResolvedValue({ id: 'new-stream-id' });
    vi.mocked(pb.collection).mockImplementation((collectionName) => {
      if (collectionName === 'users') return { authWithPassword: mockAuth } as any;
      if (collectionName === 'streams') return { create: mockCreate } as any;
      return {} as any;
    });

    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Establish Connection/i));
    });

    const emailInput = screen.getByPlaceholderText('pastor@church.com');
    // Password input doesn't have placeholder, use label
    const passwordInput = screen.getByLabelText(/Access Password/i);
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'pass123' } });
      fireEvent.click(screen.getByText(/Create Stream Account/i));
    });

    expect(mockAuth).toHaveBeenCalledWith('admin@test.com', 'pass123');
    expect(mockCreate).toHaveBeenCalled();
    expect(localStorage.getItem('stream_id')).toBe('new-stream-id');
    expect(onComplete).toHaveBeenCalledWith('new-stream-id');
  });

  it('handles login failure', async () => {
    vi.mocked(testConnection).mockReturnValue(AsyncIO.pure(true));
    const mockAuth = vi.fn().mockRejectedValue(new Error('Auth failed'));
    vi.mocked(pb.collection).mockImplementation((collectionName) => {
      if (collectionName === 'users') return { authWithPassword: mockAuth } as any;
      return {} as any;
    });

    render(<SetupWizard onComplete={() => {}} />);
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Establish Connection/i));
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Create Stream Account/i));
    });

    expect(screen.getByText(/Auth failed/i)).toBeDefined();
  });
});
