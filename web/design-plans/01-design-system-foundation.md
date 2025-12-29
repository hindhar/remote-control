# Plan 01: Design System Foundation

**Focus**: Establishing the core design tokens, color palette, typography scale, spacing system, shadows, and border radii that define the Apple-quality aesthetic.

## Key Decisions

1. **Typography System**: Use Inter font family as the primary typeface (closest open-source alternative to SF Pro) with precise optical sizing and tracking adjustments to match Apple's typographic feel.

2. **Color Architecture**: Implement a semantic color system with vibrancy layers for glass morphism, using HSL with alpha channels for consistent translucency effects.

3. **Spacing Grid**: Adopt an 8px base unit grid system with a Fibonacci-inspired scale for natural visual rhythm (4, 8, 12, 16, 24, 32, 48, 64, 96).

4. **Elevation System**: Create depth through subtle multi-layered shadows with colored ambient light, mimicking Apple's material design language.

## Implementation Steps

### Step 1: Install and Configure Fonts

```bash
npm install @fontsource/inter
```

Create font configuration in `src/styles/fonts.ts`:

```typescript
// src/styles/fonts.ts
export const fontConfig = {
  sans: {
    family: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  mono: {
    family: '"SF Mono", "Fira Code", "Monaco", monospace',
    weights: {
      regular: 400,
      medium: 500,
    },
  },
};

// Apple-inspired type scale with optical sizing
export const typeScale = {
  'display-large': {
    fontSize: '56px',
    lineHeight: '64px',
    letterSpacing: '-0.02em',
    fontWeight: 700,
  },
  'display': {
    fontSize: '40px',
    lineHeight: '48px',
    letterSpacing: '-0.015em',
    fontWeight: 600,
  },
  'headline': {
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
  'body': {
    fontSize: '15px',
    lineHeight: '22px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  'callout': {
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  'subheadline': {
    fontSize: '13px',
    lineHeight: '18px',
    letterSpacing: '0',
    fontWeight: 400,
  },
  'footnote': {
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
};
```

### Step 2: Create Design Tokens

Create `src/styles/tokens.ts`:

```typescript
// src/styles/tokens.ts

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

// Border radii following Apple's curve system
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
  // iOS-specific continuous corner radii
  button: '12px',
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
  'glass': `
    0 4px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  'glass-hover': `
    0 8px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15)
  `,

  // Glow effects for active states
  'glow-blue': `0 0 20px rgba(59, 130, 246, 0.5)`,
  'glow-green': `0 0 20px rgba(34, 197, 94, 0.5)`,
  'glow-red': `0 0 20px rgba(239, 68, 68, 0.5)`,
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
```

### Step 3: Create Color System

Create `src/styles/colors.ts`:

```typescript
// src/styles/colors.ts

// Base color palette with HSL for easy manipulation
const palette = {
  // Neutrals (Apple-inspired grays)
  gray: {
    50: 'hsl(0, 0%, 98%)',
    100: 'hsl(0, 0%, 96%)',
    150: 'hsl(0, 0%, 93%)',
    200: 'hsl(0, 0%, 88%)',
    250: 'hsl(0, 0%, 82%)',
    300: 'hsl(0, 0%, 75%)',
    350: 'hsl(0, 0%, 65%)',
    400: 'hsl(0, 0%, 55%)',
    450: 'hsl(0, 0%, 45%)',
    500: 'hsl(0, 0%, 38%)',
    550: 'hsl(0, 0%, 32%)',
    600: 'hsl(0, 0%, 26%)',
    650: 'hsl(0, 0%, 22%)',
    700: 'hsl(0, 0%, 18%)',
    750: 'hsl(0, 0%, 15%)',
    800: 'hsl(0, 0%, 12%)',
    850: 'hsl(0, 0%, 10%)',
    900: 'hsl(0, 0%, 8%)',
    950: 'hsl(0, 0%, 5%)',
  },

  // Accent colors (iOS system colors)
  blue: {
    light: 'hsl(211, 100%, 50%)',
    dark: 'hsl(211, 100%, 60%)',
  },
  green: {
    light: 'hsl(142, 76%, 36%)',
    dark: 'hsl(142, 69%, 58%)',
  },
  red: {
    light: 'hsl(0, 100%, 59%)',
    dark: 'hsl(0, 100%, 67%)',
  },
  orange: {
    light: 'hsl(28, 100%, 50%)',
    dark: 'hsl(28, 100%, 60%)',
  },
  yellow: {
    light: 'hsl(45, 100%, 51%)',
    dark: 'hsl(45, 100%, 60%)',
  },
  purple: {
    light: 'hsl(280, 100%, 60%)',
    dark: 'hsl(280, 100%, 70%)',
  },
  pink: {
    light: 'hsl(340, 82%, 52%)',
    dark: 'hsl(340, 90%, 63%)',
  },
  teal: {
    light: 'hsl(175, 82%, 36%)',
    dark: 'hsl(175, 70%, 52%)',
  },
  indigo: {
    light: 'hsl(234, 89%, 63%)',
    dark: 'hsl(234, 100%, 72%)',
  },
};

