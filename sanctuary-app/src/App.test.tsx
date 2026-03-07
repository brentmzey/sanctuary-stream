import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { useStream } from './lib/hooks';
import { ThemeProvider } from './lib/ThemeContext';
import { none, some } from '@shared/option';

vi.mock('./lib/pocketbase', () => ({
  pb: {
    authStore: {
      get isValid() { return mockIsValid; },
      get model() { return mockModel; },
      clear: vi.fn(() => { mockIsValid = false; mockModel = null; })
    },
    collection: vi.fn(),
  },
  getAnnouncements: vi.fn(() => ({ unsafeRunAsync: vi.fn().mockResolvedValue([]) })),
  getSermons: vi.fn(() => ({ unsafeRunAsync: vi.fn().mockResolvedValue([]) })),
  getResources: vi.fn(() => ({ unsafeRunAsync: vi.fn().mockResolvedValue([]) })),
}));

let mockIsValid = false;
let mockModel: any = null;

vi.mock('./lib/hooks', () => ({
  useStream: vi.fn()
}));

const renderApp = () => render(<ThemeProvider><App /></ThemeProvider>);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockIsValid = false;
    mockModel = null;
    vi.mocked(useStream).mockReturnValue({ stream: none(), loading: false, error: none() });
  });

  it('renders SetupWizard if no stream_id', () => {
    renderApp();
    expect(screen.getByText(/Initial Setup/i)).toBeDefined();
  });

  it('renders LoginForm if has stream_id but not authenticated', () => {
    localStorage.setItem('stream_id', 'test-stream');
    renderApp();
    expect(screen.getByText(/Initiate Command/i)).toBeDefined(); // Login form button
  });

  it('renders main app if authenticated and has stream_id', () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: some({ id: 'test-stream', status: 'idle', heartbeat: '', created: '', updated: '' }),
      loading: false,
      error: none()
    });

    renderApp();
    expect(screen.getByText(/Sanctuary Stream/i)).toBeDefined();
    expect(screen.getByText(/Admin User/i)).toBeDefined();
    expect(screen.getByText(/Stream Control/i)).toBeDefined();
  });

  it('can switch tabs', async () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: some({ id: 'test-stream', status: 'idle', heartbeat: '', created: '', updated: '' }),
      loading: false,
      error: none()
    });

    renderApp();
    
    const reflectionsTab = screen.getByRole('button', { name: /Pastoral Reflections/i });
    await act(async () => {
      fireEvent.click(reflectionsTab);
    });

    expect(screen.getByText(/Sermons, announcements, and resources/i)).toBeDefined();
  });

  it('can sign out', async () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    renderApp();

    const signOutBtn = screen.getByText(/Sign Out/i);
    await act(async () => {
      fireEvent.click(signOutBtn);
    });

    expect(mockIsValid).toBe(false);
    // After logout, it should render LoginForm
    expect(screen.getByText(/Initiate Command/i)).toBeDefined();
  });
});
