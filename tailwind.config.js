/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50, #f0fdfa)',
          100: 'var(--color-primary-100, #ccfbf1)',
          200: 'var(--color-primary-200, #99f6e4)',
          300: 'var(--color-primary-300, #5eead4)',
          400: 'var(--color-primary-400, #2dd4bf)',
          500: 'var(--color-primary-500, #14b8a6)',
          600: 'var(--color-primary-600, #0d9488)',
          700: 'var(--color-primary-700, #0f766e)',
          800: 'var(--color-primary-800, #115e59)',
          900: 'var(--color-primary-900, #134e4a)',
        },
        'text-primary': 'var(--text-primary, #0d9488)',
        'text-primary-light': 'var(--text-primary-light, #14b8a6)',
        'text-primary-dark': 'var(--text-primary-dark, #0f766e)',
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
  plugins: [],
}


