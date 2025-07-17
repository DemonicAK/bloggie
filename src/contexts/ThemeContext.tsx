'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // During SSR or if provider is missing, provide a fallback
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => { },
      setTheme: () => { }
    };
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark mode
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if there's a stored theme preference, otherwise default to dark
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setTheme(storedTheme);
    } else {
      // Set dark mode as default
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      const body = window.document.body;

      // Apply theme to root and body
      root.classList.remove('light', 'dark');
      root.classList.add(theme);

      // Force apply theme styles to body, removing any conflicting classes
      body.className = body.className
        .split(' ')
        .filter(cls => !cls.match(/^(bg-|text-|border-|from-|via-|to-)/))
        .join(' ');
      body.classList.add('bg-background', 'text-foreground');

      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  // Always provide the context, even during SSR
  const value = {
    theme,
    toggleTheme,
    setTheme: handleSetTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={mounted ? theme : 'dark'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
