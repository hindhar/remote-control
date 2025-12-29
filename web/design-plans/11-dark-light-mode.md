# Plan 11: Dark/Light Mode System

**Focus**: Comprehensive theming system with smooth transitions, system preference detection, and Apple-style adaptive interfaces.

---

## Key Decisions

1. **Dark Mode First**: Design for dark mode as primary (TV remote use case), with light mode as alternative
2. **System Preference Sync**: Automatically detect and respect OS-level dark/light preference
3. **Smooth Transitions**: Animated color transitions between modes (no jarring flashes)
4. **Semantic Colors**: Use semantic naming (background, foreground, muted) rather than literal colors
5. **Per-Component Adaptation**: Some components need different structures, not just color swaps

---

## Implementation Steps

### Step 1: Theme Token System

```typescript
// src/design-system/tokens/themes.ts

export interface ThemeColors {
  // Backgrounds
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    grouped: string;
  };

  // Foregrounds
  foreground: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };

  // Fills
  fill: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
  };

  // Separators
  separator: {
    opaque: string;
    nonOpaque: string;
  };

  // System Colors
  system: {
    blue: string;
    green: string;
    indigo: string;
    orange: string;
    pink: string;
    purple: string;
    red: string;
    teal: string;
    yellow: string;
  };

  // Material
  material: {
    ultraThin: string;
    thin: string;
    regular: string;
    thick: string;
    ultraThick: string;
  };
}

export const darkTheme: ThemeColors = {
  background: {
    primary: 'hsl(0, 0%, 0%)',
    secondary: 'hsl(0, 0%, 7%)',
    tertiary: 'hsl(0, 0%, 11%)',
    elevated: 'hsl(0, 0%, 14%)',
    grouped: 'hsl(0, 0%, 0%)',
  },
  foreground: {
    primary: 'hsl(0, 0%, 100%)',
    secondary: 'hsla(0, 0%, 100%, 0.6)',
    tertiary: 'hsla(0, 0%, 100%, 0.4)',
    quaternary: 'hsla(0, 0%, 100%, 0.18)',
  },
  fill: {
    primary: 'hsla(0, 0%, 100%, 0.18)',
    secondary: 'hsla(0, 0%, 100%, 0.12)',
    tertiary: 'hsla(0, 0%, 100%, 0.08)',
    quaternary: 'hsla(0, 0%, 100%, 0.04)',
  },
  separator: {
    opaque: 'hsl(0, 0%, 24%)',
    nonOpaque: 'hsla(0, 0%, 100%, 0.15)',
  },
  system: {
    blue: 'hsl(211, 100%, 50%)',
    green: 'hsl(142, 70%, 45%)',
    indigo: 'hsl(240, 60%, 60%)',
    orange: 'hsl(30, 100%, 50%)',
    pink: 'hsl(340, 80%, 60%)',
    purple: 'hsl(280, 60%, 55%)',
    red: 'hsl(0, 85%, 60%)',
    teal: 'hsl(175, 70%, 45%)',
    yellow: 'hsl(48, 100%, 50%)',
  },
  material: {
    ultraThin: 'hsla(0, 0%, 0%, 0.3)',
    thin: 'hsla(0, 0%, 0%, 0.45)',
    regular: 'hsla(0, 0%, 0%, 0.6)',
    thick: 'hsla(0, 0%, 0%, 0.75)',
    ultraThick: 'hsla(0, 0%, 0%, 0.9)',
  },
};

export const lightTheme: ThemeColors = {
  background: {
    primary: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(240, 6%, 97%)',
    tertiary: 'hsl(0, 0%, 100%)',
    elevated: 'hsl(0, 0%, 100%)',
    grouped: 'hsl(240, 6%, 97%)',
  },
  foreground: {
    primary: 'hsl(0, 0%, 0%)',
    secondary: 'hsla(0, 0%, 0%, 0.5)',
    tertiary: 'hsla(0, 0%, 0%, 0.3)',
    quaternary: 'hsla(0, 0%, 0%, 0.18)',
  },
  fill: {
    primary: 'hsla(0, 0%, 0%, 0.12)',
    secondary: 'hsla(0, 0%, 0%, 0.08)',
    tertiary: 'hsla(0, 0%, 0%, 0.04)',
    quaternary: 'hsla(0, 0%, 0%, 0.02)',
  },
  separator: {
    opaque: 'hsl(0, 0%, 84%)',
    nonOpaque: 'hsla(0, 0%, 0%, 0.15)',
  },
  system: {
    blue: 'hsl(211, 100%, 50%)',
    green: 'hsl(142, 70%, 40%)',
    indigo: 'hsl(240, 60%, 55%)',
    orange: 'hsl(30, 100%, 45%)',
    pink: 'hsl(340, 80%, 55%)',
    purple: 'hsl(280, 60%, 50%)',
    red: 'hsl(0, 85%, 55%)',
    teal: 'hsl(175, 70%, 40%)',
    yellow: 'hsl(48, 100%, 45%)',
  },
  material: {
    ultraThin: 'hsla(0, 0%, 100%, 0.3)',
    thin: 'hsla(0, 0%, 100%, 0.45)',
    regular: 'hsla(0, 0%, 100%, 0.6)',
    thick: 'hsla(0, 0%, 100%, 0.75)',
    ultraThick: 'hsla(0, 0%, 100%, 0.9)',
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';
```