// Semantic color tokens
export const colors = {
  // Dark theme (default for this app)
  dark: {
    // Backgrounds
    background: {
      primary: palette.gray[950],
      secondary: palette.gray[900],
      tertiary: palette.gray[850],
      elevated: palette.gray[800],
      grouped: palette.gray[900],
    },

    // Surfaces with translucency
    surface: {
      // Glass surfaces
      glass: {
        background: 'hsla(0, 0%, 12%, 0.72)',
        backgroundHover: 'hsla(0, 0%, 15%, 0.78)',
        border: 'hsla(0, 0%, 100%, 0.08)',
        borderHover: 'hsla(0, 0%, 100%, 0.12)',
      },
      // Solid surfaces
      solid: {
        primary: palette.gray[800],
        secondary: palette.gray[750],
        tertiary: palette.gray[700],
      },
    },

    // Text colors
    text: {
      primary: 'hsla(0, 0%, 100%, 0.92)',
      secondary: 'hsla(0, 0%, 100%, 0.65)',
      tertiary: 'hsla(0, 0%, 100%, 0.45)',
      quaternary: 'hsla(0, 0%, 100%, 0.25)',
      inverted: palette.gray[950],
    },

    // Separators
    separator: {
      opaque: palette.gray[700],
      translucent: 'hsla(0, 0%, 100%, 0.08)',
    },

    // Fill colors (for controls)
    fill: {
      primary: 'hsla(0, 0%, 100%, 0.12)',
      secondary: 'hsla(0, 0%, 100%, 0.08)',
      tertiary: 'hsla(0, 0%, 100%, 0.05)',
      quaternary: 'hsla(0, 0%, 100%, 0.03)',
    },

    // Accent colors
    accent: {
      blue: palette.blue.dark,
      green: palette.green.dark,
      red: palette.red.dark,
      orange: palette.orange.dark,
      yellow: palette.yellow.dark,
      purple: palette.purple.dark,
      pink: palette.pink.dark,
      teal: palette.teal.dark,
      indigo: palette.indigo.dark,
    },

    // Semantic colors
    semantic: {
      success: palette.green.dark,
      warning: palette.orange.dark,
      error: palette.red.dark,
      info: palette.blue.dark,
    },
  },

  // Light theme
  light: {
    background: {
      primary: palette.gray[50],
      secondary: palette.gray[100],
      tertiary: palette.gray[150],
      elevated: 'hsl(0, 0%, 100%)',
      grouped: palette.gray[100],
    },

    surface: {
      glass: {
        background: 'hsla(0, 0%, 100%, 0.72)',
        backgroundHover: 'hsla(0, 0%, 100%, 0.82)',
        border: 'hsla(0, 0%, 0%, 0.06)',
        borderHover: 'hsla(0, 0%, 0%, 0.1)',
      },
      solid: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: palette.gray[100],
        tertiary: palette.gray[150],
      },
    },

    text: {
      primary: 'hsla(0, 0%, 0%, 0.85)',
      secondary: 'hsla(0, 0%, 0%, 0.55)',
      tertiary: 'hsla(0, 0%, 0%, 0.35)',
      quaternary: 'hsla(0, 0%, 0%, 0.18)',
      inverted: palette.gray[50],
    },

    separator: {
      opaque: palette.gray[200],
      translucent: 'hsla(0, 0%, 0%, 0.06)',
    },

    fill: {
      primary: 'hsla(0, 0%, 0%, 0.08)',
      secondary: 'hsla(0, 0%, 0%, 0.05)',
      tertiary: 'hsla(0, 0%, 0%, 0.03)',
      quaternary: 'hsla(0, 0%, 0%, 0.02)',
    },

    accent: {
      blue: palette.blue.light,
      green: palette.green.light,
      red: palette.red.light,
      orange: palette.orange.light,
      yellow: palette.yellow.light,
      purple: palette.purple.light,
      pink: palette.pink.light,
      teal: palette.teal.light,
      indigo: palette.indigo.light,
    },

    semantic: {
      success: palette.green.light,
      warning: palette.orange.light,
      error: palette.red.light,
      info: palette.blue.light,
    },
  },
};

