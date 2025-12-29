# Plan 05: Button & Control Design

**Focus**: Creating premium button states with haptic simulation, sophisticated press feedback, and Apple-quality touch interactions.

## Key Decisions

1. **Multi-State Visual Feedback**: Every button has distinct visual states: default, hover, focus, active, loading, and disabled - each with precise timing and easing.

2. **Simulated Haptic Feedback**: Use subtle CSS animations combined with the Vibration API (where available) to create haptic-like responses on button press.

3. **Inset Shadow Press Effect**: Buttons appear to physically depress with subtle inset shadows, scale reduction, and brightness adjustments on press.

4. **Continuous Ripple Effect**: A material-design-inspired ripple originates from touch/click point but with Apple's refined, subtle aesthetic.

## Implementation Steps

### Step 1: Create Core Button Component

```typescript
// src/components/atoms/PremiumButton/PremiumButton.tsx
'use client';

import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type MouseEvent,
  type TouchEvent,
  type ButtonHTMLAttributes,
} from 'react';
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useLongPress } from '@/hooks/useLongPress';

export interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'glass';
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean;
  /** Icon to display before text */
  leftIcon?: ReactNode;
  /** Icon to display after text */
  rightIcon?: ReactNode;
  /** Only show icon, hide text on small screens */
  iconOnly?: boolean;
  /** Make button fill container width */
  fullWidth?: boolean;
  /** Custom border radius */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Long press handler */
  onLongPress?: () => void;
  /** Long press threshold in milliseconds */
  longPressDelay?: number;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Haptic intensity */
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  /** Show ripple effect on click */
  ripple?: boolean;
}

// Variant styles with CSS custom properties
const variantStyles = {
  default: {
    base: `
      bg-[var(--color-fill-primary)]
      text-[var(--color-text-primary)]
      border-[var(--color-separator)]
    `,
    hover: `hover:bg-[var(--color-fill-secondary)]`,
    active: `active:bg-[var(--color-fill-tertiary)]`,
    shadow: 'shadow-[var(--shadow-button)]',
    hoverShadow: 'hover:shadow-[var(--shadow-button-hover)]',
    activeShadow: 'active:shadow-[var(--shadow-button-active)]',
  },
  primary: {
    base: `
      bg-[var(--color-accent-blue)]
      text-white
      border-transparent
    `,
    hover: `hover:brightness-110`,
    active: `active:brightness-95`,
    shadow: 'shadow-[0_2px_8px_rgba(59,130,246,0.25)]',
    hoverShadow: 'hover:shadow-[0_4px_16px_rgba(59,130,246,0.35)]',
    activeShadow: 'active:shadow-[0_1px_4px_rgba(59,130,246,0.2)]',
  },
  secondary: {
    base: `
      bg-[var(--color-surface-solid)]
      text-[var(--color-text-primary)]
      border-[var(--color-separator)]
    `,
    hover: `hover:bg-[var(--color-surface-solid-hover)]`,
    active: `active:brightness-95`,
    shadow: 'shadow-[var(--shadow-button)]',
    hoverShadow: 'hover:shadow-[var(--shadow-button-hover)]',
    activeShadow: 'active:shadow-[var(--shadow-button-active)]',
  },
  danger: {
    base: `
      bg-[var(--color-accent-red)]
      text-white
      border-transparent
    `,
    hover: `hover:brightness-110`,
    active: `active:brightness-95`,
    shadow: 'shadow-[0_2px_8px_rgba(239,68,68,0.25)]',
    hoverShadow: 'hover:shadow-[0_4px_16px_rgba(239,68,68,0.35)]',
    activeShadow: 'active:shadow-[0_1px_4px_rgba(239,68,68,0.2)]',
  },
  success: {
    base: `
      bg-[var(--color-accent-green)]
      text-white
      border-transparent
    `,
    hover: `hover:brightness-110`,
    active: `active:brightness-95`,
    shadow: 'shadow-[0_2px_8px_rgba(34,197,94,0.25)]',
    hoverShadow: 'hover:shadow-[0_4px_16px_rgba(34,197,94,0.35)]',
    activeShadow: 'active:shadow-[0_1px_4px_rgba(34,197,94,0.2)]',
  },
  ghost: {
    base: `
      bg-transparent
      text-[var(--color-text-primary)]
      border-transparent
    `,
    hover: `hover:bg-[var(--color-fill-secondary)]`,
    active: `active:bg-[var(--color-fill-tertiary)]`,
    shadow: '',
    hoverShadow: '',
    activeShadow: '',
  },
  glass: {
    base: `
      bg-[var(--color-surface-glass)]
      backdrop-blur-xl
      text-[var(--color-text-primary)]
      border-[var(--color-surface-glass-border)]
    `,
    hover: `hover:bg-[var(--color-surface-glass-hover)]`,
    active: `active:bg-[var(--color-fill-tertiary)]`,
    shadow: 'shadow-[var(--shadow-glass)]',
    hoverShadow: 'hover:shadow-[var(--shadow-glass-hover)]',
    activeShadow: '',
  },
};

const sizeStyles = {
  xs: { button: 'h-7 px-2 text-xs gap-1', icon: 'w-3 h-3' },
  sm: { button: 'h-8 px-3 text-sm gap-1.5', icon: 'w-4 h-4' },
  md: { button: 'h-10 px-4 text-sm gap-2', icon: 'w-5 h-5' },
  lg: { button: 'h-12 px-5 text-base gap-2', icon: 'w-5 h-5' },
  xl: { button: 'h-14 px-6 text-lg gap-2.5', icon: 'w-6 h-6' },
};

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-[var(--radius-sm)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  xl: 'rounded-[var(--radius-xl)]',
  full: 'rounded-full',
};

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      fullWidth = false,
      rounded = 'lg',
      onLongPress,
      longPressDelay = 500,
      haptic = true,
      hapticIntensity = 'light',
      ripple = true,
      className,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const { triggerHaptic } = useHapticFeedback();

    // Spring values for smooth press animation
    const scale = useMotionValue(1);
    const springScale = useSpring(scale, {
      stiffness: 500,
      damping: 30,
      mass: 0.5,
    });

    // Long press handling
    const longPressHandlers = useLongPress({
      onLongPress: () => {
        if (onLongPress) {
          triggerHaptic('medium');
          onLongPress();
        }
      },
      threshold: longPressDelay,
    });

    // Ripple effect
    const addRipple = useCallback(
      (e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
        if (!ripple || shouldReduceMotion) return;

        const button = buttonRef.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        let x: number, y: number;

        if ('touches' in e) {
          x = e.touches[0].clientX - rect.left;
          y = e.touches[0].clientY - rect.top;
        } else {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        }

        const id = Date.now();
        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      },
      [ripple, shouldReduceMotion]
    );

    // Handle click with haptic
    const handleClick = useCallback(
      (e: MouseEvent<HTMLButtonElement>) => {
        if (haptic) {
          triggerHaptic(hapticIntensity);
        }
        onClick?.(e);
      },
      [haptic, hapticIntensity, onClick, triggerHaptic]
    );

    // Handle press down
    const handlePointerDown = useCallback(
      (e: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
        if (!shouldReduceMotion) {
          scale.set(0.97);
        }
        addRipple(e as MouseEvent<HTMLButtonElement>);
      },
      [scale, addRipple, shouldReduceMotion]
    );

    // Handle press up
    const handlePointerUp = useCallback(() => {
      if (!shouldReduceMotion) {
        scale.set(1);
      }
    }, [scale, shouldReduceMotion]);

    const isDisabled = disabled || loading;
    const styles = variantStyles[variant];
    const sizeStyle = sizeStyles[size];

    return (
      <motion.button
        ref={(node) => {
          // Handle both refs
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        style={{ scale: shouldReduceMotion ? 1 : springScale }}
        className={cn(
          // Base layout
          'relative inline-flex items-center justify-center',
          'font-medium whitespace-nowrap select-none',
          'border transition-all',
          'duration-[var(--duration-button)]',
          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-accent-blue)]',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
          // Disabled styles
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variant styles
          styles.base,
          styles.hover,
          styles.active,
          styles.shadow,
          styles.hoverShadow,
          styles.activeShadow,
          // Size styles
          sizeStyle.button,
          // Rounded styles
          roundedStyles[rounded],
          // Conditional styles
          fullWidth && 'w-full',
          iconOnly && 'px-0 aspect-square',
          // Overflow for ripple
          'overflow-hidden',
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        onPointerDown={handlePointerDown as unknown as React.PointerEventHandler<HTMLButtonElement>}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        {...(onLongPress ? longPressHandlers : {})}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              x: '-50%',
              y: '-50%',
            }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Inner highlight for depth */}
        <span
          className={cn(
            'absolute inset-0 rounded-[inherit]',
            'bg-gradient-to-b from-white/5 to-transparent',
            'pointer-events-none'
          )}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-inherit">
          {loading ? (
            <LoadingSpinner size={size} />
          ) : (
            <>
              {leftIcon && (
                <span className={cn('shrink-0', sizeStyle.icon)}>{leftIcon}</span>
              )}
              {children && (
                <span className={cn(iconOnly && 'sr-only')}>{children}</span>
              )}
              {rightIcon && (
                <span className={cn('shrink-0', sizeStyle.icon)}>{rightIcon}</span>
              )}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';

// Loading spinner component
function LoadingSpinner({ size }: { size: PremiumButtonProps['size'] }) {
  const spinnerSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <motion.svg
      className={cn('animate-spin', spinnerSizes[size || 'md'])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
}

export { PremiumButton };
```

