/**
 * Professional Design System
 * Using a sophisticated Slate and Indigo palette for a premium feel.
 */

import { Platform } from 'react-native';

const primary = '#2563eb'; // Indigo 600
const primaryDark = '#3b82f6'; // Blue 500

export const Colors = {
  light: {
    primary: primary,
    text: '#0f172a', // Slate 900
    secondaryText: '#64748b', // Slate 500
    background: '#f8fafc', // Slate 50
    surface: '#ffffff', // White
    border: '#e2e8f0', // Slate 200
    tint: primary,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: primary,
    error: '#ef4444',
    success: '#10b981',
  },
  dark: {
    primary: primaryDark,
    text: '#f8fafc', // Slate 50
    secondaryText: '#94a3b8', // Slate 400
    background: '#0f172a', // Slate 900
    surface: '#1e293b', // Slate 800
    border: '#334155', // Slate 700
    tint: primaryDark,
    icon: '#94a3b8',
    tabIconDefault: '#475569',
    tabIconSelected: primaryDark,
    error: '#f87171',
    success: '#34d399',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    mono: 'monospace',
  },
});