### Step 2: CSS Custom Properties

```css
/* src/app/globals.css */

:root {
  /* Transition timing for theme changes */
  --theme-transition-duration: 300ms;
  --theme-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Color scheme */
  color-scheme: dark light;
}

/* Dark theme (default) */
:root,
[data-theme="dark"] {
  /* Backgrounds */
  --color-bg-primary: hsl(0, 0%, 0%);
  --color-bg-secondary: hsl(0, 0%, 7%);
  --color-bg-tertiary: hsl(0, 0%, 11%);
  --color-bg-elevated: hsl(0, 0%, 14%);
  --color-bg-grouped: hsl(0, 0%, 0%);

  /* Foregrounds */
  --color-fg-primary: hsl(0, 0%, 100%);
  --color-fg-secondary: hsla(0, 0%, 100%, 0.6);
  --color-fg-tertiary: hsla(0, 0%, 100%, 0.4);
  --color-fg-quaternary: hsla(0, 0%, 100%, 0.18);

  /* Fills */
  --color-fill-primary: hsla(0, 0%, 100%, 0.18);
  --color-fill-secondary: hsla(0, 0%, 100%, 0.12);
  --color-fill-tertiary: hsla(0, 0%, 100%, 0.08);
  --color-fill-quaternary: hsla(0, 0%, 100%, 0.04);

  /* Separators */
  --color-separator-opaque: hsl(0, 0%, 24%);
  --color-separator: hsla(0, 0%, 100%, 0.15);

  /* System colors */
  --color-blue: hsl(211, 100%, 50%);
  --color-green: hsl(142, 70%, 45%);
  --color-indigo: hsl(240, 60%, 60%);
  --color-orange: hsl(30, 100%, 50%);
  --color-pink: hsl(340, 80%, 60%);
  --color-purple: hsl(280, 60%, 55%);
  --color-red: hsl(0, 85%, 60%);
  --color-teal: hsl(175, 70%, 45%);
  --color-yellow: hsl(48, 100%, 50%);

  /* Glass materials */
  --material-ultra-thin: hsla(0, 0%, 0%, 0.3);
  --material-thin: hsla(0, 0%, 0%, 0.45);
  --material-regular: hsla(0, 0%, 0%, 0.6);
  --material-thick: hsla(0, 0%, 0%, 0.75);
  --material-ultra-thick: hsla(0, 0%, 0%, 0.9);

  /* Shadows - more prominent in dark mode */
  --shadow-sm: 0 1px 2px hsla(0, 0%, 0%, 0.5);
  --shadow-md: 0 4px 8px hsla(0, 0%, 0%, 0.5);
  --shadow-lg: 0 8px 24px hsla(0, 0%, 0%, 0.6);
  --shadow-xl: 0 16px 48px hsla(0, 0%, 0%, 0.7);

  /* Focus rings */
  --focus-ring: 0 0 0 3px hsla(211, 100%, 50%, 0.4);
}

/* Light theme */
[data-theme="light"] {
  /* Backgrounds */
  --color-bg-primary: hsl(0, 0%, 100%);
  --color-bg-secondary: hsl(240, 6%, 97%);
  --color-bg-tertiary: hsl(0, 0%, 100%);
  --color-bg-elevated: hsl(0, 0%, 100%);
  --color-bg-grouped: hsl(240, 6%, 97%);

  /* Foregrounds */
  --color-fg-primary: hsl(0, 0%, 0%);
  --color-fg-secondary: hsla(0, 0%, 0%, 0.5);
  --color-fg-tertiary: hsla(0, 0%, 0%, 0.3);
  --color-fg-quaternary: hsla(0, 0%, 0%, 0.18);

  /* Fills */
  --color-fill-primary: hsla(0, 0%, 0%, 0.12);
  --color-fill-secondary: hsla(0, 0%, 0%, 0.08);
  --color-fill-tertiary: hsla(0, 0%, 0%, 0.04);
  --color-fill-quaternary: hsla(0, 0%, 0%, 0.02);

  /* Separators */
  --color-separator-opaque: hsl(0, 0%, 84%);
  --color-separator: hsla(0, 0%, 0%, 0.15);

  /* System colors - slightly adjusted for light backgrounds */
  --color-blue: hsl(211, 100%, 50%);
  --color-green: hsl(142, 70%, 40%);
  --color-indigo: hsl(240, 60%, 55%);
  --color-orange: hsl(30, 100%, 45%);
  --color-pink: hsl(340, 80%, 55%);
  --color-purple: hsl(280, 60%, 50%);
  --color-red: hsl(0, 85%, 55%);
  --color-teal: hsl(175, 70%, 40%);
  --color-yellow: hsl(48, 100%, 45%);

  /* Glass materials - inverted for light mode */
  --material-ultra-thin: hsla(0, 0%, 100%, 0.3);
  --material-thin: hsla(0, 0%, 100%, 0.45);
  --material-regular: hsla(0, 0%, 100%, 0.6);
  --material-thick: hsla(0, 0%, 100%, 0.75);
  --material-ultra-thick: hsla(0, 0%, 100%, 0.9);

  /* Shadows - subtler in light mode */
  --shadow-sm: 0 1px 2px hsla(0, 0%, 0%, 0.05);
  --shadow-md: 0 4px 8px hsla(0, 0%, 0%, 0.1);
  --shadow-lg: 0 8px 24px hsla(0, 0%, 0%, 0.15);
  --shadow-xl: 0 16px 48px hsla(0, 0%, 0%, 0.2);

  /* Focus rings */
  --focus-ring: 0 0 0 3px hsla(211, 100%, 50%, 0.3);
}

/* Theme transition classes */
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition:
    background-color var(--theme-transition-duration) var(--theme-transition-timing),
    border-color var(--theme-transition-duration) var(--theme-transition-timing),
    color var(--theme-transition-duration) var(--theme-transition-timing),
    box-shadow var(--theme-transition-duration) var(--theme-transition-timing),
    opacity var(--theme-transition-duration) var(--theme-transition-timing) !important;
}

/* Disable transitions during initial load to prevent flash */
.no-transitions,
.no-transitions *,
.no-transitions *::before,
.no-transitions *::after {
  transition: none !important;
}
```

