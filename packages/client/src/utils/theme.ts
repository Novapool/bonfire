/**
 * Shared inline-style tokens for Bonfire UI components.
 * Using these means components render correctly with zero consumer setup —
 * no Tailwind, no CSS config, no design tokens needed.
 */

export const C = {
  // Indigo (primary brand)
  indigo50:  '#eef2ff',
  indigo200: '#c7d2fe',
  indigo300: '#a5b4fc',
  indigo500: '#6366f1',
  indigo600: '#4f46e5',

  // Grays
  white:   '#ffffff',
  gray50:  '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray900: '#111827',

  // Semantic
  green500:  '#10b981',
  amber500:  '#f59e0b',
  red100:    '#fee2e2',
  red200:    '#fecaca',
  red400:    '#f87171',
  red500:    '#ef4444',
  red700:    '#b91c1c',
  yellow50:  '#fefce8',
  yellow100: '#fef9c3',
  yellow400: '#facc15',
  yellow600: '#ca8a04',
  yellow700: '#a16207',
  purple100: '#f3e8ff',
  purple200: '#e9d5ff',
  purple700: '#7e22ce',
  orange100: '#ffedd5',
  orange200: '#fed7aa',
  orange700: '#c2410c',
} as const;

export const shadow = {
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md:   '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
} as const;

export const radius = {
  sm:   '0.375rem',
  md:   '0.5rem',
  lg:   '0.75rem',
  xl:   '1rem',
  full: '9999px',
} as const;
