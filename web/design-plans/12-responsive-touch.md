# Plan 12: Responsive Design & Touch Optimization

**Focus**: Fluid layouts for all screen sizes, touch-optimized interactions, and device-specific adaptations for a native-like experience.

---

## Key Decisions

1. **Mobile-First Approach**: Design for phone-sized screens first, enhance for larger displays
2. **Touch-First Interactions**: Minimum 44x44pt touch targets, swipe gestures, haptic feedback
3. **Fluid Typography**: Scale text smoothly between breakpoints using `clamp()`
4. **Container Queries**: Use container queries for component-level responsiveness
5. **Safe Areas**: Respect device safe areas for notches, home indicators, and rounded corners

---

## Implementation Steps

### Step 1: Breakpoint System

```typescript
// src/design-system/tokens/breakpoints.ts

export const breakpoints = {
  // Mobile-first breakpoints
  xs: 0,      // Small phones
  sm: 375,    // Standard phones (iPhone SE, etc.)
  md: 428,    // Large phones (iPhone Pro Max, etc.)
  lg: 744,    // Small tablets (iPad Mini)
  xl: 1024,   // Large tablets (iPad Pro)
  '2xl': 1280, // Desktop
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,

  // Orientation
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',

  // Touch capability
  touch: '@media (hover: none) and (pointer: coarse)',
  hover: '@media (hover: hover) and (pointer: fine)',

  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',

  // High contrast
  highContrast: '@media (prefers-contrast: more)',
} as const;

// Device-specific sizes
export const deviceSizes = {
  // iPhone models
  iPhoneSE: { width: 375, height: 667 },
  iPhone14: { width: 390, height: 844 },
  iPhone14Pro: { width: 393, height: 852 },
  iPhone14ProMax: { width: 430, height: 932 },

  // iPad models
  iPadMini: { width: 744, height: 1133 },
  iPad: { width: 820, height: 1180 },
  iPadPro11: { width: 834, height: 1194 },
  iPadPro12: { width: 1024, height: 1366 },
} as const;
```

### Step 2: CSS Fluid System

```css
/* src/app/globals.css - Responsive foundations */

:root {
  /* Base spacing unit (scales with viewport) */
  --space-unit: clamp(4px, 1vw, 8px);

  /* Safe area insets */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-right: env(safe-area-inset-right, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-left: env(safe-area-inset-left, 0px);

  /* Fluid spacing scale */
  --space-1: calc(var(--space-unit) * 1);   /* 4-8px */
  --space-2: calc(var(--space-unit) * 2);   /* 8-16px */
  --space-3: calc(var(--space-unit) * 3);   /* 12-24px */
  --space-4: calc(var(--space-unit) * 4);   /* 16-32px */
  --space-5: calc(var(--space-unit) * 5);   /* 20-40px */
  --space-6: calc(var(--space-unit) * 6);   /* 24-48px */
  --space-8: calc(var(--space-unit) * 8);   /* 32-64px */
  --space-10: calc(var(--space-unit) * 10); /* 40-80px */
  --space-12: calc(var(--space-unit) * 12); /* 48-96px */

  /* Fluid typography */
  --font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
  --font-size-sm: clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem);
  --font-size-base: clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
  --font-size-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-xl: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --font-size-2xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-3xl: clamp(1.5rem, 1.25rem + 1.25vw, 1.875rem);
  --font-size-4xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem);

  /* Touch targets */
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
  --touch-target-large: 56px;

  /* Container max widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;

  /* Layout measurements */
  --nav-height: 64px;
  --tab-bar-height: 83px; /* 49px + 34px safe area */
  --header-height: calc(44px + var(--safe-area-top));
}

/* Large phone adjustments */
@media (min-width: 428px) {
  :root {
    --space-unit: clamp(5px, 1.2vw, 10px);
  }
}

/* Tablet adjustments */
@media (min-width: 744px) {
  :root {
    --space-unit: 8px;
    --nav-height: 72px;
    --header-height: 52px;
  }
}

/* Desktop adjustments */
@media (min-width: 1024px) {
  :root {
    --nav-height: 80px;
  }
}

/* Safe area utilities */
.pt-safe { padding-top: var(--safe-area-top); }
.pb-safe { padding-bottom: var(--safe-area-bottom); }
.pl-safe { padding-left: var(--safe-area-left); }
.pr-safe { padding-right: var(--safe-area-right); }
.p-safe {
  padding-top: var(--safe-area-top);
  padding-right: var(--safe-area-right);
  padding-bottom: var(--safe-area-bottom);
  padding-left: var(--safe-area-left);
}

/* Container query support */
@supports (container-type: inline-size) {
  .container-query {
    container-type: inline-size;
  }
}
```

