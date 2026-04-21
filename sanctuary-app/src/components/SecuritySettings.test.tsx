import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SecuritySettings } from './SecuritySettings';
import { pb } from '../lib/pocketbase';
import { ThemeProvider } from '../lib/ThemeContext';

// Mock PocketBase
vi.mock('../lib/pocketbase', () => ({
  pb: {
    authStore: {
      model: {
        id: 'user-123',
        email: 'pastor@church.com',
        name: 'Pastor John',
        verified: true,
      }
    },
    collection: vi.fn()
  }
}));

// Mock matchMedia for ThemeContext
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('SecuritySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with user data', () => {
    renderWithTheme(<SecuritySettings />);
    expect(screen.getByText(/Security Protocol & Access/i)).toBeDefined();
    expect(screen.getByText(/Update Communication Channel/i)).toBeDefined();
    expect(screen.getByText(/Key Rotation/i)).toBeDefined();
    expect(screen.getByText(/Status:/i)).toBeDefined();
  });

  it('handles email change request successfully', async () => {
    const user = userEvent.setup();
    const mockRequestEmailChange = vi.fn().mockResolvedValue(true);
    vi.mocked(pb.collection).mockReturnValue({
      requestEmailChange: mockRequestEmailChange
    } as any);

    renderWithTheme(<SecuritySettings />);
    
    const emailInput = screen.getByPlaceholderText(/new-email@church.com/i);
    const submitBtn = screen.getByRole('button', { name: /Request Email Change/i });

    await user.type(emailInput, 'new@example.com');
    await user.click(submitBtn);

    expect(mockRequestEmailChange).toHaveBeenCalledWith('new@example.com');
    expect(await screen.findByText(/Confirmation link sent to new@example.com/i)).toBeDefined();
  });

  it('handles password reset request successfully', async () => {
    const user = userEvent.setup();
    const mockRequestPasswordReset = vi.fn().mockResolvedValue(true);
    vi.mocked(pb.collection).mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset
    } as any);

    renderWithTheme(<SecuritySettings />);
    
    const resetBtn = screen.getByRole('button', { name: /Rotate Access Key/i });

    await user.click(resetBtn);

    expect(mockRequestPasswordReset).toHaveBeenCalledWith('pastor@church.com');
    expect(await screen.findByText(/Password reset link sent to your current email/i)).toBeDefined();
  });

  it('shows error message when email change fails', async () => {
    const user = userEvent.setup();
    const mockRequestEmailChange = vi.fn().mockRejectedValue(new Error('Invalid email address'));
    vi.mocked(pb.collection).mockReturnValue({
      requestEmailChange: mockRequestEmailChange
    } as any);

    renderWithTheme(<SecuritySettings />);
    
    const emailInput = screen.getByPlaceholderText(/new-email@church.com/i);
    const submitBtn = screen.getByRole('button', { name: /Request Email Change/i });

    await user.type(emailInput, 'invalid-email@fail.com');
    await user.click(submitBtn);

    expect(await screen.findByText(/Invalid email address/i)).toBeDefined();
  });
});
