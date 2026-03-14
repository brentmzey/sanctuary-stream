import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const getResolvedTheme = (t: Theme): 'light' | 'dark' => {
    if (t === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
  };

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getResolvedTheme(theme));

  const setTheme = (newTheme: Theme) => {
    // Only update the underlying state if the preference changed AND
    // the resolved visual state actually changes (or if we're moving from a 
    // resolved state back to 'system' but they are visually identical, 
    // we still update the preference but we want to avoid unnecessary logic).
    
    if (newTheme === theme) return;

    // If the resolved visual theme is the same, we update the preference 
    // but try to keep the transition seamless.
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      const currentTheme = getResolvedTheme(theme);

      // If class is already there and state is correct, don't do anything
      if (root.classList.contains(currentTheme) && resolvedTheme === currentTheme) {
        return;
      }

      // Performance optimization: only remove/add if different
      if (!root.classList.contains(currentTheme)) {
        root.classList.remove('light', 'dark');
        root.classList.add(currentTheme);
      }
      
      if (resolvedTheme !== currentTheme) {
        setResolvedTheme(currentTheme);
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

 // eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
