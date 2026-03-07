import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Helper component to test useTheme hook
const TestComponent = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock matchMedia
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
  });

  it('provides default theme as system', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('loads theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('updates theme and localStorage when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText('Light'));
    });
    
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('resolves theme correctly for light mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText('Light'));
    });
    
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('resolves theme correctly for dark mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    act(() => {
      fireEvent.click(screen.getByText('Dark'));
    });
    
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('resolves system theme correctly (light)', () => {
    // matchMedia is already mocked to return matches: false
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('resolves system theme correctly (dark)', () => {
    // Re-mock matchMedia for this test
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Silence console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useTheme must be used within a ThemeProvider');
    
    spy.mockRestore();
  });
});
