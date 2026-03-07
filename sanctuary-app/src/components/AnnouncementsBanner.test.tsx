import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AnnouncementsBanner } from './AnnouncementsBanner';
import { getAnnouncements } from '../lib/pocketbase';
import { AsyncIO } from '@shared/io';

vi.mock('../lib/pocketbase', () => ({
  getAnnouncements: vi.fn()
}));

describe('AnnouncementsBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing initially or if empty', async () => {
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure([]));
    const { container } = render(<AnnouncementsBanner />);
    await act(async () => {}); // wait for effect
    expect(container.firstChild).toBeNull();
  });

  it('renders high priority announcements', async () => {
    const mockAnnouncements = [
      { id: '1', title: 'Urgent', body: 'Please read', priority: 'high', published: true, created: '', updated: '' },
      { id: '2', title: 'Normal', priority: 'normal', published: true, created: '', updated: '' }
    ];
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure(mockAnnouncements as any));
    
    render(<AnnouncementsBanner />);
    await act(async () => {});
    
    expect(screen.getByText('Urgent')).toBeDefined();
    expect(screen.getByText('— Please read')).toBeDefined();
    expect(screen.queryByText('Normal')).toBeNull(); // Only shows high if high exists
  });

  it('renders latest normal if no high priority', async () => {
    const mockAnnouncements = [
      { id: '1', title: 'First Normal', priority: 'normal', published: true, created: '', updated: '' },
      { id: '2', title: 'Second Normal', priority: 'normal', published: true, created: '', updated: '' }
    ];
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure(mockAnnouncements as any));
    
    render(<AnnouncementsBanner />);
    await act(async () => {});
    
    expect(screen.getByText('First Normal')).toBeDefined();
    expect(screen.queryByText('Second Normal')).toBeNull();
  });

  it('hides when dismissed', async () => {
    const mockAnnouncements = [
      { id: '1', title: 'To Dismiss', priority: 'high', published: true, created: '', updated: '' }
    ];
    vi.mocked(getAnnouncements).mockReturnValue(AsyncIO.pure(mockAnnouncements as any));
    
    render(<AnnouncementsBanner />);
    await act(async () => {});
    
    expect(screen.getByText('To Dismiss')).toBeDefined();
    
    const dismissBtn = screen.getByLabelText('Dismiss announcements');
    await act(async () => {
      fireEvent.click(dismissBtn);
    });
    
    expect(screen.queryByText('To Dismiss')).toBeNull();
  });

  it('handles errors gracefully', async () => {
    vi.mocked(getAnnouncements).mockReturnValue(new AsyncIO(() => Promise.reject(new Error('Failed'))));
    const { container } = render(<AnnouncementsBanner />);
    await act(async () => {});
    
    expect(container.firstChild).toBeNull();
  });
});
