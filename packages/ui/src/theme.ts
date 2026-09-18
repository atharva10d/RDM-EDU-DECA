/**
 * EduDeca UI Design System Tokens
 * Extracted directly from EduDeca HTML master reference (:root CSS variables)
 */

export const colors = {
  // Backgrounds
  bg: '#0B0E14',
  card: '#131722',
  card2: '#181D29',
  border: '#1E2430',

  // Typography
  text: '#F2F4F8',
  muted: '#8B93A3',
  mutedDim: '#5C6675',

  // Accents
  teal: '#22D3A6',
  tealDeep: '#12261F',
  amber: '#EF9F27',
  purple: '#7F77DD',
  blue: '#4FA3E8',
  pink: '#E85D8A',
  gold: '#F0B429',
  red: '#F0654F',

  // Overlays / Alpha tokens
  tealAlpha10: 'rgba(34, 211, 166, 0.1)',
  tealAlpha12: 'rgba(34, 211, 166, 0.12)',
  tealAlpha35: 'rgba(34, 211, 166, 0.35)',
  goldAlpha10: 'rgba(240, 180, 41, 0.1)',
  goldAlpha12: 'rgba(240, 180, 41, 0.12)',
  goldAlpha35: 'rgba(240, 180, 41, 0.35)',
  purpleAlpha08: 'rgba(127, 119, 221, 0.08)',
  purpleAlpha30: 'rgba(127, 119, 221, 0.3)',
  pinkAlpha08: 'rgba(232, 93, 138, 0.08)',
  pinkAlpha30: 'rgba(232, 93, 138, 0.3)',
  redAlpha10: 'rgba(240, 101, 79, 0.1)',
  redAlpha40: 'rgba(240, 101, 79, 0.4)',
  backdropDark: 'rgba(0, 0, 0, 0.55)',
} as const;

export const gradients = {
  primaryButton: ['#22D3A6', '#22C08A'] as const,
  heroText: ['#22D3A6', '#4FA3E8'] as const,
  levelCard: ['#181D29', '#0E1220'] as const,
  progressBar: ['#22D3A6', '#4FA3E8', '#7F77DD', '#E85D8A'] as const,
  goldPill: ['#F0B429', '#EF9F27'] as const,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'Courier',
  },
  fontSize: {
    micro: 11.5,
    xs: 12.5,
    sm: 14,
    base: 15.5,
    md: 17.5,
    lg: 20,
    xl: 23,
    xxl: 27,
    hero: 30,
    score: 42,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const theme = {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
};

export type Theme = typeof theme;