// App-specific colors
export const appColors = {
  // Tab bar
  tabBar: {
    background: 'hsla(0, 0%, 8%, 0.85)',
    border: 'hsla(0, 0%, 100%, 0.06)',
    iconActive: palette.blue.dark,
    iconInactive: 'hsla(0, 0%, 100%, 0.45)',
  },

  // Remote button states
  button: {
    default: 'hsla(0, 0%, 100%, 0.08)',
    hover: 'hsla(0, 0%, 100%, 0.12)',
    active: 'hsla(0, 0%, 100%, 0.06)',
    primary: palette.blue.dark,
    primaryHover: 'hsl(211, 100%, 65%)',
    danger: palette.red.dark,
    dangerHover: 'hsl(0, 100%, 72%)',
    success: palette.green.dark,
  },

  // Connection states
  connection: {
    connected: palette.green.dark,
    connecting: palette.orange.dark,
    disconnected: palette.red.dark,
    offline: palette.gray[500],
  },

  // Device indicators
  device: {
    tv: palette.blue.dark,
    chromecast: palette.orange.dark,
    ps5: palette.indigo.dark,
  },
};
```

### Step 4: Create CSS Custom Properties

Create `src/styles/globals.css`:

```css
@import "tailwindcss";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";

/* ============================================================================
   Apple-Quality Design System - CSS Custom Properties
   ============================================================================ */

:root {
  /* Font families */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Monaco", monospace;

  /* Spacing scale (8px base) */
  --space-0: 0px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-2-5: 10px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-14: 56px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Border radii */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-3xl: 32px;
  --radius-4xl: 40px;
  --radius-full: 9999px;
  --radius-button: 12px;
  --radius-card: 20px;
  --radius-modal: 28px;

  /* Animation timing */
  --ease-spring: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-ios-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-ios-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --ease-ios-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);

  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;
  --duration-slowest: 500ms;
  --duration-button: 120ms;
  --duration-tab: 250ms;
  --duration-modal: 350ms;
  --duration-page: 400ms;

  /* Backdrop blur values */
  --blur-none: 0;
  --blur-sm: 4px;
  --blur-md: 12px;
  --blur-lg: 24px;
  --blur-xl: 40px;
  --blur-2xl: 64px;
}

