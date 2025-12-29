# Plan 13: Accessibility Implementation

**Focus**: WCAG 2.1 AA compliance, VoiceOver and screen reader support, keyboard navigation, and inclusive design for all users.

---

## Key Decisions

1. **WCAG 2.1 AA Compliance**: Meet all Level A and AA success criteria
2. **Screen Reader First**: Test with VoiceOver (iOS/macOS), TalkBack (Android), NVDA (Windows)
3. **Keyboard Navigation**: Full app functionality accessible via keyboard
4. **Reduced Motion**: Respect `prefers-reduced-motion` for all animations
5. **Focus Management**: Visible, consistent focus indicators throughout

---

## Implementation Steps

### Step 1: Accessibility Context Provider

```typescript
// src/providers/AccessibilityProvider.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderActive: boolean;
  largeText: boolean;
  keyboardMode: boolean;
}

interface AccessibilityContextValue extends AccessibilitySettings {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  setLargeText: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = 'tv-remote-accessibility';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    screenReaderActive: false,
    largeText: false,
    keyboardMode: false,
  });

  // Detect system preferences
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');

    const updateFromMediaQueries = () => {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: reducedMotionQuery.matches,
        highContrast: highContrastQuery.matches,
      }));
    };

    updateFromMediaQueries();

    reducedMotionQuery.addEventListener('change', updateFromMediaQueries);
    highContrastQuery.addEventListener('change', updateFromMediaQueries);

    return () => {
      reducedMotionQuery.removeEventListener('change', updateFromMediaQueries);
      highContrastQuery.removeEventListener('change', updateFromMediaQueries);
    };
  }, []);

  // Detect keyboard vs pointer navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setSettings((prev) => ({ ...prev, keyboardMode: true }));
        document.body.classList.add('keyboard-mode');
      }
    };

    const handleMouseDown = () => {
      setSettings((prev) => ({ ...prev, keyboardMode: false }));
      document.body.classList.remove('keyboard-mode');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings((prev) => ({ ...prev, ...parsed }));
    }
  }, []);

  // Announce message for screen readers
  const announceMessage = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
    []
  );

  const setLargeText = useCallback((enabled: boolean) => {
    setSettings((prev) => {
      const updated = { ...prev, largeText: enabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ largeText: enabled }));
      return updated;
    });

    if (enabled) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        announceMessage,
        setLargeText,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
```

### Step 2: CSS Accessibility Foundations

```css
/* src/app/globals.css - Accessibility foundations */

/* Screen reader only - visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Make sr-only content focusable */
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* Skip link for keyboard navigation */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 12px 24px;
  background-color: var(--color-blue);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 16px;
}

/* Focus visible - only show focus when using keyboard */
:focus {
  outline: none;
}

.keyboard-mode :focus-visible,
:focus-visible {
  outline: 2px solid var(--color-blue);
  outline-offset: 2px;
}

/* High contrast mode enhancements */
@media (prefers-contrast: more) {
  :root {
    --color-fg-primary: hsl(0, 0%, 100%);
    --color-fg-secondary: hsl(0, 0%, 90%);
    --color-separator: hsl(0, 0%, 50%);
    --color-fill-primary: hsl(0, 0%, 30%);
  }

  .glass-surface {
    background-color: hsl(0, 0%, 10%) !important;
    border: 2px solid hsl(0, 0%, 50%) !important;
  }

  button,
  [role="button"] {
    border: 2px solid currentColor !important;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Large text mode */
.large-text {
  --font-size-xs: 0.9375rem;
  --font-size-sm: 1rem;
  --font-size-base: 1.125rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 1.75rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
}

/* Focus trap indicator */
[data-focus-trap="active"] {
  outline: 3px dashed var(--color-blue);
  outline-offset: 4px;
}

/* Touch target size enforcement */
button,
[role="button"],
a,
input,
select,
textarea,
[tabindex]:not([tabindex="-1"]) {
  min-height: 44px;
  min-width: 44px;
}

/* Ensure sufficient line height for readability */
body {
  line-height: 1.5;
}

p, li, dd {
  max-width: 75ch; /* Optimal reading width */
}
```

### Step 3: Focus Trap Hook