### Step 2: Create Haptic Feedback Hook

```typescript
// src/hooks/useHapticFeedback.ts
'use client';

import { useCallback, useRef } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticPattern {
  duration: number | number[];
  vibration?: number[];
}

const HAPTIC_PATTERNS: Record<HapticIntensity, HapticPattern> = {
  light: {
    duration: 10,
    vibration: [10],
  },
  medium: {
    duration: 20,
    vibration: [20],
  },
  heavy: {
    duration: 30,
    vibration: [30],
  },
  success: {
    duration: [10, 50, 20],
    vibration: [10, 50, 20],
  },
  warning: {
    duration: [20, 100, 20],
    vibration: [20, 100, 20],
  },
  error: {
    duration: [30, 50, 30, 50, 30],
    vibration: [30, 50, 30, 50, 30],
  },
};

export function useHapticFeedback() {
  const lastTrigger = useRef(0);

  const triggerHaptic = useCallback((intensity: HapticIntensity = 'light') => {
    // Debounce haptic triggers
    const now = Date.now();
    if (now - lastTrigger.current < 50) return;
    lastTrigger.current = now;

    const pattern = HAPTIC_PATTERNS[intensity];

    // Try native Vibration API first
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern.vibration || [pattern.duration as number]);
      } catch (e) {
        // Vibration not supported or blocked
      }
    }

    // Create audio feedback for devices without vibration
    // This creates a subtle "click" sound that simulates haptic
    try {
      const audioContext = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Ultra-short, subtle click
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);

      const volume = intensity === 'light' ? 0.01 : intensity === 'medium' ? 0.02 : 0.03;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Audio context not available
    }
  }, []);

  return { triggerHaptic };
}
```