/* Dark theme (default) */
:root,
[data-theme="dark"] {
  --color-bg-primary: hsl(0, 0%, 5%);
  --color-bg-secondary: hsl(0, 0%, 8%);
  --color-bg-tertiary: hsl(0, 0%, 10%);
  --color-bg-elevated: hsl(0, 0%, 12%);

  --color-surface-glass: hsla(0, 0%, 12%, 0.72);
  --color-surface-glass-hover: hsla(0, 0%, 15%, 0.78);
  --color-surface-glass-border: hsla(0, 0%, 100%, 0.08);
  --color-surface-glass-border-hover: hsla(0, 0%, 100%, 0.12);
  --color-surface-solid: hsl(0, 0%, 12%);
  --color-surface-solid-hover: hsl(0, 0%, 15%);

  --color-text-primary: hsla(0, 0%, 100%, 0.92);
  --color-text-secondary: hsla(0, 0%, 100%, 0.65);
  --color-text-tertiary: hsla(0, 0%, 100%, 0.45);
  --color-text-quaternary: hsla(0, 0%, 100%, 0.25);

  --color-separator: hsla(0, 0%, 100%, 0.08);
  --color-separator-opaque: hsl(0, 0%, 18%);

  --color-fill-primary: hsla(0, 0%, 100%, 0.12);
  --color-fill-secondary: hsla(0, 0%, 100%, 0.08);
  --color-fill-tertiary: hsla(0, 0%, 100%, 0.05);
  --color-fill-quaternary: hsla(0, 0%, 100%, 0.03);

  --color-accent-blue: hsl(211, 100%, 60%);
  --color-accent-green: hsl(142, 69%, 58%);
  --color-accent-red: hsl(0, 100%, 67%);
  --color-accent-orange: hsl(28, 100%, 60%);
  --color-accent-yellow: hsl(45, 100%, 60%);
  --color-accent-purple: hsl(280, 100%, 70%);
  --color-accent-pink: hsl(340, 90%, 63%);
  --color-accent-teal: hsl(175, 70%, 52%);
  --color-accent-indigo: hsl(234, 100%, 72%);

  /* Shadows for dark theme */
  --shadow-elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 0 rgba(0, 0, 0, 0.15);
  --shadow-elevation-2: 0 2px 4px -1px rgba(0, 0, 0, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  --shadow-elevation-3: 0 4px 6px -2px rgba(0, 0, 0, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  --shadow-elevation-4: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 20px 25px -5px rgba(0, 0, 0, 0.25);

  --shadow-button: 0 1px 2px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  --shadow-button-hover: 0 2px 4px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --shadow-button-active: 0 1px 1px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.15);

  --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --shadow-glass-hover: 0 8px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);

  --shadow-glow-blue: 0 0 20px hsla(211, 100%, 60%, 0.4);
  --shadow-glow-green: 0 0 20px hsla(142, 69%, 58%, 0.4);
  --shadow-glow-red: 0 0 20px hsla(0, 100%, 67%, 0.4);
}

/* Light theme */
[data-theme="light"] {
  --color-bg-primary: hsl(0, 0%, 98%);
  --color-bg-secondary: hsl(0, 0%, 96%);
  --color-bg-tertiary: hsl(0, 0%, 93%);
  --color-bg-elevated: hsl(0, 0%, 100%);

  --color-surface-glass: hsla(0, 0%, 100%, 0.72);
  --color-surface-glass-hover: hsla(0, 0%, 100%, 0.82);
  --color-surface-glass-border: hsla(0, 0%, 0%, 0.06);
  --color-surface-glass-border-hover: hsla(0, 0%, 0%, 0.1);
  --color-surface-solid: hsl(0, 0%, 100%);
  --color-surface-solid-hover: hsl(0, 0%, 96%);

  --color-text-primary: hsla(0, 0%, 0%, 0.85);
  --color-text-secondary: hsla(0, 0%, 0%, 0.55);
  --color-text-tertiary: hsla(0, 0%, 0%, 0.35);
  --color-text-quaternary: hsla(0, 0%, 0%, 0.18);

  --color-separator: hsla(0, 0%, 0%, 0.06);
  --color-separator-opaque: hsl(0, 0%, 88%);

  --color-fill-primary: hsla(0, 0%, 0%, 0.08);
  --color-fill-secondary: hsla(0, 0%, 0%, 0.05);
  --color-fill-tertiary: hsla(0, 0%, 0%, 0.03);
  --color-fill-quaternary: hsla(0, 0%, 0%, 0.02);

  --color-accent-blue: hsl(211, 100%, 50%);
  --color-accent-green: hsl(142, 76%, 36%);
  --color-accent-red: hsl(0, 100%, 59%);
  --color-accent-orange: hsl(28, 100%, 50%);
  --color-accent-yellow: hsl(45, 100%, 51%);
  --color-accent-purple: hsl(280, 100%, 60%);
  --color-accent-pink: hsl(340, 82%, 52%);
  --color-accent-teal: hsl(175, 82%, 36%);
  --color-accent-indigo: hsl(234, 89%, 63%);

  --shadow-elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-elevation-2: 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-elevation-3: 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-elevation-4: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  --shadow-button: 0 1px 2px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-button-hover: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-button-active: 0 1px 1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05);

  --shadow-glass: 0 4px 30px rgba(0, 0, 0, 0.08);
  --shadow-glass-hover: 0 8px 40px rgba(0, 0, 0, 0.12);

  --shadow-glow-blue: 0 0 20px hsla(211, 100%, 50%, 0.3);
  --shadow-glow-green: 0 0 20px hsla(142, 76%, 36%, 0.3);
  --shadow-glow-red: 0 0 20px hsla(0, 100%, 59%, 0.3);
}

