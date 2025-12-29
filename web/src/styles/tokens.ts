// ============================================================================
// Apple-Quality Design System - Design Tokens
// ============================================================================

// 8px base grid system
export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const;

// Border radii following Apple's continuous corner system
export const radii = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  full: '9999px',
  // Semantic radii
  button: '14px',
  card: '20px',
  modal: '28px',
  pill: '9999px',
} as const;

// Multi-layer shadow system for depth
export const shadows = {
  // Subtle elevation shadows
  'elevation-1': `
    0 1px 2px 0 rgba(0, 0, 0, 0.05),
    0 1px 3px 0 rgba(0, 0, 0, 0.1)
  `,
  'elevation-2': `
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 4px 6px -1px rgba(0, 0, 0, 0.1)
  `,
  'elevation-3': `
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.1)
  `,
  'elevation-4': `
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 20px 25px -5px rgba(0, 0, 0, 0.1)
  `,

  // Button shadows with colored ambient
  'button-default': `
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05)
  `,
  'button-hover': `
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08)
  `,
  'button-active': `
    0 1px 1px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.1)
  `,

  // Glass morphism shadows
  glass: `
    0 4px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  'glass-hover': `
    0 8px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15)
  `,

  // Glow effects for active states
  'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
  'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
  'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
} as const;

// Animation timing functions (Apple-style springs)
export const easing = {
  // Standard easing
  linear: 'linear',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',

  // Apple-style spring curves
  spring: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  springBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  springSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // iOS-specific
  iosEaseOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  iosEaseIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  iosEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
} as const;

// Durations
export const durations = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',
  // Animation-specific
  buttonPress: '120ms',
  tabSwitch: '250ms',
  modalOpen: '350ms',
  pageTransition: '400ms',
} as const;

// Framer Motion spring configurations
export const springConfigs = {
  // Default spring for most interactions
  default: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  // Snappy for buttons and quick interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 25,
  },
  // Bouncy for playful elements
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  // Gentle for larger elements
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  // Smooth for slow transitions
  smooth: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
  },
} as const;

// Typography scale (Apple-inspired)
export const typography = {
  'display-large': {
    fontSize: '56px',
    lineHeight: '64px',
    letterSpacing: '-0.02em',
    fontWeight: 700,
  },
  display: {
    fontSize: '40px',
    lineHeight: '48px',
    letterSpacing: '-0.015em',
    fontWeight: 600,
  },
  headline: {
    fontSize: '28px',
    lineHeight: '36px',
    letterSpacing: '-0.01em',
    fontWeight: 600,
  },
  'title-1': {
    fontSize: '22px',
    lineHeight: '28px',
    letterSpacing: '-0.005em',
    fontWeight: 600,
  },
  'title-2': {
    fontSize: '17px',
    lineHeight: '24px',
    letterSpacing: '0',
    fontWeight: 600,
  },
  'title-3': {
    fontSize: '15px',
    lineHeight: '20px',
    letterSpacing: '0',
    fontWeight: 600,
  },
  body: {
    fontSize: '15px',
    lineHeight: '22px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  callout: {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  subheadline: {
    fontSize: '13px',
    lineHeight: '18px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  footnote: {
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  'caption-1': {
    fontSize: '11px',
    lineHeight: '14px',
    letterSpacing: '0.01em',
    fontWeight: 400,
  },
  'caption-2': {
    fontSize: '10px',
    lineHeight: '12px',
    letterSpacing: '0.02em',
    fontWeight: 400,
  },
} as const;
