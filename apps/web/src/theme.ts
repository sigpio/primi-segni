export const theme = {
  colors: {
    bg: '#faf7ff',
    primary: '#7c3aed',
    primaryDark: '#5b21b6',
    ink: '#2b1a4a',
    inkSoft: '#6b5b8a',
    track: '#ece3fb',
    trackLine: '#cbb6f2',
    stroke: '#7c3aed',
    good: '#22c55e',
    warn: '#f59e0b',
    danger: '#ef4444',
    card: '#ffffff',
  },
  radius: '22px',
  shadow: '0 10px 30px -12px rgba(91,33,182,0.35)',
} as const;

export type Theme = typeof theme;