/* Base styles */
html {
  font-family: var(--font-sans);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.5;
  min-height: 100vh;
  min-height: 100dvh;
}

/* Selection styling */
::selection {
  background-color: var(--color-accent-blue);
  color: white;
}

/* Focus visible styling */
:focus-visible {
  outline: 2px solid var(--color-accent-blue);
  outline-offset: 2px;
}

/* Scrollbar styling for webkit */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--color-fill-secondary);
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  background-clip: padding-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-fill-primary);
}
```

## Integration Points

- **Files to create**:
  - `/src/styles/tokens.ts` - Design token definitions
  - `/src/styles/colors.ts` - Color system
  - `/src/styles/fonts.ts` - Typography configuration
  - `/src/styles/globals.css` - CSS custom properties and base styles

- **Files to modify**:
  - `/src/app/globals.css` - Replace with new design system globals
  - `/src/app/layout.tsx` - Add font imports and theme provider

- **Integration with existing code**:
  - All existing Tailwind classes will gradually migrate to use CSS custom properties
  - Existing color values (`bg-zinc-800`, `text-zinc-400`) will be replaced with semantic tokens

## Technical Specifications

- **Font Loading**: Use `@fontsource/inter` for self-hosted fonts, eliminating FOUT
- **Color Format**: HSL with alpha for easy manipulation and transparency
- **CSS Custom Properties**: Enable runtime theme switching without CSS rebuild
- **Tailwind Integration**: Extend Tailwind config to use design tokens

## Dependencies

```json
{
  "dependencies": {
    "@fontsource/inter": "^5.0.0"
  }
}
```

## Success Criteria

1. Typography renders with Apple-like optical sizing and letter-spacing
2. Color transitions are smooth and maintain accessibility contrast ratios (WCAG AA minimum)
3. Spacing follows the 8px grid consistently throughout the application
4. Shadows create realistic depth perception without appearing heavy
5. Theme switching (dark/light) works without page reload
6. All design tokens are accessible via CSS custom properties and TypeScript

## Estimated Effort

**Time**: 4-6 hours
**Complexity**: Medium
**Risk**: Low

## Dependencies

- Must be completed before any component refactoring
- Required for glass morphism implementation (Plan 10)
- Required for animation system (Plan 3)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Font loading delays causing FOUT | Medium | Use font-display: swap and preload critical weights |
| Color contrast failing accessibility | High | Test all color combinations against WCAG AA standards |
| CSS custom properties browser support | Low | Modern browsers fully support; fallback values included |
| Design token drift from implementation | Medium | Generate TypeScript types from tokens for compile-time checking |