```typescript
// src/hooks/useFocusTrap.ts

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  returnFocusOnDeactivate?: boolean;
  initialFocus?: 'first' | 'container' | string;
}

export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, returnFocusOnDeactivate = true, initialFocus = 'first' } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => el.offsetParent !== null // Filter out hidden elements
    );
  }, []);

  const focusFirstElement = useCallback(() => {
    const focusables = getFocusableElements();

    if (initialFocus === 'first' && focusables.length > 0) {
      focusables[0].focus();
    } else if (initialFocus === 'container' && containerRef.current) {
      containerRef.current.focus();
    } else if (typeof initialFocus === 'string') {
      const target = containerRef.current?.querySelector<HTMLElement>(initialFocus);
      target?.focus();
    }
  }, [getFocusableElements, initialFocus]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store previous focus
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    focusFirstElement();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusables = getFocusableElements();
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus on deactivate
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, getFocusableElements, focusFirstElement, returnFocusOnDeactivate]);

  return containerRef;
}
```

### Step 4: Reduced Motion Hook

```typescript
// src/hooks/useReducedMotion.ts

'use client';

import { useState, useEffect } from 'react';
import { useAccessibility } from '@/providers/AccessibilityProvider';

export function useReducedMotion(): boolean {
  const { reducedMotion } = useAccessibility();
  return reducedMotion;
}

// Animation values that respect reduced motion
export function useMotionSafe<T>(
  normalValue: T,
  reducedValue: T
): T {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? reducedValue : normalValue;
}

// Spring config that respects reduced motion
export function useSpringConfig() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return {
      type: 'tween' as const,
      duration: 0.01,
    };
  }

  return {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  };
}
```

### Step 5: Accessible Button Component

```typescript
// src/components/atoms/AccessibleButton.tsx

'use client';

import React, { forwardRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'min-h-[44px] px-3 text-sm gap-1.5',
  md: 'min-h-[48px] px-4 text-base gap-2',
  lg: 'min-h-[56px] px-6 text-lg gap-2.5',
};

const variantClasses = {
  primary: 'bg-[var(--color-blue)] text-white hover:bg-[hsl(211,100%,45%)]',
  secondary: 'bg-[var(--color-fill-secondary)] text-[var(--color-fg-primary)] hover:bg-[var(--color-fill-primary)]',
  ghost: 'bg-transparent text-[var(--color-fg-secondary)] hover:bg-[var(--color-fill-tertiary)]',
  danger: 'bg-[var(--color-red)] text-white hover:bg-[hsl(0,85%,55%)]',
};

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  function AccessibleButton(
    {
      children,
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className,
      onClick,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) {
    const { announceMessage } = useAccessibility();
    const reducedMotion = useReducedMotion();

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) {
          e.preventDefault();
          return;
        }

        // Announce loading state if applicable
        if (loading) {
          announceMessage('Loading, please wait');
        }

        onClick?.(e);
      },
      [loading, disabled, onClick, announceMessage]
    );

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}

        {/* Content */}
        <span className={cn('flex items-center', loading && 'invisible')}>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
        </span>
      </motion.button>
    );
  }
);
```

### Step 6: Skip Link Component

```typescript
// src/components/atoms/SkipLink.tsx

'use client';

import React from 'react';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export function SkipLink({
  href = '#main-content',
  children = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className="skip-link"
    >
      {children}
    </a>
  );
}
```

### Step 7: Live Region Component

```typescript
// src/components/atoms/LiveRegion.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface LiveRegionProps {
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  'aria-relevant': ariaRelevant = 'additions text',
  className = 'sr-only',
}: LiveRegionProps) {
  const [message, setMessage] = useState('');

  // Global function to announce messages
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setMessage(e.detail);
      // Clear after announcement
      setTimeout(() => setMessage(''), 1000);
    };

    window.addEventListener('announce' as keyof WindowEventMap, handler as EventListener);
    return () => {
      window.removeEventListener('announce' as keyof WindowEventMap, handler as EventListener);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      className={className}
    >
      {message}
    </div>
  );
}

// Helper function to announce messages
export function announce(message: string) {
  window.dispatchEvent(new CustomEvent('announce', { detail: message }));
}
```

### Step 8: Accessible Modal