### Step 3: Responsive Layout Hook

```typescript
// src/hooks/useResponsive.ts

'use client';

import { useState, useEffect, useCallback } from 'react';
import { breakpoints, Breakpoint } from '@/design-system/tokens/breakpoints';

interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isTouch: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
    breakpoint: 'sm',
    isTouch: false,
    isLandscape: false,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  });

  const getBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }, []);

  const checkTouch = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches
    );
  }, []);

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);

      setState({
        width,
        height,
        breakpoint,
        isTouch: checkTouch(),
        isLandscape: width > height,
        isMobile: breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md',
        isTablet: breakpoint === 'lg' || breakpoint === 'xl',
        isDesktop: breakpoint === '2xl',
      });
    };

    updateState();

    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
    };
  }, [getBreakpoint, checkTouch]);

  return state;
}

/**
 * Returns a value based on current breakpoint
 */
export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const { breakpoint } = useResponsive();

  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);

  // Find the closest defined value at or below current breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return defaultValue;
}
```

### Step 4: Touch Gesture Hook

```typescript
// src/hooks/useTouch.ts

'use client';

import { useRef, useCallback, useEffect } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocityX: number;
  velocityY: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  isActive: boolean;
}

interface TouchHandlers {
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onSwipeLeft?: (velocity: number) => void;
  onSwipeRight?: (velocity: number) => void;
  onSwipeUp?: (velocity: number) => void;
  onSwipeDown?: (velocity: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
}

interface TouchOptions {
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  preventScroll?: boolean;
}

export function useTouch(
  handlers: TouchHandlers,
  options: TouchOptions = {}
) {
  const {
    swipeThreshold = 50,
    swipeVelocityThreshold = 0.3,
    longPressDelay = 500,
    doubleTapDelay = 300,
    preventScroll = false,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocityX: 0,
    velocityY: 0,
    direction: null,
    isActive: false,
  });

  const startTime = useRef(0);
  const lastTapTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const velocityTracker = useRef<{ x: number; y: number; t: number }[]>([]);

  const calculateVelocity = useCallback(() => {
    const samples = velocityTracker.current;
    if (samples.length < 2) return { x: 0, y: 0 };

    const recent = samples.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const dt = (last.t - first.t) / 1000;

    if (dt === 0) return { x: 0, y: 0 };

    return {
      x: (last.x - first.x) / dt,
      y: (last.y - first.y) / dt,
    };
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        velocityX: 0,
        velocityY: 0,
        direction: null,
        isActive: true,
      };

      startTime.current = Date.now();
      velocityTracker.current = [{ x: touch.clientX, y: touch.clientY, t: Date.now() }];

      // Start long press timer
      if (handlers.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (touchState.current.isActive) {
            const moved =
              Math.abs(touchState.current.deltaX) > 10 ||
              Math.abs(touchState.current.deltaY) > 10;
            if (!moved) {
              handlers.onLongPress?.();
            }
          }
        }, longPressDelay);
      }
    },
    [handlers, longPressDelay]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current.isActive) return;

      if (preventScroll) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;

      touchState.current.currentX = touch.clientX;
      touchState.current.currentY = touch.clientY;
      touchState.current.deltaX = deltaX;
      touchState.current.deltaY = deltaY;

      // Track velocity
      velocityTracker.current.push({ x: touch.clientX, y: touch.clientY, t: Date.now() });
      if (velocityTracker.current.length > 10) {
        velocityTracker.current.shift();
      }

      // Determine direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        touchState.current.direction = deltaX > 0 ? 'right' : 'left';
      } else {
        touchState.current.direction = deltaY > 0 ? 'down' : 'up';
      }

      // Cancel long press if moved
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      }
    },
    [preventScroll]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchState.current.isActive) return;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const { deltaX, deltaY, direction } = touchState.current;
    const velocity = calculateVelocity();
    const elapsed = Date.now() - startTime.current;

    touchState.current.isActive = false;

    // Check for swipe
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

    if (
      (absX > swipeThreshold || absY > swipeThreshold) &&
      velocityMagnitude > swipeVelocityThreshold
    ) {
      if (direction) {
        handlers.onSwipe?.(direction, velocityMagnitude);

        switch (direction) {
          case 'left':
            handlers.onSwipeLeft?.(velocityMagnitude);
            break;
          case 'right':
            handlers.onSwipeRight?.(velocityMagnitude);
            break;
          case 'up':
            handlers.onSwipeUp?.(velocityMagnitude);
            break;
          case 'down':
            handlers.onSwipeDown?.(velocityMagnitude);
            break;
        }
      }
    } else if (elapsed < 200 && absX < 10 && absY < 10) {
      // Check for tap or double tap
      const now = Date.now();
      if (now - lastTapTime.current < doubleTapDelay) {
        handlers.onDoubleTap?.();
        lastTapTime.current = 0;
      } else {
        handlers.onTap?.();
        lastTapTime.current = now;
      }
    }
  }, [handlers, swipeThreshold, swipeVelocityThreshold, doubleTapDelay, calculateVelocity]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return ref;
}
```

