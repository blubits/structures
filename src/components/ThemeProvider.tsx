import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextType {
  prefersDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provides a theme context for toggling between dark and light modes, persisting user preference in localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('prefers-dark-mode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (prefersDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      localStorage.setItem('prefers-dark-mode', prefersDarkMode ? 'true' : 'false');
    }
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    setPrefersDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ prefersDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the theme context and toggle dark/light mode.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
