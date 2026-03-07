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

vi.mock('./components/SetupWizard', () => ({
  SetupWizard: ({ onComplete }: any) => (
    <div data-testid="mock-setup-wizard">
      <button onClick={() => onComplete('new-stream-id')}>Complete Setup</button>
    </div>
  )
}));

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
    expect(screen.getByRole('button', { name: /Complete Setup/i })).toBeDefined();
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

  it('handles SetupWizard completion', async () => {
    // No stream id to show SetupWizard
    localStorage.removeItem('stream_id');
    renderApp();
    
    const completeBtn = screen.getByRole('button', { name: /Complete Setup/i });

    // Assuming pocketbase model gets set when authenticated
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: some({ id: 'new-stream-id', status: 'idle', heartbeat: '', created: '', updated: '' }),
      loading: false,
      error: none()
    });

    await act(async () => {
      fireEvent.click(completeBtn);
    });

    // Should transition to the main app layout now that stream_id is set
    expect(screen.getByText(/Sanctuary Stream/i)).toBeDefined();
  });

  it('can toggle quality and settings panels', async () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: some({ id: 'test-stream', status: 'live', heartbeat: '', created: '', updated: '' }),
      loading: false,
      error: none()
    });

    renderApp();
    
    const qualityBtn = screen.getByText(/🎬 Video Quality/i);
    const settingsBtn = screen.getByText(/⚙️ Stream Settings/i);

    await act(async () => {
      fireEvent.click(qualityBtn);
    });
    expect(screen.getByText(/🔼 Hide Quality Controls/i)).toBeDefined();

    await act(async () => {
      fireEvent.click(settingsBtn);
    });
    expect(screen.getByText(/🔼 Hide Settings/i)).toBeDefined();
  });

  it('renders permission notice for non-admin users', async () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'tech', name: 'Tech User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: some({ id: 'test-stream', status: 'live', heartbeat: '', created: '', updated: '' }),
      loading: false,
      error: none()
    });

    renderApp();
    
    expect(screen.getByText(/You don't have permission to control streaming/i)).toBeDefined();
  });

  it('shows error banner when error is present', async () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: none(),
      loading: false,
      error: some('Connection lost')
    });

    renderApp();
    
    expect(screen.getByText(/Connection lost/i)).toBeDefined();
  });

  it('shows stream metadata when present', async () => {
    localStorage.setItem('stream_id', 'test-stream');
    mockIsValid = true;
    mockModel = { role: 'admin', name: 'Admin User' } as any;

    vi.mocked(useStream).mockReturnValue({
      stream: some({ 
        id: 'test-stream', status: 'live', heartbeat: '', created: '', updated: '', youtube_url: 'http://youtube.com/watch',
        metadata: { outputActive: true, outputDuration: 5000, outputBytes: 2048000 }
      }),
      loading: false,
      error: none()
    });

    renderApp();
    
    expect(screen.getByText(/Stream Details/i)).toBeDefined();
    expect(screen.getByText(/Output Active/i)).toBeDefined();
    expect(screen.getByText(/Data Sent/i)).toBeDefined();
    expect(screen.getByText(/Watch Live Stream/i)).toBeDefined();
  });
});