### Step 3: Theme Provider with System Detection

```typescript
// src/providers/ThemeProvider.tsx

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'tv-remote-theme-preference';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(defaultTheme);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const stored = getStoredPreference();
    setPreferenceState(stored);
    setIsHydrated(true);
  }, []);

  // Calculate effective theme
  useEffect(() => {
    const effectiveTheme =
      preference === 'system' ? getSystemTheme() : preference;
    setTheme(effectiveTheme);

    // Apply to document
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // Enable transitions after initial render
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
      document.documentElement.classList.add('theme-transition');
    }, 100);
  }, [preference]);

  // Listen for system theme changes
  useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
      document.documentElement.setAttribute(
        'data-theme',
        e.matches ? 'dark' : 'light'
      );
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const setPreference = useCallback((newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
    localStorage.setItem(STORAGE_KEY, newPreference);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setPreference(newTheme);
  }, [theme, setPreference]);

  // Prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="no-transitions" style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        preference,
        setPreference,
        toggleTheme,
        isSystemTheme: preference === 'system',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### Step 4: Theme Toggle Component

```typescript
// src/components/molecules/ThemeToggle.tsx

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'switch' | 'segmented';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = 'icon',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, preference, setPreference, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full',
          'bg-[var(--color-fill-secondary)] hover:bg-[var(--color-fill-primary)]',
          'transition-colors duration-200',
          className
        )}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 text-[var(--color-fg-primary)]" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 text-[var(--color-fg-primary)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative h-8 w-14 rounded-full p-1',
          'bg-[var(--color-fill-secondary)]',
          'transition-colors duration-200',
          className
        )}
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label="Toggle theme"
      >
        <motion.div
          className={cn(
            'absolute top-1 flex h-6 w-6 items-center justify-center rounded-full',
            'bg-[var(--color-fg-primary)]'
          )}
          animate={{
            x: theme === 'dark' ? 24 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
        >
          {theme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-[var(--color-bg-primary)]" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-[var(--color-bg-primary)]" />
          )}
        </motion.div>
      </button>
    );
  }

  // Segmented control
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'Auto' },
  ] as const;

  return (
    <div
      className={cn(
        'flex rounded-xl bg-[var(--color-fill-tertiary)] p-1',
        className
      )}
      role="radiogroup"
      aria-label="Theme preference"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            onClick={() => setPreference(option.value)}
            className="relative flex items-center gap-2 px-4 py-2"
            role="radio"
            aria-checked={isActive}
          >
            {isActive && (
              <motion.div
                layoutId="themeIndicator"
                className="absolute inset-0 rounded-lg bg-[var(--color-fill-primary)]"
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 h-4 w-4 transition-colors',
                isActive
                  ? 'text-[var(--color-fg-primary)]'
                  : 'text-[var(--color-fg-tertiary)]'
              )}
            />
            {showLabel && (
              <span
                className={cn(
                  'relative z-10 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-fg-primary)]'
                    : 'text-[var(--color-fg-tertiary)]'
                )}
              >
                {option.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

### Step 5: Theme-Aware Utility Hook

```typescript
// src/hooks/useThemeValue.ts

'use client';

import { useTheme } from '@/providers/ThemeProvider';

/**
 * Returns different values based on current theme
 */
export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const { theme } = useTheme();
  return theme === 'dark' ? darkValue : lightValue;
}

/**
 * Returns theme-specific class names
 */
export function useThemeClasses(
  lightClasses: string,
  darkClasses: string
): string {
  const { theme } = useTheme();
  return theme === 'dark' ? darkClasses : lightClasses;
}

/**
 * Returns an object with both theme values for conditional rendering
 */
export function useThemeStyles<T extends Record<string, unknown>>(
  lightStyles: T,
  darkStyles: T
): T {
  const { theme } = useTheme();
  return theme === 'dark' ? darkStyles : lightStyles;
}
```

### Step 6: Adaptive Color Components

```typescript
// src/components/atoms/AdaptiveText.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

interface AdaptiveTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  className?: string;
}

const variantClasses: Record<TextVariant, string> = {
  primary: 'text-[var(--color-fg-primary)]',
  secondary: 'text-[var(--color-fg-secondary)]',
  tertiary: 'text-[var(--color-fg-tertiary)]',
  quaternary: 'text-[var(--color-fg-quaternary)]',
};

export function AdaptiveText({
  children,
  variant = 'primary',
  as: Component = 'span',
  className,
}: AdaptiveTextProps) {
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
```

```typescript
// src/components/atoms/AdaptiveBackground.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BackgroundVariant = 'primary' | 'secondary' | 'tertiary' | 'elevated' | 'grouped';

interface AdaptiveBackgroundProps {
  children: React.ReactNode;
  variant?: BackgroundVariant;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const variantClasses: Record<BackgroundVariant, string> = {
  primary: 'bg-[var(--color-bg-primary)]',
  secondary: 'bg-[var(--color-bg-secondary)]',
  tertiary: 'bg-[var(--color-bg-tertiary)]',
  elevated: 'bg-[var(--color-bg-elevated)]',
  grouped: 'bg-[var(--color-bg-grouped)]',
};

export function AdaptiveBackground({
  children,
  variant = 'primary',
  as: Component = 'div',
  className,
}: AdaptiveBackgroundProps) {
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
```

### Step 7: Tailwind Theme Configuration

```typescript
// tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic color mappings
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          grouped: 'var(--color-bg-grouped)',
        },
        foreground: {
          primary: 'var(--color-fg-primary)',
          secondary: 'var(--color-fg-secondary)',
          tertiary: 'var(--color-fg-tertiary)',
          quaternary: 'var(--color-fg-quaternary)',
        },
        fill: {
          primary: 'var(--color-fill-primary)',
          secondary: 'var(--color-fill-secondary)',
          tertiary: 'var(--color-fill-tertiary)',
          quaternary: 'var(--color-fill-quaternary)',
        },
        separator: {
          DEFAULT: 'var(--color-separator)',
          opaque: 'var(--color-separator-opaque)',
        },
        // System colors
        system: {
          blue: 'var(--color-blue)',
          green: 'var(--color-green)',
          indigo: 'var(--color-indigo)',
          orange: 'var(--color-orange)',
          pink: 'var(--color-pink)',
          purple: 'var(--color-purple)',
          red: 'var(--color-red)',
          teal: 'var(--color-teal)',
          yellow: 'var(--color-yellow)',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--focus-ring)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Step 8: Prevent Flash of Wrong Theme

```typescript
// src/app/layout.tsx

import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'TV Remote Control',
  description: 'Control your Samsung TV, Chromecast, and PS5',
};

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var preference = localStorage.getItem('tv-remote-theme-preference');
      var theme = preference;

      if (preference === 'system' || !preference) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.add('no-transitions');
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 9: Theme-Aware Images and Icons

```typescript
// src/components/atoms/ThemedImage.tsx

'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { useTheme } from '@/providers/ThemeProvider';

interface ThemedImageProps extends Omit<ImageProps, 'src'> {
  lightSrc: string;
  darkSrc: string;
}

export function ThemedImage({
  lightSrc,
  darkSrc,
  alt,
  ...props
}: ThemedImageProps) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? darkSrc : lightSrc;

  return <Image src={src} alt={alt} {...props} />;
}
```

```typescript
// src/components/atoms/ThemedIcon.tsx

'use client';

import React from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemedIconProps {
  icon: React.ComponentType<{ className?: string }>;
  lightClassName?: string;
  darkClassName?: string;
  className?: string;
}

export function ThemedIcon({
  icon: Icon,
  lightClassName,
  darkClassName,
  className,
}: ThemedIconProps) {
  const { theme } = useTheme();
  const themeClass = theme === 'dark' ? darkClassName : lightClassName;

  return <Icon className={cn(className, themeClass)} />;
}
```

---

## Integration Points

### Files to Create
- `src/design-system/tokens/themes.ts` - Theme color tokens
- `src/providers/ThemeProvider.tsx` - React context for theme state
- `src/components/molecules/ThemeToggle.tsx` - UI for changing themes
- `src/hooks/useThemeValue.ts` - Utility hooks for theme-conditional values
- `src/components/atoms/AdaptiveText.tsx` - Theme-aware text component
- `src/components/atoms/AdaptiveBackground.tsx` - Theme-aware background
- `src/components/atoms/ThemedImage.tsx` - Theme-specific images
- `src/components/atoms/ThemedIcon.tsx` - Theme-specific icon styling

### Files to Modify
- `src/app/globals.css` - Add CSS custom properties for themes
- `src/app/layout.tsx` - Add ThemeProvider and flash prevention script
- `tailwind.config.ts` - Add semantic color mappings
- All existing components - Replace hardcoded colors with CSS variables

### Provider Hierarchy
```
RootLayout
  |
  +-- ThemeProvider
        |
        +-- App Components
```

---

## Technical Specifications

### Color Contrast Requirements
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary text | 7:1 on bg-primary | 7:1 on bg-primary |
| Secondary text | 4.5:1 on bg-primary | 4.5:1 on bg-primary |
| Interactive elements | 3:1 minimum | 3:1 minimum |
| Focus indicators | Visible on all backgrounds | Visible on all backgrounds |

### Performance Considerations
- Inline script prevents layout shift from wrong theme
- CSS transitions only applied after hydration
- Local storage access wrapped in try/catch for private browsing
- Theme detection runs once on mount, not on every render

### Persistence
- Theme preference stored in `localStorage` under `tv-remote-theme-preference`
- Values: `'light'`, `'dark'`, or `'system'`
- Defaults to `'system'` if not set

---

## Dependencies

### Required
- None (uses native browser APIs)

### Optional
- `framer-motion` - For animated theme toggle

---

## Success Criteria

1. **No Flash**: Theme loads correctly before first paint
2. **System Sync**: Automatically follows OS dark/light preference
3. **Smooth Transitions**: 300ms animated transitions between themes
4. **Persistence**: User preference survives page reload
5. **Accessibility**: All text maintains WCAG AA contrast in both modes
6. **SSR Compatible**: Works with Next.js server-side rendering

---

## Estimated Effort

- **Token System**: 1 hour
- **CSS Custom Properties**: 2 hours
- **Theme Provider**: 3 hours
- **Toggle Components**: 2 hours
- **Utility Hooks**: 1 hour
- **Integration with Existing Components**: 4 hours
- **Testing Both Modes**: 2 hours
- **Total**: 15 hours (2 days)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Flash of wrong theme | High | Inline script before React hydration |
| Hydration mismatch | Medium | Suppress hydration warning, defer theme until mounted |
| localStorage not available | Low | Fallback to system preference |
| CSS variable not supported | Very Low | Modern browsers only; graceful degradation |
| Transition performance | Low | Use will-change sparingly, limit transition properties |
