// ============================================================================
// Apple-Quality Design System - Color System
// ============================================================================

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
        background: 'hsla(0, 0%, 14%, 0.75)',
        backgroundHover: 'hsla(0, 0%, 18%, 0.8)',
        border: 'hsla(0, 0%, 100%, 0.1)',
        borderHover: 'hsla(0, 0%, 100%, 0.15)',
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
      primary: 'hsla(0, 0%, 100%, 0.95)',
      secondary: 'hsla(0, 0%, 100%, 0.7)',
      tertiary: 'hsla(0, 0%, 100%, 0.5)',
      quaternary: 'hsla(0, 0%, 100%, 0.3)',
      inverted: palette.gray[950],
    },

    // Separators
    separator: {
      opaque: palette.gray[700],
      translucent: 'hsla(0, 0%, 100%, 0.1)',
    },

    // Fill colors (for controls)
    fill: {
      primary: 'hsla(0, 0%, 100%, 0.15)',
      secondary: 'hsla(0, 0%, 100%, 0.1)',
      tertiary: 'hsla(0, 0%, 100%, 0.06)',
      quaternary: 'hsla(0, 0%, 100%, 0.04)',
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
        background: 'hsla(0, 0%, 100%, 0.8)',
        backgroundHover: 'hsla(0, 0%, 100%, 0.9)',
        border: 'hsla(0, 0%, 0%, 0.08)',
        borderHover: 'hsla(0, 0%, 0%, 0.12)',
      },
      solid: {
        primary: 'hsl(0, 0%, 100%)',
        secondary: palette.gray[100],
        tertiary: palette.gray[150],
      },
    },

    text: {
      primary: 'hsla(0, 0%, 0%, 0.9)',
      secondary: 'hsla(0, 0%, 0%, 0.6)',
      tertiary: 'hsla(0, 0%, 0%, 0.4)',
      quaternary: 'hsla(0, 0%, 0%, 0.2)',
      inverted: palette.gray[50],
    },

    separator: {
      opaque: palette.gray[200],
      translucent: 'hsla(0, 0%, 0%, 0.08)',
    },

    fill: {
      primary: 'hsla(0, 0%, 0%, 0.1)',
      secondary: 'hsla(0, 0%, 0%, 0.06)',
      tertiary: 'hsla(0, 0%, 0%, 0.04)',
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
    background: 'hsla(0, 0%, 8%, 0.9)',
    border: 'hsla(0, 0%, 100%, 0.08)',
    iconActive: palette.blue.dark,
    iconInactive: 'hsla(0, 0%, 100%, 0.5)',
  },

  // Remote button states
  button: {
    default: 'hsla(0, 0%, 100%, 0.1)',
    hover: 'hsla(0, 0%, 100%, 0.15)',
    active: 'hsla(0, 0%, 100%, 0.08)',
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
