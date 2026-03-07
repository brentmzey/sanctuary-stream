import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { PastoralReflections } from './PastoralReflections';
import { getSermons, getAnnouncements, getResources } from '../lib/pocketbase';
import { AsyncIO } from '@shared/io';

vi.mock('../lib/pocketbase', () => ({
  getSermons: vi.fn(),
  getAnnouncements: vi.fn(),
  getResources: vi.fn()
}));

describe('PastoralReflections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // Return unresolved promises to keep it in loading state
    vi.mocked(getSermons).mockReturnValue(new AsyncIO(() => new Promise(() => {})));
    vi.mocked(getAnnouncements).mockReturnValue(new AsyncIO(() => new Promise(() => {})));
    vi.mocked(getResources).mockReturnValue(new AsyncIO(() => new Promise(() => {})));

    render(<PastoralReflections />);
    expect(screen.getByText('Loading…')).toBeDefined();
  });

  it('renders error state on failure', async () => {
    vi.mocked(getSermons).mockReturnValue(new AsyncIO(() => Promise.reject(new Error('Network error'))));
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure([]));
    vi.mocked(getResources).mockReturnValue(AsyncIO.pure([]));

    render(<PastoralReflections />);
    await act(async () => {});

    expect(screen.getByText('Network error')).toBeDefined();
  });

  it('renders helpful message for 404', async () => {
    vi.mocked(getSermons).mockReturnValue(new AsyncIO(() => Promise.reject(new Error('404 not found'))));
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure([]));
    vi.mocked(getResources).mockReturnValue(AsyncIO.pure([]));

    render(<PastoralReflections />);
    await act(async () => {});

    expect(screen.getByText(/Content collections not yet imported into PocketHost/i)).toBeDefined();
  });

  it('renders empty states when no data', async () => {
    vi.mocked(getSermons).mockReturnValue(AsyncIO.pure([]));
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure([]));
    vi.mocked(getResources).mockReturnValue(AsyncIO.pure([]));

    render(<PastoralReflections />);
    await act(async () => {});

    expect(screen.getByText(/No published sermons yet/i)).toBeDefined();
    
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Announcements/i })); });
    expect(screen.getByText(/No active announcements right now/i)).toBeDefined();

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Resources/i })); });
    expect(screen.getByText(/No published resources yet/i)).toBeDefined();
  });

  it('renders data when available', async () => {
    vi.mocked(getSermons).mockReturnValue(AsyncIO.pure([{
      id: '1', title: 'Sunday Sermon', sermon_date: '2023-01-01T10:00:00Z', published: true, created: '', updated: ''
    } as any]));
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure([{
      id: '1', title: 'Church Picnic', priority: 'normal', published: true, created: '', updated: ''
    } as any]));
    vi.mocked(getResources).mockReturnValue(AsyncIO.pure([{
      id: '1', title: 'Bible Reading Plan', category: 'free', published: true, created: '', updated: ''
    } as any]));

    render(<PastoralReflections />);
    await act(async () => {});

    // Sermons tab is default
    expect(screen.getByText('Sunday Sermon')).toBeDefined();

    // Switch to Announcements
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Announcements/i })); });
    expect(screen.getByText('Church Picnic')).toBeDefined();

    // Switch to Resources
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Resources/i })); });
    expect(screen.getByText('Bible Reading Plan')).toBeDefined();
  });
});
