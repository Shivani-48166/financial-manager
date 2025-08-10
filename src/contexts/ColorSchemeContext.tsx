import React, { createContext, useContext, useEffect, useState } from 'react';

type ColorScheme = 'blue' | 'green' | 'purple' | 'slate' | 'teal';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

const colorSchemes = {
  blue: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#475569',
    900: '#334155',
  },
  green: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#475569',
    900: '#334155',
  },
  purple: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#475569',
    900: '#334155',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#475569',
    900: '#334155',
  },
  teal: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#475569',
    900: '#334155',
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