### Step 3: Create Long Press Hook

```typescript
// src/hooks/useLongPress.ts
'use client';

import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  threshold?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useLongPress({
  onLongPress,
  threshold = 500,
  onStart,
  onEnd,
}: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const isPressed = useRef(false);

  const start = useCallback(() => {
    isPressed.current = true;
    isLongPress.current = false;
    onStart?.();

    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold, onStart]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isPressed.current = false;
    onEnd?.();
  }, [onEnd]);

  const onClick = useCallback((e: React.MouseEvent) => {
    // Prevent click if it was a long press
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    isLongPress.current = false;
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    onClick,
  };
}
```

### Step 4: Create Icon Button Variant

```typescript
// src/components/atoms/PremiumIconButton/PremiumIconButton.tsx
'use client';

import { forwardRef, type ReactNode } from 'react';
import { PremiumButton, type PremiumButtonProps } from '../PremiumButton';
import { cn } from '@/lib/utils';

interface PremiumIconButtonProps extends Omit<PremiumButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** Icon element to render */
  icon: ReactNode;
  /** Accessible label (required for screen readers) */
  'aria-label': string;
  /** Optional text label below icon */
  label?: string;
  /** Badge content */
  badge?: string | number;
  /** Badge color variant */
  badgeVariant?: 'default' | 'danger' | 'success';
}

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const buttonSizes = {
  xs: 'w-7 h-7',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

const PremiumIconButton = forwardRef<HTMLButtonElement, PremiumIconButtonProps>(
  (
    {
      icon,
      label,
      badge,
      badgeVariant = 'default',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const badgeColors = {
      default: 'bg-[var(--color-fill-primary)] text-[var(--color-text-primary)]',
      danger: 'bg-[var(--color-accent-red)] text-white',
      success: 'bg-[var(--color-accent-green)] text-white',
    };

    return (
      <PremiumButton
        ref={ref}
        size={size}
        rounded="full"
        className={cn(
          buttonSizes[size],
          label && 'h-auto py-2 flex-col gap-1',
          'relative',
          className
        )}
        {...props}
      >
        {/* Icon */}
        <span className={iconSizes[size]}>{icon}</span>

        {/* Optional label */}
        {label && (
          <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
            {label}
          </span>
        )}

        {/* Badge */}
        {badge !== undefined && (
          <span
            className={cn(
              'absolute -top-1 -right-1',
              'min-w-[16px] h-[16px] px-1',
              'rounded-full',
              'text-[10px] font-bold',
              'flex items-center justify-center',
              badgeColors[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}
      </PremiumButton>
    );
  }
);

PremiumIconButton.displayName = 'PremiumIconButton';

export { PremiumIconButton };
export type { PremiumIconButtonProps };
```

