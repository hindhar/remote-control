# Plan 03: Animation & Motion Design

**Focus**: Implementing fluid Framer Motion animations, spring physics, micro-interactions, and gesture feedback that create an Apple-quality feel with haptic-like responses.

## Key Decisions

1. **Spring-Based Physics**: Use spring animations exclusively for interactive elements to create natural, physics-based motion that feels responsive and organic.

2. **Motion Hierarchy**: Establish animation timing tiers (micro: 100-200ms, standard: 200-350ms, macro: 350-500ms) to create consistent motion language.

3. **Gesture-First Design**: Implement press, long-press, swipe, and drag gestures with immediate visual feedback before any action completes.

4. **Reduce Motion Support**: All animations respect `prefers-reduced-motion` media query with graceful fallbacks.

## Implementation Steps

### Step 1: Install and Configure Framer Motion

```bash
npm install framer-motion
```

Create motion configuration (`/src/lib/motion.ts`):

```typescript
// src/lib/motion.ts
import { type Transition, type Variants } from 'framer-motion';

// ============================================================================
// Spring Presets - Apple-Inspired Physics
// ============================================================================

export const springs = {
  // Quick, responsive feedback for buttons
  button: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  } as const,

  // Snappy but smooth for interactive elements
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.5,
  } as const,

  // Smooth, natural feel for most UI elements
  smooth: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  } as const,

  // Gentle, bouncy motion for playful elements
  bouncy: {
    type: 'spring',
    stiffness: 200,
    damping: 15,
    mass: 0.8,
  } as const,

  // Heavy, deliberate motion for modals/overlays
  heavy: {
    type: 'spring',
    stiffness: 150,
    damping: 25,
    mass: 1.2,
  } as const,

  // Very smooth for page transitions
  page: {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    mass: 1,
  } as const,
};

// ============================================================================
// Duration Presets (for non-spring animations)
// ============================================================================

export const durations = {
  instant: 0.05,
  micro: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
  slower: 0.45,
  slowest: 0.6,
} as const;

// ============================================================================
// Easing Curves
// ============================================================================

export const easings = {
  // Apple's standard easing
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],

  // iOS-specific curves
  iosEaseOut: [0.23, 1, 0.32, 1],
  iosEaseIn: [0.55, 0.055, 0.675, 0.19],
  iosEaseInOut: [0.645, 0.045, 0.355, 1],

  // Smooth curve for opacity
  smoothFade: [0.4, 0, 0.2, 1],
} as const;

// ============================================================================
// Transition Presets
// ============================================================================

export const transitions = {
  // Button press feedback
  buttonPress: {
    ...springs.button,
    duration: durations.micro,
  } as Transition,

  // Standard interactive element
  interactive: {
    ...springs.snappy,
  } as Transition,

  // Fade in/out
  fade: {
    duration: durations.normal,
    ease: easings.smoothFade,
  } as Transition,

  // Scale and fade
  scaleFade: {
    scale: springs.smooth,
    opacity: { duration: durations.normal, ease: easings.smoothFade },
  } as Transition,

  // Tab switching
  tab: {
    x: springs.snappy,
    opacity: { duration: durations.fast },
  } as Transition,

  // Modal/overlay appearance
  overlay: {
    ...springs.heavy,
    opacity: { duration: durations.normal },
  } as Transition,

  // Page transitions
  page: {
    ...springs.page,
    opacity: { duration: durations.slow },
  } as Transition,

  // Stagger children
  stagger: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  } as Transition,

  // Fast stagger for lists
  fastStagger: {
    staggerChildren: 0.03,
    delayChildren: 0.05,
  } as Transition,
};

// ============================================================================
// Variant Presets
// ============================================================================

export const variants = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  } as Variants,

  // Fade in from top
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  } as Variants,

  // Scale up from center
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  } as Variants,

  // Slide in from right (for modals)
  slideInRight: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '50%' },
  } as Variants,

  // Slide in from left
  slideInLeft: {
    initial: { opacity: 0, x: '-100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-50%' },
  } as Variants,

  // Slide in from bottom (for sheets)
  slideInBottom: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
  } as Variants,

  // Container with staggered children
  staggerContainer: {
    initial: {},
    animate: {
      transition: transitions.stagger,
    },
    exit: {},
  } as Variants,

  // Child item for stagger animation
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  } as Variants,

  // Button hover/press states
  button: {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.97 },
  } as Variants,

  // Icon button with rotation
  iconButton: {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95, rotate: -5 },
  } as Variants,

  // Glow pulse for active states
  glowPulse: {
    initial: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
    animate: {
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0.4)',
        '0 0 0 10px rgba(59, 130, 246, 0)',
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut',
      },
    },
  } as Variants,

  // Connection status pulse
  statusPulse: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  } as Variants,
};

// ============================================================================
// Gesture Configurations
// ============================================================================

export const gestures = {
  // Standard tap/press
  tap: {
    whileTap: { scale: 0.97 },
    transition: springs.button,
  },

  // Larger buttons
  largeTap: {
    whileTap: { scale: 0.95 },
    transition: springs.button,
  },

  // Small icon buttons
  iconTap: {
    whileTap: { scale: 0.9, rotate: -3 },
    transition: springs.snappy,
  },

  // Drag gesture constraints
  drag: {
    drag: true,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.1,
  },

  // Horizontal drag for sliders
  horizontalDrag: {
    drag: 'x' as const,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.05,
  },
};

// ============================================================================
// Reduced Motion Support
// ============================================================================

export const reducedMotionVariants = {
  fadeOnly: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  instant: {
    initial: {},
    animate: {},
    exit: {},
  } as Variants,
};

export function getVariants(variants: Variants, reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return reducedMotionVariants.fadeOnly;
  }
  return variants;
}

export function getTransition(transition: Transition, reducedMotion: boolean): Transition {
  if (reducedMotion) {
    return { duration: 0.01 };
  }
  return transition;
}
```

