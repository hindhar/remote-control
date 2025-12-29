# Plan 06: D-Pad Navigation Cluster Design

**Focus**: Creating an Apple Remote-inspired circular touch area with elegant directional controls, a prominent center select button, and sophisticated visual feedback.

## Key Decisions

1. **Circular Glass Container**: The D-Pad sits within a circular glass morphism container that evokes the Apple TV remote's touch surface.

2. **Radial Button Layout**: Direction buttons are positioned in a perfect circle around a prominent center button, with equal spacing and visual balance.

3. **Gesture Support**: Beyond taps, support swipe gestures on the entire D-Pad surface for rapid navigation (like Apple TV remote).

4. **Active Direction Indicator**: Show a subtle glow or highlight in the direction being pressed, providing immediate spatial feedback.

## Implementation Steps

### Step 1: Create Premium D-Pad Component

```typescript
// src/components/organisms/PremiumDPad/PremiumDPad.tsx
'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
  AnimatePresence,
  type PanInfo,
} from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { springs } from '@/lib/motion';

type Direction = 'up' | 'down' | 'left' | 'right';

interface PremiumDPadProps {
  /** Called when a direction is pressed */
  onDirection: (direction: Direction) => void;
  /** Called when center/select is pressed */
  onSelect: () => void;
  /** Called when any direction is long-pressed */
  onLongPress?: (direction: Direction | 'select') => void;
  /** Currently loading direction */
  loadingDirection?: Direction | 'select' | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Enable swipe gestures on the surface */
  swipeEnabled?: boolean;
  /** Swipe threshold in pixels */
  swipeThreshold?: number;
  /** Content to show in center button */
  centerContent?: ReactNode;
  /** Label for center button */
  centerLabel?: string;
  /** Show directional glow on hover/press */
  showGlow?: boolean;
  className?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    container: 180,
    innerRadius: 70,
    buttonSize: 48,
    centerSize: 56,
    iconSize: 20,
    gap: 4,
  },
  md: {
    container: 220,
    innerRadius: 85,
    buttonSize: 56,
    centerSize: 64,
    iconSize: 24,
    gap: 6,
  },
  lg: {
    container: 260,
    innerRadius: 100,
    buttonSize: 64,
    centerSize: 76,
    iconSize: 28,
    gap: 8,
  },
};

export function PremiumDPad({
  onDirection,
  onSelect,
  onLongPress,
  loadingDirection,
  size = 'md',
  swipeEnabled = true,
  swipeThreshold = 30,
  centerContent,
  centerLabel = 'Select',
  showGlow = true,
  className,
}: PremiumDPadProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDirection, setActiveDirection] = useState<Direction | 'select' | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const { triggerHaptic } = useHapticFeedback();
  const config = sizeConfig[size];

  // Motion values for the glow effect
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springX = useSpring(glowX, springs.smooth);
  const springY = useSpring(glowY, springs.smooth);

  // Handle swipe gestures
  const handlePan = useCallback(
    (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!swipeEnabled) return;

      const { offset, velocity } = info;
      const absX = Math.abs(offset.x);
      const absY = Math.abs(offset.y);

      // Determine if this is a valid swipe
      if (absX < swipeThreshold && absY < swipeThreshold) return;

      let direction: Direction | null = null;

      if (absX > absY) {
        // Horizontal swipe
        direction = offset.x > 0 ? 'right' : 'left';
      } else {
        // Vertical swipe
        direction = offset.y > 0 ? 'down' : 'up';
      }

      if (direction && Math.abs(velocity.x) > 100 || Math.abs(velocity.y) > 100) {
        setActiveDirection(direction);
        triggerHaptic('light');
        onDirection(direction);

        // Reset active state after brief delay
        setTimeout(() => setActiveDirection(null), 150);
      }
    },
    [swipeEnabled, swipeThreshold, onDirection, triggerHaptic]
  );

  // Calculate glow position based on active direction
  const getGlowPosition = useCallback((direction: Direction | null) => {
    if (!direction) return { x: 0, y: 0 };

    const positions = {
      up: { x: 0, y: -config.innerRadius },
      down: { x: 0, y: config.innerRadius },
      left: { x: -config.innerRadius, y: 0 },
      right: { x: config.innerRadius, y: 0 },
    };

    return positions[direction];
  }, [config.innerRadius]);

  // Update glow position
  const updateGlow = useCallback(
    (direction: Direction | null) => {
      const pos = getGlowPosition(direction);
      glowX.set(pos.x);
      glowY.set(pos.y);
    },
    [getGlowPosition, glowX, glowY]
  );

  // Direction button handler
  const handleDirectionPress = useCallback(
    (direction: Direction) => {
      setActiveDirection(direction);
      updateGlow(direction);
      triggerHaptic('light');
      onDirection(direction);

      setTimeout(() => {
        setActiveDirection(null);
        updateGlow(null);
      }, 150);
    },
    [onDirection, triggerHaptic, updateGlow]
  );

  // Long press handler
  const handleLongPress = useCallback(
    (target: Direction | 'select') => {
      triggerHaptic('medium');
      onLongPress?.(target);
    },
    [onLongPress, triggerHaptic]
  );

  // Center button handler
  const handleCenterPress = useCallback(() => {
    setActiveDirection('select');
    triggerHaptic('medium');
    onSelect();

    setTimeout(() => setActiveDirection(null), 150);
  }, [onSelect, triggerHaptic]);

  // Direction button component
  const DirectionButton = ({
    direction,
    Icon,
    angle,
  }: {
    direction: Direction;
    Icon: typeof ChevronUp;
    angle: number;
  }) => {
    const isActive = activeDirection === direction;
    const isLoading = loadingDirection === direction;
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Calculate position on circle
    const x = Math.cos((angle * Math.PI) / 180) * config.innerRadius;
    const y = Math.sin((angle * Math.PI) / 180) * config.innerRadius;

    const handlePointerDown = () => {
      setIsPressed(true);
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          handleLongPress(direction);
        }, 500);
      }
    };

    const handlePointerUp = () => {
      setIsPressed(false);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    return (
      <motion.button
        className={cn(
          'absolute rounded-full',
          'flex items-center justify-center',
          'bg-[var(--color-surface-glass)]',
          'backdrop-blur-md',
          'border border-[var(--color-surface-glass-border)]',
          'shadow-[var(--shadow-button)]',
          'transition-colors duration-150',
          isActive && 'bg-white/20 border-white/20'
        )}
        style={{
          width: config.buttonSize,
          height: config.buttonSize,
          left: `calc(50% + ${x}px - ${config.buttonSize / 2}px)`,
          top: `calc(50% + ${y}px - ${config.buttonSize / 2}px)`,
        }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
        transition={springs.button}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => handleDirectionPress(direction)}
        aria-label={`${direction} arrow`}
        disabled={!!loadingDirection}
      >
        {/* Active ring animation */}
        <AnimatePresence>
          {isActive && !shouldReduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 20px 4px var(--color-accent-blue)`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1.1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* Icon or loading spinner */}
        {isLoading ? (
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <Icon
            className="text-[var(--color-text-primary)]"
            style={{ width: config.iconSize, height: config.iconSize }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        width: config.container,
        height: config.container,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : springs.smooth}
      onPan={handlePan}
    >
      {/* Main circular container */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-[var(--color-surface-glass)]',
          'backdrop-blur-2xl',
          'border border-[var(--color-surface-glass-border)]',
          'shadow-[var(--shadow-glass)]',
          'overflow-hidden'
        )}
      >
        {/* Ambient gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 50% 30%, hsla(211, 100%, 60%, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 30% 70%, hsla(280, 100%, 60%, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 70% 60%, hsla(142, 69%, 58%, 0.05) 0%, transparent 40%)
            `,
          }}
        />

        {/* Directional glow effect */}
        {showGlow && !shouldReduceMotion && (
          <motion.div
            className="absolute w-24 h-24 pointer-events-none"
            style={{
              x: springX,
              y: springY,
              left: '50%',
              top: '50%',
              marginLeft: -48,
              marginTop: -48,
              background: 'radial-gradient(circle, var(--color-accent-blue)/30 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        )}

        {/* Touch surface highlight */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 25%, white 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Direction buttons */}
      <DirectionButton direction="up" Icon={ChevronUp} angle={-90} />
      <DirectionButton direction="down" Icon={ChevronDown} angle={90} />
      <DirectionButton direction="left" Icon={ChevronLeft} angle={180} />
      <DirectionButton direction="right" Icon={ChevronRight} angle={0} />

      {/* Center select button */}
      <motion.button
        className={cn(
          'absolute rounded-full',
          'flex items-center justify-center',
          'bg-[var(--color-accent-blue)]',
          'border-4 border-white/10',
          'shadow-[var(--shadow-glow-blue)]',
          'transition-shadow duration-200'
        )}
        style={{
          width: config.centerSize,
          height: config.centerSize,
          left: `calc(50% - ${config.centerSize / 2}px)`,
          top: `calc(50% - ${config.centerSize / 2}px)`,
        }}
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                scale: 1.05,
                boxShadow: '0 0 30px 8px hsla(211, 100%, 60%, 0.5)',
              }
        }
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        transition={springs.button}
        onClick={handleCenterPress}
        aria-label={centerLabel}
        disabled={!!loadingDirection}
      >
        {/* Loading state */}
        {loadingDirection === 'select' ? (
          <motion.div
            className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : centerContent ? (
          centerContent
        ) : (
          <motion.span
            className="w-4 h-4 rounded-full bg-white/80"
            whileHover={shouldReduceMotion ? {} : { scale: 1.2 }}
          />
        )}

        {/* Inner highlight */}
        <span
          className="absolute inset-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, white/20 0%, transparent 50%)',
          }}
        />
      </motion.button>

      {/* Outer decorative ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 30px 10px var(--color-fill-quaternary)',
        }}
      />
    </motion.div>
  );
}
```

### Step 2: Create Compact D-Pad Variant

```typescript
// src/components/organisms/CompactDPad/CompactDPad.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { springs } from '@/lib/motion';

type Direction = 'up' | 'down' | 'left' | 'right';

interface CompactDPadProps {
  onDirection: (direction: Direction) => void;
  onSelect: () => void;
  onLongPress?: (direction: Direction | 'select') => void;
  loadingDirection?: Direction | 'select' | null;
  className?: string;
}

export function CompactDPad({
  onDirection,
  onSelect,
  onLongPress,
  loadingDirection,
  className,
}: CompactDPadProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeDirection, setActiveDirection] = useState<Direction | 'select' | null>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = useCallback(
    (direction: Direction) => {
      setActiveDirection(direction);
      triggerHaptic('light');
      onDirection(direction);
      setTimeout(() => setActiveDirection(null), 150);
    },
    [onDirection, triggerHaptic]
  );

  const handleCenter = useCallback(() => {
    setActiveDirection('select');
    triggerHaptic('medium');
    onSelect();
    setTimeout(() => setActiveDirection(null), 150);
  }, [onSelect, triggerHaptic]);

  const DirectionButton = ({
    direction,
    Icon,
  }: {
    direction: Direction;
    Icon: typeof ChevronUp;
  }) => {
    const isActive = activeDirection === direction;
    const isLoading = loadingDirection === direction;

    return (
      <motion.button
        className={cn(
          'w-12 h-12 rounded-xl',
          'flex items-center justify-center',
          'bg-[var(--color-fill-primary)]',
          'border border-[var(--color-separator)]',
          'shadow-[var(--shadow-button)]',
          isActive && 'bg-[var(--color-accent-blue)]/20'
        )}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        transition={springs.button}
        onClick={() => handlePress(direction)}
        aria-label={`${direction} arrow`}
      >
        {isLoading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
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
    <div className={cn('grid grid-cols-3 gap-1 p-3', className)}>
      {/* Row 1 */}
      <div />
      <DirectionButton direction="up" Icon={ChevronUp} />
      <div />

      {/* Row 2 */}
      <DirectionButton direction="left" Icon={ChevronLeft} />

      {/* Center button */}
      <motion.button
        className={cn(
          'w-12 h-12 rounded-xl',
          'flex items-center justify-center',
          'bg-[var(--color-accent-blue)]',
          'shadow-[var(--shadow-glow-blue)]',
          activeDirection === 'select' && 'brightness-110'
        )}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
        transition={springs.button}
        onClick={handleCenter}
        aria-label="Select"
      >
        {loadingDirection === 'select' ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <Circle className="w-4 h-4 fill-white text-white" />
        )}
      </motion.button>

      <DirectionButton direction="right" Icon={ChevronRight} />

      {/* Row 3 */}
      <div />
      <DirectionButton direction="down" Icon={ChevronDown} />
      <div />
    </div>
  );
}
```

### Step 3: Create Touch Surface Overlay

```typescript
// src/components/organisms/TouchSurface/TouchSurface.tsx
'use client';