### Step 5: Create Color Button (for remote color keys)

```typescript
// src/components/atoms/ColorButton/ColorButton.tsx
'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

type ColorKey = 'red' | 'green' | 'yellow' | 'blue';

interface ColorButtonProps {
  color: ColorKey;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const colorStyles: Record<ColorKey, { bg: string; hover: string; glow: string }> = {
  red: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
  },
  green: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-400',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
  },
  yellow: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
  },
  blue: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  },
};

const ColorButton = forwardRef<HTMLButtonElement, ColorButtonProps>(
  ({ color, onClick, loading, disabled, className }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const { triggerHaptic } = useHapticFeedback();
    const styles = colorStyles[color];

    const handleClick = () => {
      triggerHaptic('light');
      onClick();
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'w-14 h-6 rounded-full',
          'transition-all duration-150',
          styles.bg,
          styles.hover,
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          loading && 'animate-pulse',
          className
        )}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05, boxShadow: styles.glow }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-label={`${color} button`}
      />
    );
  }
);

ColorButton.displayName = 'ColorButton';

export { ColorButton };
export type { ColorButtonProps };
```

### Step 6: Create Toggle/Switch Component

```typescript
// src/components/atoms/Toggle/Toggle.tsx
'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
};

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, disabled, size = 'md', label, className }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const { triggerHaptic } = useHapticFeedback();
    const styles = sizeStyles[size];

    const handleToggle = () => {
      if (disabled) return;
      triggerHaptic('medium');
      onChange(!checked);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex shrink-0',
          'rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-accent-blue)]',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          styles.track,
          checked
            ? 'bg-[var(--color-accent-blue)]'
            : 'bg-[var(--color-fill-secondary)]',
          className
        )}
      >
        {/* Track highlight */}
        <span
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-b from-white/10 to-transparent',
            'pointer-events-none'
          )}
        />

        {/* Thumb */}
        <motion.span
          className={cn(
            'pointer-events-none inline-block rounded-full',
            'bg-white shadow-sm',
            'ring-0',
            styles.thumb
          )}
          animate={{
            x: checked ? parseInt(styles.translate.replace('translate-x-', '')) * 4 : 2,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }
          }
          style={{
            marginTop: size === 'sm' ? 2 : size === 'md' ? 2 : 2,
          }}
        />
      </button>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
export type { ToggleProps };
```

## Integration Points

### Files to Create

```
/src/components/atoms/PremiumButton/PremiumButton.tsx
/src/components/atoms/PremiumButton/index.ts
/src/components/atoms/PremiumIconButton/PremiumIconButton.tsx
/src/components/atoms/ColorButton/ColorButton.tsx
/src/components/atoms/Toggle/Toggle.tsx
/src/hooks/useHapticFeedback.ts
/src/hooks/useLongPress.ts
```

### Files to Modify

- All existing Button usage to use PremiumButton
- Replace toggle switches with Toggle component
- Update color button implementation

## Technical Specifications

- **Press Detection**: Uses pointer events for unified mouse/touch handling
- **Haptic Feedback**: Vibration API + audio fallback for cross-platform support
- **Ripple Effect**: Pure CSS/Framer Motion, no additional dependencies
- **Accessibility**: Full keyboard support, ARIA attributes, focus indicators

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Success Criteria

1. Buttons have immediate visual feedback on press (< 16ms)
2. Haptic feedback triggers on button press (where supported)
3. Loading states show smooth spinning animation
4. Long press detection works reliably on all devices
5. Ripple effect originates from touch/click point
6. Disabled states are clearly distinguishable
7. Focus states meet WCAG 2.1 AA requirements
8. Buttons feel indistinguishable from native iOS controls

## Estimated Effort

**Time**: 6-8 hours
**Complexity**: Medium
**Risk**: Low

## Dependencies

- Requires Design System Foundation (Plan 01)
- Requires Animation & Motion (Plan 03)
- Required by D-Pad Design (Plan 06)
- Required by all interactive components

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Haptic API not supported | Low | Fallback to audio feedback |
| Ripple effect performance | Low | Use CSS transforms only |
| Long press conflicts with scroll | Medium | Cancel on pointer leave |
| Touch delay on mobile | Medium | Use pointer events, not touch events |