### Step 2: Create Animation Components

**AnimatedButton** (`/src/components/atoms/AnimatedButton/AnimatedButton.tsx`):

```typescript
// src/components/atoms/AnimatedButton/AnimatedButton.tsx
'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { springs, transitions, gestures } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  haptic?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, variant = 'default', size = 'md', loading, haptic = true, className, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const motionProps = shouldReduceMotion
      ? {}
      : {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.97 },
          transition: springs.button,
        };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          'transition-colors duration-150',
          // Add variant and size classes
          className
        )}
        {...motionProps}
        {...props}
      >
        {/* Ripple effect on press */}
        <motion.span
          className="absolute inset-0 bg-white/10"
          initial={{ scale: 0, opacity: 0.5 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? <LoadingSpinner /> : children}
        </span>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

function LoadingSpinner() {
  return (
    <motion.svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </motion.svg>
  );
}

export { AnimatedButton };
```

**AnimatedDPad** (`/src/components/organisms/AnimatedDPad/AnimatedDPad.tsx`):

```typescript
// src/components/organisms/AnimatedDPad/AnimatedDPad.tsx
'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { springs, transitions, variants } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface AnimatedDPadProps {
  onDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onLongPress?: (direction: string) => void;
  loadingDirection?: string | null;
  activeDirection?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedDPad({
  onDirection,
  onSelect,
  onLongPress,
  loadingDirection,
  activeDirection,
  size = 'md',
  className,
}: AnimatedDPadProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: shouldReduceMotion ? { duration: 0 } : springs.smooth,
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.08 },
    tap: { scale: 0.92 },
  };

  const activeRingVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.6, 0, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const DirectionButton = ({
    direction,
    Icon,
    position,
  }: {
    direction: 'up' | 'down' | 'left' | 'right';
    Icon: typeof ChevronUp;
    position: string;
  }) => {
    const isActive = activeDirection === direction;
    const isLoading = loadingDirection === direction;

    return (
      <motion.button
        className={cn(
          'absolute w-14 h-14 rounded-full',
          'bg-[var(--color-surface-glass)]',
          'backdrop-blur-xl',
          'border border-[var(--color-surface-glass-border)]',
          'shadow-[var(--shadow-button)]',
          'flex items-center justify-center',
          'transition-colors',
          isActive && 'bg-[var(--color-accent-blue)]/20',
          position
        )}
        variants={shouldReduceMotion ? {} : buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={springs.button}
        onClick={() => onDirection(direction)}
        onPointerDown={(e) => {
          // Long press detection
          const timer = setTimeout(() => {
            onLongPress?.(direction);
          }, 500);
          const cleanup = () => clearTimeout(timer);
          e.currentTarget.addEventListener('pointerup', cleanup, { once: true });
          e.currentTarget.addEventListener('pointerleave', cleanup, { once: true });
        }}
        aria-label={`${direction} arrow`}
      >
        {/* Active ring animation */}
        <AnimatePresence>
          {isActive && !shouldReduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-blue)]"
              variants={activeRingVariants}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, scale: 1.5 }}
            />
          )}
        </AnimatePresence>

        {/* Loading spinner */}
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <Icon className="w-6 h-6 text-[var(--color-text-primary)]" />
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      className={cn(
        'relative w-52 h-52',
        'bg-[var(--color-surface-glass)]',
        'backdrop-blur-2xl',
        'rounded-full',
        'border border-[var(--color-surface-glass-border)]',
        'shadow-[var(--shadow-glass)]',
        className
      )}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, var(--color-accent-blue)/5 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Direction buttons */}
      <DirectionButton
        direction="up"
        Icon={ChevronUp}
        position="top-3 left-1/2 -translate-x-1/2"
      />
      <DirectionButton
        direction="down"
        Icon={ChevronDown}
        position="bottom-3 left-1/2 -translate-x-1/2"
      />
      <DirectionButton
        direction="left"
        Icon={ChevronLeft}
        position="left-3 top-1/2 -translate-y-1/2"
      />
      <DirectionButton
        direction="right"
        Icon={ChevronRight}
        position="right-3 top-1/2 -translate-y-1/2"
      />

      {/* Center button */}
      <motion.button
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-16 h-16 rounded-full',
          'bg-[var(--color-accent-blue)]',
          'shadow-[var(--shadow-glow-blue)]',
          'flex items-center justify-center',
          'ring-4 ring-white/10'
        )}
        variants={shouldReduceMotion ? {} : buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={springs.button}
        onClick={onSelect}
        aria-label="Select"
      >
        {loadingDirection === 'select' ? (
          <motion.div
            className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <motion.span
            className="w-4 h-4 rounded-full bg-white/80"
            whileHover={{ scale: 1.2 }}
          />
        )}
      </motion.button>
    </motion.div>
  );
}
```

