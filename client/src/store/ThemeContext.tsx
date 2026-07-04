import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'ocean' | 'cosmic' | 'mint' | 'midnight' | 'neon';

export const roleDefaultTheme: Record<string, Theme> = {
  FRESHER: 'cosmic',
  CLIENT: 'ocean',
  MENTOR: 'mint',
};

export const themes = [
  { id: 'ocean', label: 'Ocean', emoji: '🌊', desc: 'Professional', color: '#2563EB' },
  { id: 'cosmic', label: 'Cosmic', emoji: '🌌', desc: 'Developer', color: '#7C3AED' },
  { id: 'mint', label: 'Mint', emoji: '🌿', desc: 'Minimal', color: '#10B981' },
  { id: 'midnight', label: 'Midnight', emoji: '🌑', desc: 'Premium Dark', color: '#3B82F6' },
  { id: 'neon', label: 'Neon', emoji: '💖', desc: 'Cyberpunk', color: '#FF0080' },
] as const;

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'cosmic'
  );

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};