### Step 5: Responsive Container Component

```typescript
// src/components/layout/ResponsiveContainer.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  safeArea?: boolean;
}

const sizeClasses = {
  sm: 'max-w-[var(--container-sm)]',
  md: 'max-w-[var(--container-md)]',
  lg: 'max-w-[var(--container-lg)]',
  xl: 'max-w-[var(--container-xl)]',
  full: 'max-w-full',
};

export function ResponsiveContainer({
  children,
  className,
  size = 'lg',
  padding = true,
  safeArea = false,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        padding && 'px-[var(--space-4)]',
        safeArea && 'pl-safe pr-safe',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Step 6: Touch-Optimized Button Component

```typescript
// src/components/atoms/TouchButton.tsx

'use client';

import React, { useRef, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
  haptic?: boolean;
}

const sizeClasses = {
  sm: 'min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)] px-3 text-sm',
  md: 'min-h-[var(--touch-target-comfortable)] min-w-[var(--touch-target-comfortable)] px-4 text-base',
  lg: 'min-h-[var(--touch-target-large)] min-w-[var(--touch-target-large)] px-5 text-lg',
  xl: 'min-h-[64px] min-w-[64px] px-6 text-xl',
};

const variantClasses = {
  primary: 'bg-[var(--color-blue)] text-white',
  secondary: 'bg-[var(--color-fill-secondary)] text-[var(--color-fg-primary)]',
  ghost: 'bg-transparent text-[var(--color-fg-secondary)]',
};

