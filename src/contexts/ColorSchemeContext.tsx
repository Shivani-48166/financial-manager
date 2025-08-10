import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorScheme = 'blue' | 'green' | 'purple' | 'slate' | 'teal';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

const colorSchemes = {
  blue: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  green: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  purple: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  slate: {
    50: '#fcfcfc',
    100: '#f9f9f9',
    200: '#f0f0f0',
    300: '#e6e6e6',
    400: '#b8b8b8',
    500: '#8a8a8a',
    600: '#5c5c5c',
    700: '#404040',
    800: '#2e2e2e',
    900: '#1c1c1c',
  },
  teal: {
    50: '#fafbfb',
    100: '#f4f6f7',
    200: '#e8ecef',
    300: '#d1d9dd',
    400: '#9fb3ba',
    500: '#6d8c97',
    600: '#4a6b75',
    700: '#3a545c',
    800: '#2a3d43',
    900: '#1a262a',
  },
};

export const ColorSchemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    (localStorage.getItem('fm_color_scheme') as ColorScheme) || 'blue'
  );

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem('fm_color_scheme', scheme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    const colors = colorSchemes[scheme];
    
    Object.entries(colors).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });

    // Also set text color variables
    root.style.setProperty('--text-primary', colors[600]);
    root.style.setProperty('--text-primary-light', colors[500]);
    root.style.setProperty('--text-primary-dark', colors[700]);
  };

  useEffect(() => {
    // Apply initial color scheme
    setColorScheme(colorScheme);
  }, []);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};