import { useRef, useCallback, useState } from 'react';
import { motion, type PanInfo, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

type Direction = 'up' | 'down' | 'left' | 'right';

interface TouchSurfaceProps {
  /** Called when a swipe direction is detected */
  onSwipe: (direction: Direction) => void;
  /** Called when the surface is tapped */
  onTap?: () => void;
  /** Called when the surface is double-tapped */
  onDoubleTap?: () => void;
  /** Minimum distance for swipe detection */
  swipeThreshold?: number;
  /** Show visual feedback for swipes */
  showFeedback?: boolean;
  /** Size of the touch surface */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-36 h-36',
  md: 'w-48 h-48',
  lg: 'w-60 h-60',
};

export function TouchSurface({
  onSwipe,
  onTap,
  onDoubleTap,
  swipeThreshold = 40,
  showFeedback = true,
  size = 'md',
  className,
}: TouchSurfaceProps) {
  const shouldReduceMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const lastTap = useRef(0);
  const [swipeDirection, setSwipeDirection] = useState<Direction | null>(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  const handlePanEnd = useCallback(
    (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const absX = Math.abs(offset.x);
      const absY = Math.abs(offset.y);

      // Need to move past threshold
      if (absX < swipeThreshold && absY < swipeThreshold) return;

      let direction: Direction;

      if (absX > absY) {
        direction = offset.x > 0 ? 'right' : 'left';
      } else {
        direction = offset.y > 0 ? 'down' : 'up';
      }

      // Show visual feedback
      if (showFeedback && !shouldReduceMotion) {
        setSwipeDirection(direction);
        setTimeout(() => setSwipeDirection(null), 200);
      }

      triggerHaptic('light');
      onSwipe(direction);
    },
    [swipeThreshold, showFeedback, shouldReduceMotion, triggerHaptic, onSwipe]
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap.current;

    if (timeSinceLastTap < 300 && onDoubleTap) {
      // Double tap
      triggerHaptic('medium');
      onDoubleTap();
    } else if (onTap) {
      // Single tap
      triggerHaptic('light');
      onTap();
    }

    lastTap.current = now;
  }, [onTap, onDoubleTap, triggerHaptic]);

  const handlePan = useCallback((e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setTouchPosition({ x: info.offset.x, y: info.offset.y });
  }, []);

  const getSwipeArrowRotation = (direction: Direction) => {
    switch (direction) {
      case 'up': return -90;
      case 'down': return 90;
      case 'left': return 180;
      case 'right': return 0;
    }
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-full',
        'bg-[var(--color-surface-glass)]',
        'backdrop-blur-xl',
        'border border-[var(--color-surface-glass-border)]',
        'shadow-[var(--shadow-glass)]',
        'cursor-pointer',
        'overflow-hidden',
        sizes[size],
        className
      )}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      onTap={handleTap}
      whileTap={{ scale: 0.98 }}
    >
      {/* Touch indicator dot */}
      <motion.div
        className="absolute w-12 h-12 rounded-full bg-white/10 pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
        }}
        animate={{
          x: touchPosition.x * 0.3 - 24,
          y: touchPosition.y * 0.3 - 24,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />

      {/* Direction feedback arrows */}
      {showFeedback && swipeDirection && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
        >
          <motion.svg
            className="w-12 h-12 text-[var(--color-accent-blue)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ rotate: getSwipeArrowRotation(swipeDirection) }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </motion.svg>
        </motion.div>
      )}

      {/* Surface texture */}
      <div
        className="absolute inset-0 rounded-full opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, transparent 0%, var(--color-text-primary) 100%)
          `,
        }}
      />

      {/* Ambient highlight */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 25%, white/15 0%, transparent 60%)',
        }}
      />
    </motion.div>
  );
}
```

### Step 4: Create Combined D-Pad with Quick Actions

```typescript
// src/components/organisms/NavigationCluster/NavigationCluster.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Grid3X3, Menu, Info, List } from 'lucide-react';
import { PremiumDPad } from '@/components/organisms/PremiumDPad';
import { PremiumIconButton } from '@/components/atoms/PremiumIconButton';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface NavigationClusterProps {
  onDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect: () => void;
  onBack: () => void;
  onApps: () => void;
  onMenu: () => void;
  onInfo: () => void;
  onGuide: () => void;
  loadingKey?: string | null;
  className?: string;
}

export function NavigationCluster({
  onDirection,
  onSelect,
  onBack,
  onApps,
  onMenu,
  onInfo,
  onGuide,
  loadingKey,
  className,
}: NavigationClusterProps) {
  const shouldReduceMotion = useReducedMotion();

  const quickActions = [
    { key: 'return', icon: ArrowLeft, label: 'Back', action: onBack },
    { key: 'apps', icon: Grid3X3, label: 'Apps', action: onApps },
    { key: 'menu', icon: Menu, label: 'Menu', action: onMenu },
    { key: 'info', icon: Info, label: 'Info', action: onInfo },
    { key: 'guide', icon: List, label: 'Guide', action: onGuide },
  ];

  return (
    <motion.div
      className={cn('flex flex-col items-center gap-6', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : springs.smooth}
    >
      {/* Main D-Pad */}
      <PremiumDPad
        onDirection={onDirection}
        onSelect={onSelect}
        loadingDirection={
          ['up', 'down', 'left', 'right', 'enter'].includes(loadingKey || '')
            ? (loadingKey as 'up' | 'down' | 'left' | 'right' | 'select')
            : null
        }
        size="lg"
      />

      {/* Quick action buttons */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.1 + index * 0.05,
            }}
          >
            <PremiumIconButton
              icon={<action.icon className="w-5 h-5" />}
              aria-label={action.label}
              variant="glass"
              size="md"
              onClick={action.action}
              loading={loadingKey === action.key}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
```

## Integration Points

### Files to Create

```
/src/components/organisms/PremiumDPad/PremiumDPad.tsx
/src/components/organisms/PremiumDPad/index.ts
/src/components/organisms/CompactDPad/CompactDPad.tsx
/src/components/organisms/TouchSurface/TouchSurface.tsx
/src/components/organisms/NavigationCluster/NavigationCluster.tsx
```

### Files to Modify

- Replace existing D-Pad implementation in TVRemote
- Update PS5Remote to use similar navigation pattern

## Technical Specifications

- **Touch Detection**: Pointer events for unified input handling
- **Swipe Detection**: PanInfo from Framer Motion with velocity checks
- **Visual Feedback**: CSS gradients and box shadows for depth
- **Accessibility**: ARIA labels, keyboard navigation support

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Success Criteria

1. Circular D-Pad renders with glass morphism effect
2. Direction buttons respond immediately to touch
3. Swipe gestures work naturally across the surface
4. Center button has prominent blue glow effect
5. Loading states show on individual directions
6. Long press detection works reliably
7. Quick action buttons are evenly spaced
8. Feels like Apple TV remote trackpad

## Estimated Effort

**Time**: 8-10 hours
**Complexity**: High
**Risk**: Medium

## Dependencies

- Requires Animation & Motion (Plan 03)
- Requires Button & Control Design (Plan 05)
- Required by TV Remote feature

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Touch accuracy on small screens | Medium | Increase button hit targets |
| Swipe conflicting with scroll | High | Contain gestures within D-Pad |
| Performance with many animations | Medium | Use transform-only animations |
| Accessibility challenges | Medium | Ensure keyboard alternative works |