### Step 3: Create Tab Animation System

```typescript
// src/components/organisms/AnimatedTabs/AnimatedTabs.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import { springs, transitions } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: Record<string, ReactNode>;
  className?: string;
}

export function AnimatedTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: AnimatedTabsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(0);

  const handleTabChange = (tabId: string) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    const newIndex = tabs.findIndex((t) => t.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    onTabChange(tabId);
  };

  const contentVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className={className}>
      {/* Tab bar */}
      <LayoutGroup>
        <div
          className={cn(
            'flex gap-1 p-1',
            'bg-[var(--color-surface-glass)]',
            'backdrop-blur-xl',
            'rounded-[var(--radius-xl)]',
            'border border-[var(--color-surface-glass-border)]',
            'overflow-x-auto scrollbar-hide'
          )}
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'relative flex-1 py-2.5 px-4',
                  'rounded-[var(--radius-lg)]',
                  'flex items-center justify-center gap-2',
                  'text-sm font-medium',
                  'transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                )}
                role="tab"
                aria-selected={isActive}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[var(--color-accent-blue)] rounded-[var(--radius-lg)]"
                    transition={shouldReduceMotion ? { duration: 0 } : springs.smooth}
                  />
                )}

                {/* Tab content */}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon && (
                    <span className="w-4 h-4">{tab.icon}</span>
                  )}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Tab content with slide animation */}
      <div className="mt-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={shouldReduceMotion ? {} : contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    x: springs.snappy,
                    opacity: { duration: 0.2 },
                  }
            }
          >
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### Step 4: Create Toast Animation System

```typescript
// src/components/organisms/AnimatedToast/AnimatedToast.tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { springs } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface AnimatedToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const icons = {
  success: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const colors = {
  success: {
    bg: 'bg-[var(--color-accent-green)]/10',
    border: 'border-[var(--color-accent-green)]/30',
    icon: 'text-[var(--color-accent-green)]',
  },
  error: {
    bg: 'bg-[var(--color-accent-red)]/10',
    border: 'border-[var(--color-accent-red)]/30',
    icon: 'text-[var(--color-accent-red)]',
  },
  info: {
    bg: 'bg-[var(--color-accent-blue)]/10',
    border: 'border-[var(--color-accent-blue)]/30',
    icon: 'text-[var(--color-accent-blue)]',
  },
  warning: {
    bg: 'bg-[var(--color-accent-orange)]/10',
    border: 'border-[var(--color-accent-orange)]/30',
    icon: 'text-[var(--color-accent-orange)]',
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function AnimatedToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: AnimatedToastProps) {
  const shouldReduceMotion = useReducedMotion();

  const toastVariants = {
    initial: {
      opacity: 0,
      y: position.includes('top') ? -20 : 20,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: position.includes('right') ? 100 : -100,
      scale: 0.9,
    },
  };

  return (
    <div
      className={cn(
        'fixed z-50',
        'flex flex-col gap-3',
        'max-w-sm w-full',
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            variants={shouldReduceMotion ? {} : toastVariants}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
  variants,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  variants: Record<string, unknown>;
}) {
  const Icon = icons[toast.type];
  const colorScheme = colors[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springs.smooth}
      className={cn(
        'flex items-start gap-3 p-4',
        'rounded-[var(--radius-xl)]',
        'bg-[var(--color-surface-glass)]',
        'backdrop-blur-xl',
        'border',
        colorScheme.border,
        'shadow-[var(--shadow-glass)]'
      )}
      role="alert"
    >
      {/* Icon with subtle animation */}
      <motion.span
        className={cn('mt-0.5', colorScheme.icon)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={springs.bouncy}
      >
        <Icon className="w-5 h-5" />
      </motion.span>

      {/* Message */}
      <span className="flex-1 text-sm text-[var(--color-text-primary)]">
        {toast.message}
      </span>

      {/* Dismiss button */}
      <motion.button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-full hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
      </motion.button>

      {/* Progress bar */}
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 h-0.5',
          colorScheme.bg.replace('/10', '')
        )}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}
```

### Step 5: Create Page Transition Wrapper

```typescript
// src/components/templates/PageTransition/PageTransition.tsx
'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { springs, variants } from '@/lib/motion';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: 'blur(4px)',
    },
  };

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springs.page}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