export function TouchButton({
  children,
  onClick,
  onLongPress,
  size = 'md',
  variant = 'secondary',
  disabled = false,
  className,
  haptic = true,
}: TouchButtonProps) {
  const { trigger } = useHaptics();
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [isPressed, setIsPressed] = useState(false);

  const scale = useMotionValue(1);
  const springScale = useSpring(scale, {
    stiffness: 600,
    damping: 30,
  });

  const shadowOpacity = useTransform(springScale, [0.95, 1], [0.15, 0.05]);

  const handlePressStart = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
    scale.set(0.95);

    if (haptic) {
      trigger('selection');
    }

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (haptic) {
          trigger('impact', 'medium');
        }
        onLongPress();
      }, 500);
    }
  }, [disabled, scale, haptic, trigger, onLongPress]);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    scale.set(1);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, [scale]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (haptic) {
      trigger('impact', 'light');
    }
    onClick?.();
  }, [disabled, haptic, trigger, onClick]);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      className={cn(
        'relative flex items-center justify-center rounded-xl',
        'select-none touch-manipulation',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2',
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      style={{
        scale: springScale,
        boxShadow: `0 4px 12px rgba(0, 0, 0, ${shadowOpacity.get()})`,
      }}
    >
      {/* Press highlight */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPressed ? 0.1 : 0 }}
        transition={{ duration: 0.1 }}
      />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
```

### Step 7: Responsive Grid System

```typescript
// src/components/layout/ResponsiveGrid.tsx

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 2, sm: 3, md: 4, lg: 6 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gridCols = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn(
        'grid',
        gapClasses[gap],
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${cols.xs || 2}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
```

### Step 8: Swipeable View Component

```typescript
// src/components/organisms/SwipeableViews.tsx

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface SwipeableViewsProps {
  children: React.ReactNode[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  threshold?: number;
  resistance?: number;
}

export function SwipeableViews({
  children,
  activeIndex: controlledIndex,
  onIndexChange,
  threshold = 0.3,
  resistance = 0.5,
}: SwipeableViewsProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;
  const containerRef = useRef<HTMLDivElement>(null);
  const { trigger } = useHaptics();

  const setIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, children.length - 1));
      setInternalIndex(clampedIndex);
      onIndexChange?.(clampedIndex);
    },
    [children.length, onIndexChange]
  );

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const containerWidth = containerRef.current?.offsetWidth || 300;
      const offsetThreshold = containerWidth * threshold;

      if (Math.abs(info.offset.x) > offsetThreshold || Math.abs(info.velocity.x) > 500) {
        const direction = info.offset.x > 0 ? -1 : 1;
        const newIndex = activeIndex + direction;

        if (newIndex >= 0 && newIndex < children.length) {
          trigger('selection');
          setIndex(newIndex);
        }
      }
    },
    [activeIndex, children.length, threshold, trigger, setIndex]
  );

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <motion.div
        className="flex"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={resistance}
        onDragEnd={handleDragEnd}
        animate={{ x: -activeIndex * 100 + '%' }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 40,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            aria-hidden={index !== activeIndex}
          >
            {child}
          </div>
        ))}
      </motion.div>

      {/* Page indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {React.Children.map(children, (_, index) => (
          <button
            key={index}
            onClick={() => {
              trigger('selection');
              setIndex(index);
            }}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              index === activeIndex
                ? 'w-6 bg-[var(--color-blue)]'
                : 'w-2 bg-[var(--color-fill-secondary)]'
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
```

### Step 9: Pull-to-Refresh Component

```typescript
// src/components/organisms/PullToRefresh.tsx

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { trigger } = useHaptics();

  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold, threshold * 2], [0, 180, 360]);
  const scale = useTransform(y, [0, threshold], [0.5, 1]);

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Only allow pull when scrolled to top
      const scrollTop = containerRef.current?.scrollTop || 0;
      if (scrollTop > 0) {
        y.set(0);
        return;
      }

      // Apply resistance
      const resistance = 0.5;
      const newY = Math.max(0, info.offset.y * resistance);
      y.set(newY);

      // Haptic at threshold
      if (newY >= threshold && y.getPrevious() < threshold) {
        trigger('impact', 'medium');
      }
    },
    [y, threshold, trigger]
  );

  const handleDragEnd = useCallback(async () => {
    if (y.get() >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      trigger('impact', 'heavy');

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    y.set(0);
  }, [y, threshold, isRefreshing, trigger, onRefresh]);

  return (
    <div className="relative overflow-hidden">
      {/* Refresh indicator */}
      <motion.div
        className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center justify-center"
        style={{
          opacity,
          y: useTransform(y, [0, threshold], [-40, 20]),
        }}
      >
        <motion.div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            'bg-[var(--color-bg-elevated)]',
            'shadow-lg'
          )}
          style={{ scale }}
        >
          <motion.div style={{ rotate }}>
            <RefreshCw
              className={cn(
                'h-5 w-5 text-[var(--color-blue)]',
                isRefreshing && 'animate-spin'
              )}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-y-auto"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: isRefreshing ? threshold / 2 : 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### Step 10: Responsive Layout for Remote

