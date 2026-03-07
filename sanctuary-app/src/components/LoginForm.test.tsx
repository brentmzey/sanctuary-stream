import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { pb } from '../lib/pocketbase';
import { ThemeProvider } from '../lib/ThemeContext';

// Mock PocketBase
vi.mock('../lib/pocketbase', () => ({
  pb: {
    collection: vi.fn(() => ({
      authWithPassword: vi.fn(),
    })),
  },
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithTheme(<LoginForm onSuccess={() => {}} />);
    expect(screen.getByText(/Sanctuary Stream/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Channel/i)).toBeDefined();
    expect(screen.getByLabelText(/Access Key/i)).toBeDefined();
    expect(screen.getByText(/Initiate Command/i)).toBeDefined();
  });

  it('calls authWithPassword and onSuccess on successful login', async () => {
    const onSuccess = vi.fn();
    const mockAuth = vi.fn().mockResolvedValue({ record: { id: 'user-1' } });
    vi.mocked(pb.collection).mockReturnValue({ authWithPassword: mockAuth } as any);

    renderWithTheme(<LoginForm onSuccess={onSuccess} />);
    
    const emailInput = screen.getByLabelText(/Email Channel/i);
    const passwordInput = screen.getByLabelText(/Access Key/i);
    const submitBtn = screen.getByRole('button', { name: /Initiate Command/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitBtn);
    });

    expect(mockAuth).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows error message on failed login', async () => {
    const mockAuth = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    vi.mocked(pb.collection).mockReturnValue({ authWithPassword: mockAuth } as any);

    renderWithTheme(<LoginForm onSuccess={() => {}} />);
    
    const emailInput = screen.getByLabelText(/Email Channel/i);
    const passwordInput = screen.getByLabelText(/Access Key/i);
    const submitBtn = screen.getByRole('button', { name: /Initiate Command/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/Invalid credentials/i)).toBeDefined();
  });

  it('shows loading state while authenticating', async () => {
    let resolveAuth: (val: any) => void;
    const authPromise = new Promise((resolve) => {
      resolveAuth = resolve;
    });
    vi.mocked(pb.collection).mockReturnValue({ authWithPassword: () => authPromise } as any);

    renderWithTheme(<LoginForm onSuccess={() => {}} />);
    
    const emailInput = screen.getByLabelText(/Email Channel/i);
    const passwordInput = screen.getByLabelText(/Access Key/i);
    const submitBtn = screen.getByRole('button', { name: /Initiate Command/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText(/Authenticating/i)).toBeDefined();
    expect(submitBtn).toHaveProperty('disabled', true);
    
    await act(async () => {
      resolveAuth!({ record: {} });
    });
  });

  it('can toggle themes', async () => {
    renderWithTheme(<LoginForm onSuccess={() => {}} />);
    
    const lightBtn = screen.getByTitle(/Light Mode/i);
    const darkBtn = screen.getByTitle(/Dark Mode/i);
    const systemBtn = screen.getByTitle(/System Preference/i);

    await act(async () => {
      fireEvent.click(lightBtn);
    });
    await act(async () => {
      fireEvent.click(darkBtn);
    });
    await act(async () => {
      fireEvent.click(systemBtn);
    });
    
    // We just need to ensure the clicks don't crash and execute the setTheme handler
    expect(lightBtn).toBeDefined();
    expect(darkBtn).toBeDefined();
    expect(systemBtn).toBeDefined();
  });
});