## Integration Points

### Files to Create

```
/src/lib/motion.ts                    # Motion configuration
/src/components/atoms/AnimatedButton/
/src/components/organisms/AnimatedDPad/
/src/components/organisms/AnimatedTabs/
/src/components/organisms/AnimatedToast/
/src/components/templates/PageTransition/
/src/hooks/useReducedMotion.ts
```

### Files to Modify

- All button components to use AnimatedButton
- TabNavigation to use AnimatedTabs
- Toast system to use AnimatedToastContainer
- Layout to wrap with PageTransition

## Technical Specifications

- **Animation Library**: Framer Motion 11.x
- **Performance Target**: 60fps on all animations
- **Bundle Impact**: ~20kb gzipped for Framer Motion
- **Motion Preference**: Respects `prefers-reduced-motion`

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Success Criteria

1. All interactive elements have spring-based press feedback
2. Tab switching feels like native iOS with smooth sliding
3. Toasts enter/exit with physics-based motion
4. D-Pad buttons have immediate visual feedback
5. Loading states use smooth spinning animations
6. Reduced motion users see instant state changes
7. No jank or frame drops during animations
8. Animations feel like Apple product interactions

## Estimated Effort

**Time**: 8-12 hours
**Complexity**: Medium-High
**Risk**: Medium

## Dependencies

- Requires Design System Foundation (Plan 01)
- Requires Component Architecture (Plan 02)
- Required by D-Pad Design (Plan 06)
- Required by Glass Morphism (Plan 10)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation jank on low-end devices | High | Use will-change, transform-only animations |
| Bundle size increase | Medium | Tree-shake unused Framer Motion features |
| Memory leaks from animation state | Medium | Properly cleanup AnimatePresence |
| Conflicting animations | Low | Use layout groups and animation queuing |