```typescript
// src/components/templates/RemoteLayout.tsx

'use client';

import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface RemoteLayoutProps {
  header: React.ReactNode;
  navigation: React.ReactNode;
  content: React.ReactNode;
  sidebar?: React.ReactNode;
}

export function RemoteLayout({
  header,
  navigation,
  content,
  sidebar,
}: RemoteLayoutProps) {
  const { isMobile, isTablet, isDesktop, isLandscape } = useResponsive();

  // Mobile portrait: Stack layout
  if (isMobile && !isLandscape) {
    return (
      <div className="flex h-screen flex-col bg-[var(--color-bg-primary)]">
        {/* Header */}
        <header className="flex-shrink-0 pt-safe">
          {header}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-safe pb-[var(--tab-bar-height)]">
          {content}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 pb-safe">
          {navigation}
        </nav>
      </div>
    );
  }

  // Mobile landscape: Side-by-side
  if (isMobile && isLandscape) {
    return (
      <div className="flex h-screen bg-[var(--color-bg-primary)] pl-safe pr-safe">
        {/* Compact navigation */}
        <nav className="w-20 flex-shrink-0 border-r border-[var(--color-separator)]">
          {navigation}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {header}
          {content}
        </main>
      </div>
    );
  }

  // Tablet: Sidebar layout
  if (isTablet) {
    return (
      <div className="flex h-screen bg-[var(--color-bg-primary)]">
        {/* Sidebar navigation */}
        <nav className="w-72 flex-shrink-0 border-r border-[var(--color-separator)] pt-safe pb-safe">
          {navigation}
        </nav>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex-shrink-0 pt-safe">{header}</header>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {content}
            </div>
            {sidebar && (
              <aside className="w-80 flex-shrink-0 overflow-y-auto border-l border-[var(--color-separator)] p-4">
                {sidebar}
              </aside>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Desktop: Three-column layout
  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* Left navigation */}
      <nav className="w-64 flex-shrink-0 border-r border-[var(--color-separator)]">
        {navigation}
      </nav>

      {/* Center content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex-shrink-0">{header}</header>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {content}
        </div>
      </main>

      {/* Right sidebar */}
      {sidebar && (
        <aside className="w-80 flex-shrink-0 overflow-y-auto border-l border-[var(--color-separator)] p-6">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
```

---

## Integration Points

### Files to Create
- `src/design-system/tokens/breakpoints.ts` - Breakpoint definitions
- `src/hooks/useResponsive.ts` - Responsive state hook
- `src/hooks/useTouch.ts` - Touch gesture detection
- `src/components/layout/ResponsiveContainer.tsx` - Fluid container
- `src/components/atoms/TouchButton.tsx` - Touch-optimized button
- `src/components/layout/ResponsiveGrid.tsx` - Adaptive grid
- `src/components/organisms/SwipeableViews.tsx` - Swipe navigation
- `src/components/organisms/PullToRefresh.tsx` - Pull to refresh
- `src/components/templates/RemoteLayout.tsx` - Main layout template

### Files to Modify
- `src/app/globals.css` - Add fluid typography and spacing
- `tailwind.config.ts` - Add custom breakpoints
- `src/app/page.tsx` - Use new responsive components

---

## Technical Specifications

### Touch Targets
| Element | Minimum | Recommended | Large |
|---------|---------|-------------|-------|
| Buttons | 44x44px | 48x48px | 56x56px |
| List items | 44px height | 48px height | 56px height |
| Controls | 44x44px | 48x48px | 56x56px |
| Spacing | 8px | 12px | 16px |

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### PWA Considerations
- Support for standalone display mode
- Handle iOS status bar overlays
- Respect safe area insets

---

## Dependencies

### Required
- `framer-motion` - Gesture handling and animations

### Optional
- None

---

## Success Criteria

1. **Touch Targets**: All interactive elements meet 44x44px minimum
2. **Fluid Scaling**: Content scales smoothly from 320px to 1440px
3. **Orientation**: Layout adapts properly to portrait and landscape
4. **Safe Areas**: Content respects device notches and home indicators
5. **Gestures**: Swipe navigation feels natural and responsive
6. **Performance**: 60fps during gestures and animations

---

## Estimated Effort

- **Breakpoint System**: 1 hour
- **CSS Fluid System**: 2 hours
- **Responsive Hooks**: 3 hours
- **Touch Components**: 4 hours
- **Layout Templates**: 3 hours
- **Testing Across Devices**: 3 hours
- **Total**: 16 hours (2 days)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS Safari viewport quirks | Medium | Use viewport-fit=cover and safe area insets |
| Touch and mouse conflicts | Low | Detect pointer type and adapt interactions |
| Performance on low-end devices | Medium | Reduce animation complexity on slower devices |
| Gesture conflicts with browser | High | Use touch-action CSS to prevent browser gestures |
| Safe area detection failing | Low | Provide sensible fallback padding |