```typescript
// src/components/organisms/AccessibleModal.tsx

'use client';

import React, { useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassSurface } from '../atoms/GlassSurface';
import { AccessibleButton } from '../atoms/AccessibleButton';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: AccessibleModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reducedMotion = useReducedMotion();
  const focusTrapRef = useFocusTrap<HTMLDivElement>({
    enabled: isOpen,
    returnFocusOnDeactivate: true,
    initialFocus: 'first',
  });

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const animationProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={cn('relative w-full', sizeClasses[size])}
            {...animationProps}
          >
            <GlassSurface
              material="thick"
              border="light"
              shadow="elevated"
              className="rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[var(--color-separator)] p-4">
                <div>
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-[var(--color-fg-primary)]"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-sm text-[var(--color-fg-secondary)]"
                    >
                      {description}
                    </p>
                  )}
                </div>
                <AccessibleButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close dialog"
                  icon={<X className="h-5 w-5" />}
                />
              </div>

              {/* Content */}
              <div className="p-4">{children}</div>
            </GlassSurface>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

### Step 9: Accessible Tab Navigation

```typescript
// src/components/organisms/AccessibleTabs.tsx

'use client';

import React, { useState, useRef, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface AccessibleTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function AccessibleTabs({
  tabs,
  defaultTab,
  onTabChange,
  orientation = 'horizontal',
  className,
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const baseId = useId();
  const reducedMotion = useReducedMotion();

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
      let nextIndex: number | null = null;

      const isHorizontal = orientation === 'horizontal';

      switch (e.key) {
        case isHorizontal ? 'ArrowRight' : 'ArrowDown':
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          break;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        const nextTab = tabs[nextIndex];
        handleTabChange(nextTab.id);
        tabsRef.current.get(nextTab.id)?.focus();
      }
    },
    [tabs, activeTab, orientation, handleTabChange]
  );

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col'
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const tabId = `${baseId}-tab-${tab.id}`;
          const panelId = `${baseId}-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabsRef.current.set(tab.id, el);
              }}
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3',
                'text-sm font-medium transition-colors',
                isActive
                  ? 'text-[var(--color-blue)]'
                  : 'text-[var(--color-fg-secondary)] hover:text-[var(--color-fg-primary)]'
              )}
            >
              {tab.icon && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId={`${baseId}-indicator`}
                  className={cn(
                    'absolute bg-[var(--color-blue)]',
                    orientation === 'horizontal'
                      ? 'bottom-0 left-0 right-0 h-0.5'
                      : 'top-0 bottom-0 left-0 w-0.5'
                  )}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 500, damping: 35 }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const tabId = `${baseId}-tab-${tab.id}`;
        const panelId = `${baseId}-panel-${tab.id}`;

        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!isActive}
            tabIndex={0}
            className="mt-4 focus:outline-none"
          >
            {isActive && activeContent}
          </div>
        );
      })}
    </div>
  );
}
```

### Step 10: Accessibility Settings Panel

```typescript
// src/components/organisms/AccessibilitySettings.tsx

'use client';

import React from 'react';
import { Eye, Volume2, Zap, Type } from 'lucide-react';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { GlassCard } from '../molecules/GlassCard';
import { cn } from '@/lib/utils';

interface SettingToggleProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingToggle({
  label,
  description,
  icon,
  checked,
  onChange,
  disabled = false,
}: SettingToggleProps) {
  const id = React.useId();

  return (
    <div className="flex items-start gap-4 py-4">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-fill-secondary)]"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1">
        <label
          htmlFor={id}
          className="block text-base font-medium text-[var(--color-fg-primary)]"
        >
          {label}
        </label>
        <p className="mt-0.5 text-sm text-[var(--color-fg-secondary)]">
          {description}
        </p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative h-8 w-14 flex-shrink-0 rounded-full transition-colors',
          checked ? 'bg-[var(--color-green)]' : 'bg-[var(--color-fill-secondary)]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform',
            checked ? 'translate-x-7' : 'translate-x-1'
          )}
        />
        <span className="sr-only">{checked ? 'Enabled' : 'Disabled'}</span>
      </button>
    </div>
  );
}

export function AccessibilitySettings() {
  const { reducedMotion, highContrast, largeText, setLargeText } =
    useAccessibility();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-fg-primary)]">
        Accessibility
      </h2>

      <GlassCard className="divide-y divide-[var(--color-separator)] p-4">
        <SettingToggle
          label="Large Text"
          description="Increase text size throughout the app"
          icon={<Type className="h-5 w-5 text-[var(--color-fg-secondary)]" />}
          checked={largeText}
          onChange={setLargeText}
        />

        <SettingToggle
          label="Reduce Motion"
          description="Minimize animations and transitions"
          icon={<Zap className="h-5 w-5 text-[var(--color-fg-secondary)]" />}
          checked={reducedMotion}
          onChange={() => {}}
          disabled
        />

        <SettingToggle
          label="High Contrast"
          description="Increase contrast for better visibility"
          icon={<Eye className="h-5 w-5 text-[var(--color-fg-secondary)]" />}
          checked={highContrast}
          onChange={() => {}}
          disabled
        />
      </GlassCard>

      <p className="text-sm text-[var(--color-fg-tertiary)]">
        Some settings are controlled by your system preferences.
      </p>
    </div>
  );
}
```

---

## Integration Points

### Files to Create
- `src/providers/AccessibilityProvider.tsx` - Global accessibility context
- `src/hooks/useFocusTrap.ts` - Focus management hook
- `src/hooks/useReducedMotion.ts` - Motion preference hook
- `src/components/atoms/AccessibleButton.tsx` - Accessible button
- `src/components/atoms/SkipLink.tsx` - Skip navigation link
- `src/components/atoms/LiveRegion.tsx` - Screen reader announcements
- `src/components/organisms/AccessibleModal.tsx` - Accessible modal
- `src/components/organisms/AccessibleTabs.tsx` - Accessible tabs
- `src/components/organisms/AccessibilitySettings.tsx` - Settings UI

### Files to Modify
- `src/app/globals.css` - Add accessibility styles
- `src/app/layout.tsx` - Add AccessibilityProvider, SkipLink, LiveRegion
- All existing components - Add proper ARIA attributes

---

## Technical Specifications

### WCAG 2.1 AA Requirements
| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.4.3 Contrast | 4.5:1 text, 3:1 UI | CSS custom properties with high contrast mode |
| 2.1.1 Keyboard | All functionality keyboard accessible | Proper tabindex and keyboard handlers |
| 2.4.3 Focus Order | Logical focus order | Semantic HTML structure |
| 2.4.7 Focus Visible | Focus indicator visible | CSS focus-visible styles |
| 2.5.5 Target Size | 44x44px minimum | CSS min-width/min-height |
| 3.2.1 On Focus | No context change on focus | Controlled focus management |
| 4.1.2 Name, Role, Value | Proper ARIA attributes | Comprehensive ARIA implementation |

### Screen Reader Testing Matrix
| Screen Reader | Browser | Priority |
|---------------|---------|----------|
| VoiceOver | Safari (iOS) | High |
| VoiceOver | Safari (macOS) | High |
| TalkBack | Chrome (Android) | Medium |
| NVDA | Firefox (Windows) | Medium |
| JAWS | Chrome (Windows) | Low |

---

## Dependencies

### Required
- None (uses native browser APIs)

### Optional
- `@testing-library/react` - Accessibility testing

---

## Success Criteria

1. **WCAG Compliance**: Pass automated WCAG 2.1 AA checks
2. **Screen Reader**: All content announced correctly
3. **Keyboard Navigation**: Full app usable without mouse
4. **Focus Management**: Visible, logical focus order
5. **Reduced Motion**: All animations respect user preference
6. **Touch Targets**: All interactive elements meet 44x44px minimum

---

## Estimated Effort

- **Accessibility Provider**: 3 hours
- **Focus Management Hooks**: 2 hours
- **Accessible Components**: 6 hours
- **CSS Foundations**: 2 hours
- **Testing with Screen Readers**: 4 hours
- **Remediation**: 3 hours
- **Total**: 20 hours (2.5 days)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Screen reader compatibility | High | Test with multiple screen readers |
| Focus trap breaking navigation | Medium | Extensive keyboard testing |
| Animation causing vestibular issues | Medium | Always check reduced motion preference |
| Color contrast insufficient | High | Use contrast checking tools |
| Touch targets too small | Medium | Enforce minimum sizes in CSS |
