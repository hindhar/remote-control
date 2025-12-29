# Plan 07: Volume & Media Controls Design

**Focus**: Creating elegant slider designs and refined playback controls that match Apple's premium control aesthetics with fluid interactions.

## Key Decisions

1. **Vertical Volume Slider**: A tall, pill-shaped slider for volume control that's easy to manipulate with one thumb, inspired by iOS volume HUD.

2. **Unified Media Transport**: Play/pause/skip controls arranged in a horizontal cluster with prominent center play button and subtle secondary controls.

3. **Real-Time Visual Feedback**: Volume level shown both numerically and as a fill animation, with smooth interpolation between values.

4. **Haptic Detents**: Provide haptic feedback at key volume levels (0%, 50%, 100%) to give tactile landmarks.

## Implementation Steps

### Step 1: Create Premium Volume Slider

```typescript
// src/components/molecules/PremiumVolumeSlider/PremiumVolumeSlider.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useDebounce } from '@/hooks/useDebounce';
import { springs } from '@/lib/motion';

interface PremiumVolumeSliderProps {
  /** Current volume value (0-100) */
  value: number;
  /** Called when volume changes */
  onChange: (value: number) => void;
  /** Whether audio is muted */
  muted?: boolean;
  /** Called when mute is toggled */
  onMuteToggle?: () => void;
  /** Orientation of the slider */
  orientation?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show volume level label */
  showLabel?: boolean;
  /** Show volume icon */
  showIcon?: boolean;
  /** Enable haptic feedback at detents */
  hapticDetents?: boolean;
  /** Debounce delay for onChange */
  debounceMs?: number;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    track: { width: 6, height: 120 },
    thumb: 18,
    icon: 18,
    padding: 12,
  },
  md: {
    track: { width: 8, height: 160 },
    thumb: 24,
    icon: 22,
    padding: 16,
  },
  lg: {
    track: { width: 10, height: 200 },
    thumb: 28,
    icon: 26,
    padding: 20,
  },
};

// Detent values for haptic feedback
const DETENT_VALUES = [0, 25, 50, 75, 100];
const DETENT_THRESHOLD = 3;

export function PremiumVolumeSlider({
  value,
  onChange,
  muted = false,
  onMuteToggle,
  orientation = 'vertical',
  size = 'md',
  showLabel = true,
  showIcon = true,
  hapticDetents = true,
  debounceMs = 100,
  disabled = false,
  className,
}: PremiumVolumeSliderProps) {
  const shouldReduceMotion = useReducedMotion();
  const { triggerHaptic } = useHapticFeedback();
  const config = sizeConfig[size];
  const trackRef = useRef<HTMLDivElement>(null);

  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const lastDetent = useRef(-1);

  const debouncedValue = useDebounce(localValue, debounceMs);

  // Sync external value changes
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  // Emit debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Check for detent and trigger haptic
  const checkDetent = useCallback(
    (newValue: number) => {
      if (!hapticDetents) return;

      for (const detent of DETENT_VALUES) {
        if (
          Math.abs(newValue - detent) <= DETENT_THRESHOLD &&
          lastDetent.current !== detent
        ) {
          triggerHaptic('light');
          lastDetent.current = detent;
          return;
        }
      }

      // Reset detent if we've moved away
      const currentDetent = DETENT_VALUES.find(
        (d) => Math.abs(newValue - d) <= DETENT_THRESHOLD
      );
      if (!currentDetent) {
        lastDetent.current = -1;
      }
    },
    [hapticDetents, triggerHaptic]
  );

  // Calculate value from position
  const calculateValue = useCallback(
    (clientY: number, clientX: number) => {
      if (!trackRef.current) return localValue;

      const rect = trackRef.current.getBoundingClientRect();
      let percentage: number;

      if (orientation === 'vertical') {
        // Inverted for natural feel (drag up = increase)
        percentage = 1 - (clientY - rect.top) / rect.height;
      } else {
        percentage = (clientX - rect.left) / rect.width;
      }

      const newValue = Math.round(Math.max(0, Math.min(100, percentage * 100)));
      return newValue;
    },
    [orientation, localValue]
  );

  // Handle drag
  const handlePan = useCallback(
    (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled) return;

      const event = e as unknown as { clientX: number; clientY: number };
      const newValue = calculateValue(event.clientY, event.clientX);
      setLocalValue(newValue);
      checkDetent(newValue);
    },
    [calculateValue, checkDetent, disabled]
  );

  // Handle tap/click on track
  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      const newValue = calculateValue(e.clientY, e.clientX);
      setLocalValue(newValue);
      triggerHaptic('light');
    },
    [calculateValue, triggerHaptic, disabled]
  );

  // Get appropriate volume icon
  const getVolumeIcon = () => {
    if (muted || localValue === 0) return VolumeX;
    if (localValue < 33) return Volume;
    if (localValue < 66) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  // Animation values
  const fillHeight = useSpring(localValue, springs.snappy);
  const thumbY = useTransform(fillHeight, [0, 100], ['100%', '0%']);

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex items-center gap-4',
        isVertical && 'flex-col',
        className
      )}
    >
      {/* Volume icon / mute button */}
      {showIcon && (
        <motion.button
          className={cn(
            'flex items-center justify-center',
            'rounded-full p-2',
            'bg-[var(--color-fill-secondary)]',
            'hover:bg-[var(--color-fill-primary)]',
            'transition-colors',
            muted && 'text-[var(--color-accent-red)]'
          )}
          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
          onClick={onMuteToggle}
          aria-label={muted ? 'Unmute' : 'Mute'}
          disabled={disabled}
        >
          <VolumeIcon style={{ width: config.icon, height: config.icon }} />
        </motion.button>
      )}

      {/* Slider track */}
      <div
        ref={trackRef}
        className={cn(
          'relative rounded-full',
          'bg-[var(--color-fill-tertiary)]',
          'overflow-hidden cursor-pointer',
          isVertical ? 'h-full' : 'w-full',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          width: isVertical ? config.track.width : '100%',
          height: isVertical ? config.track.height : config.track.width,
        }}
        onClick={handleTrackClick}
      >
        {/* Fill */}
        <motion.div
          className={cn(
            'absolute rounded-full',
            'bg-[var(--color-accent-blue)]',
            isVertical ? 'left-0 right-0 bottom-0' : 'left-0 top-0 bottom-0'
          )}
          style={{
            height: isVertical ? `${localValue}%` : '100%',
            width: isVertical ? '100%' : `${localValue}%`,
          }}
        >
          {/* Gradient overlay for depth */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: isVertical
                ? 'linear-gradient(to right, transparent 0%, white/20 50%, transparent 100%)'
                : 'linear-gradient(to bottom, transparent 0%, white/20 50%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute rounded-full bg-white shadow-lg',
            'cursor-grab active:cursor-grabbing'
          )}
          style={{
            width: config.thumb,
            height: config.thumb,
            left: isVertical
              ? `calc(50% - ${config.thumb / 2}px)`
              : `calc(${localValue}% - ${config.thumb / 2}px)`,
            bottom: isVertical
              ? `calc(${localValue}% - ${config.thumb / 2}px)`
              : `calc(50% - ${config.thumb / 2}px)`,
          }}
          drag={isVertical ? 'y' : 'x'}
          dragConstraints={trackRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDrag={handlePan}
          onDragEnd={() => setIsDragging(false)}
          whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
          whileDrag={{ scale: 1.15 }}
        >
          {/* Inner highlight */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, white 0%, transparent 60%)',
            }}
          />
        </motion.div>

        {/* Detent markers */}
        {hapticDetents &&
          DETENT_VALUES.slice(1, -1).map((detent) => (
            <div
              key={detent}
              className="absolute bg-white/20 rounded-full"
              style={
                isVertical
                  ? {
                      left: '25%',
                      right: '25%',
                      height: 2,
                      bottom: `${detent}%`,
                    }
                  : {
                      top: '25%',
                      bottom: '25%',
                      width: 2,
                      left: `${detent}%`,
                    }
              }
            />
          ))}
      </div>

      {/* Volume label */}
      {showLabel && (
        <motion.span
          className="text-sm font-medium text-[var(--color-text-secondary)] tabular-nums"
          key={localValue}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {localValue}%
        </motion.span>
      )}
    </div>
  );
}
```

### Step 2: Create Media Transport Controls

```typescript
// src/components/organisms/MediaTransport/MediaTransport.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
} from 'lucide-react';
import { PremiumButton } from '@/components/atoms/PremiumButton';
import { PremiumIconButton } from '@/components/atoms/PremiumIconButton';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface MediaTransportProps {
  /** Current playback state */
  isPlaying?: boolean;
  /** Called when play is pressed */
  onPlay: () => void;
  /** Called when pause is pressed */
  onPause: () => void;
  /** Called when stop is pressed */
  onStop?: () => void;
  /** Called when rewind is pressed */
  onRewind?: () => void;
  /** Called when fast forward is pressed */
  onFastForward?: () => void;
  /** Called when skip back is pressed */
  onSkipBack?: () => void;
  /** Called when skip forward is pressed */
  onSkipForward?: () => void;
  /** Currently loading action */
  loadingAction?: string | null;
  /** Show all controls or minimal set */
  variant?: 'full' | 'compact';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    primary: { size: 48, icon: 24 },
    secondary: { size: 40, icon: 18 },
    tertiary: { size: 36, icon: 16 },
  },
  md: {
    primary: { size: 56, icon: 28 },
    secondary: { size: 44, icon: 20 },
    tertiary: { size: 40, icon: 18 },
  },
  lg: {
    primary: { size: 64, icon: 32 },
    secondary: { size: 48, icon: 22 },
    tertiary: { size: 44, icon: 20 },
  },
};

export function MediaTransport({
  isPlaying = false,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onFastForward,
  onSkipBack,
  onSkipForward,
  loadingAction,
  variant = 'full',
  size = 'md',
  className,
}: MediaTransportProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = sizeConfig[size];

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const renderSecondaryButton = (
    key: string,
    Icon: typeof Play,
    label: string,
    onClick?: () => void,
    loading = false
  ) => (
    <motion.div variants={itemVariants} key={key}>
      <PremiumIconButton
        icon={<Icon style={{ width: config.secondary.icon, height: config.secondary.icon }} />}
        aria-label={label}
        variant="glass"
        onClick={onClick}
        loading={loading}
        disabled={!onClick}
        style={{
          width: config.secondary.size,
          height: config.secondary.size,
        }}
      />
    </motion.div>
  );

  const renderTertiaryButton = (
    key: string,
    Icon: typeof Play,
    label: string,
    onClick?: () => void,
    loading = false
  ) => (
    <motion.div variants={itemVariants} key={key}>
      <PremiumIconButton
        icon={<Icon style={{ width: config.tertiary.icon, height: config.tertiary.icon }} />}
        aria-label={label}
        variant="ghost"
        onClick={onClick}
        loading={loading}
        disabled={!onClick}
        style={{
          width: config.tertiary.size,
          height: config.tertiary.size,
        }}
      />
    </motion.div>
  );

  return (
    <motion.div
      className={cn('flex items-center justify-center gap-3', className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Rewind (full only) */}
      {variant === 'full' && onRewind && (
        renderTertiaryButton('rewind', Rewind, 'Rewind', onRewind, loadingAction === 'rewind')
      )}

      {/* Skip Back */}
      {(variant === 'full' || onSkipBack) && onSkipBack && (
        renderSecondaryButton('skipBack', SkipBack, 'Previous', onSkipBack, loadingAction === 'previous')
      )}

      {/* Play/Pause - Primary button */}
      <motion.div variants={itemVariants}>
        <motion.button
          className={cn(
            'flex items-center justify-center',
            'rounded-full',
            'bg-[var(--color-accent-blue)]',
            'text-white',
            'shadow-[var(--shadow-glow-blue)]',
            'transition-shadow duration-200',
            'focus:outline-none focus-visible:ring-2',
            'focus-visible:ring-white focus-visible:ring-offset-2',
            'focus-visible:ring-offset-[var(--color-bg-primary)]',
            'disabled:opacity-50'
          )}
          style={{
            width: config.primary.size,
            height: config.primary.size,
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
          onClick={isPlaying ? onPause : onPlay}
          disabled={loadingAction === 'play' || loadingAction === 'pause'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {loadingAction === 'play' || loadingAction === 'pause' ? (
            <motion.div
              className="border-2 border-white/40 border-t-white rounded-full"
              style={{
                width: config.primary.icon * 0.8,
                height: config.primary.icon * 0.8,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ) : isPlaying ? (
            <Pause
              style={{ width: config.primary.icon, height: config.primary.icon }}
              fill="currentColor"
            />
          ) : (
            <Play
              style={{ width: config.primary.icon, height: config.primary.icon }}
              fill="currentColor"
            />
          )}

          {/* Inner highlight */}
          <span
            className="absolute inset-2 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, white/25 0%, transparent 50%)',
            }}
          />
        </motion.button>
      </motion.div>

      {/* Skip Forward */}
      {(variant === 'full' || onSkipForward) && onSkipForward && (
        renderSecondaryButton('skipForward', SkipForward, 'Next', onSkipForward, loadingAction === 'next')
      )}

      {/* Fast Forward (full only) */}
      {variant === 'full' && onFastForward && (
        renderTertiaryButton('fastForward', FastForward, 'Fast Forward', onFastForward, loadingAction === 'ff')
      )}

      {/* Stop (full only) */}
      {variant === 'full' && onStop && (
        <motion.div variants={itemVariants}>
          <PremiumIconButton
            icon={<Square style={{ width: config.tertiary.icon - 2, height: config.tertiary.icon - 2 }} />}
            aria-label="Stop"
            variant="danger"
            onClick={onStop}
            loading={loadingAction === 'stop'}
            style={{
              width: config.tertiary.size,
              height: config.tertiary.size,
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
```

### Step 3: Create Combined Volume/Media Card

```typescript
// src/components/organisms/MediaControlCard/MediaControlCard.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { GlassCard } from '@/components/atoms/GlassCard';
import { PremiumVolumeSlider } from '@/components/molecules/PremiumVolumeSlider';
import { MediaTransport } from '@/components/organisms/MediaTransport';
import { PremiumButton } from '@/components/atoms/PremiumButton';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface MediaControlCardProps {
  /** Section title */
  title?: string;
  /** Volume value (0-100) */
  volume?: number;
  /** Volume muted state */
  muted?: boolean;
  /** Called when volume changes */
  onVolumeChange?: (value: number) => void;
  /** Called when mute toggles */
  onMuteToggle?: () => void;
  /** Called when volume up is pressed */
  onVolumeUp?: () => void;
  /** Called when volume down is pressed */
  onVolumeDown?: () => void;
  /** Media transport props */
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onRewind?: () => void;
  onFastForward?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  isPlaying?: boolean;
  /** Currently loading action */
  loadingAction?: string | null;
  /** Show volume controls */
  showVolume?: boolean;
  /** Show media controls */
  showMedia?: boolean;
  /** Layout variant */
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export function MediaControlCard({
  title = 'Media',
  volume = 50,
  muted = false,
  onVolumeChange,
  onMuteToggle,
  onVolumeUp,
  onVolumeDown,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onFastForward,
  onSkipBack,
  onSkipForward,
  isPlaying,
  loadingAction,
  showVolume = true,
  showMedia = true,
  layout = 'horizontal',
  className,
}: MediaControlCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const isVertical = layout === 'vertical';

  return (
    <GlassCard className={cn('overflow-hidden', className)}>
      {/* Header */}
      {title && (
        <div className="px-4 pt-3 pb-2">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider text-center">
            {title}
          </h3>
        </div>
      )}

      <div
        className={cn(
          'p-4',
          isVertical ? 'flex flex-col gap-6' : 'flex gap-6 items-center'
        )}
      >
        {/* Volume controls */}
        {showVolume && (
          <motion.div
            className={cn(
              'flex items-center gap-3',
              isVertical && 'justify-center'
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : springs.smooth}
          >
            {/* Volume down button */}
            {onVolumeDown && (
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={onVolumeDown}
                loading={loadingAction === 'voldown'}
                aria-label="Volume down"
              >
                <Volume2 className="w-4 h-4" />
              </PremiumButton>
            )}

            {/* Volume slider */}
            {onVolumeChange && (
              <PremiumVolumeSlider
                value={volume}
                onChange={onVolumeChange}
                muted={muted}
                onMuteToggle={onMuteToggle}
                orientation="horizontal"
                size="sm"
                showIcon={false}
                showLabel
                className="flex-1 min-w-[120px]"
              />
            )}

            {/* Volume up button */}
            {onVolumeUp && (
              <PremiumButton
                variant="glass"
                size="sm"
                onClick={onVolumeUp}
                loading={loadingAction === 'volup'}
                aria-label="Volume up"
              >
                <Volume2 className="w-5 h-5" />
              </PremiumButton>
            )}

            {/* Mute button */}
            {onMuteToggle && !onVolumeChange && (
              <PremiumButton
                variant={muted ? 'danger' : 'glass'}
                size="sm"
                onClick={onMuteToggle}
                loading={loadingAction === 'mute'}
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </PremiumButton>
            )}
          </motion.div>
        )}

        {/* Separator */}
        {showVolume && showMedia && (
          <div
            className={cn(
              'bg-[var(--color-separator)]',
              isVertical ? 'h-px w-full' : 'w-px h-12'
            )}
          />
        )}

        {/* Media transport */}
        {showMedia && onPlay && onPause && (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { ...springs.smooth, delay: 0.1 }}
          >
            <MediaTransport
              isPlaying={isPlaying}
              onPlay={onPlay}
              onPause={onPause}
              onStop={onStop}
              onRewind={onRewind}
              onFastForward={onFastForward}
              onSkipBack={onSkipBack}
              onSkipForward={onSkipForward}
              loadingAction={loadingAction}
              variant="full"
              size="sm"
            />
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
```

### Step 4: Create Channel Control Component

```typescript
// src/components/molecules/ChannelControl/ChannelControl.tsx
'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { PremiumButton } from '@/components/atoms/PremiumButton';
import { GlassCard } from '@/components/atoms/GlassCard';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface ChannelControlProps {
  /** Called when channel up is pressed */
  onChannelUp: () => void;
  /** Called when channel down is pressed */
  onChannelDown: () => void;
  /** Called when previous channel is pressed */
  onPreviousChannel?: () => void;
  /** Currently loading action */
  loadingAction?: string | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { button: 'h-10', icon: 'w-4 h-4', text: 'text-xs' },
  md: { button: 'h-12', icon: 'w-5 h-5', text: 'text-sm' },
  lg: { button: 'h-14', icon: 'w-6 h-6', text: 'text-base' },
};

export function ChannelControl({
  onChannelUp,
  onChannelDown,
  onPreviousChannel,
  loadingAction,
  size = 'md',
  className,
}: ChannelControlProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = sizeConfig[size];

  return (
    <GlassCard className={cn('p-4', className)}>
      <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider text-center mb-3">
        Channel
      </h3>

      <div className="flex flex-col gap-2">
        <PremiumButton
          variant="glass"
          className={cn('w-full', config.button)}
          onClick={onChannelUp}
          loading={loadingAction === 'chup'}
          aria-label="Channel up"
        >
          <ChevronUp className={config.icon} />
        </PremiumButton>

        {onPreviousChannel && (
          <PremiumButton
            variant="default"
            className={cn('w-full', config.button)}
            onClick={onPreviousChannel}
            loading={loadingAction === 'prech'}
            aria-label="Previous channel"
          >
            <ArrowLeftRight className={config.icon} />
            <span className={config.text}>Prev</span>
          </PremiumButton>
        )}

        <PremiumButton
          variant="glass"
          className={cn('w-full', config.button)}
          onClick={onChannelDown}
          loading={loadingAction === 'chdown'}
          aria-label="Channel down"
        >
          <ChevronDown className={config.icon} />
        </PremiumButton>
      </div>
    </GlassCard>
  );
}
```

### Step 5: Create Number Pad Component

```typescript
// src/components/organisms/NumberPad/NumberPad.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PremiumButton } from '@/components/atoms/PremiumButton';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface NumberPadProps {
  /** Called when a number is pressed */
  onNumber: (number: string) => void;
  /** Called when dash is pressed */
  onDash?: () => void;
  /** Called when previous channel is pressed */
  onPrevChannel?: () => void;
  /** Currently loading key */
  loadingKey?: string | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { button: 'h-10 w-10', text: 'text-lg' },
  md: { button: 'h-12 w-12', text: 'text-xl' },
  lg: { button: 'h-14 w-14', text: 'text-2xl' },
};

export function NumberPad({
  onNumber,
  onDash,
  onPrevChannel,
  loadingKey,
  size = 'md',
  className,
}: NumberPadProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = sizeConfig[size];

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['dash', '0', 'prech'],
  ];

  const getKeyLabel = (key: string) => {
    if (key === 'dash') return '-';
    if (key === 'prech') return 'Pre';
    return key;
  };

  const getKeyHandler = (key: string) => {
    if (key === 'dash') return onDash;
    if (key === 'prech') return onPrevChannel;
    return () => onNumber(key);
  };

  return (
    <motion.div
      className={cn('grid grid-cols-3 gap-2', className)}
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.03,
          },
        },
      }}
    >
      {keys.flat().map((key) => (
        <motion.div
          key={key}
          variants={{
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
          }}
          transition={springs.snappy}
        >
          <PremiumButton
            variant="glass"
            rounded="lg"
            className={cn(
              config.button,
              'aspect-square justify-center',
              key === 'prech' && 'text-sm'
            )}
            onClick={getKeyHandler(key)}
            loading={loadingKey === key}
            aria-label={
              key === 'dash'
                ? 'Dash'
                : key === 'prech'
                ? 'Previous channel'
                : `Number ${key}`
            }
          >
            <span className={cn('font-bold', key !== 'prech' && config.text)}>
              {getKeyLabel(key)}
            </span>
          </PremiumButton>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## Integration Points

### Files to Create

```
/src/components/molecules/PremiumVolumeSlider/PremiumVolumeSlider.tsx
/src/components/molecules/ChannelControl/ChannelControl.tsx
/src/components/organisms/MediaTransport/MediaTransport.tsx
/src/components/organisms/MediaControlCard/MediaControlCard.tsx
/src/components/organisms/NumberPad/NumberPad.tsx
```

### Files to Modify

- TV Remote to use new volume and media components
- Chromecast Remote for volume slider
- Replace existing number pad implementation

## Technical Specifications

- **Slider Interaction**: Pointer events with drag constraints from Framer Motion
- **Debouncing**: Volume changes debounced to reduce API calls
- **Haptic Detents**: Feedback at 0%, 25%, 50%, 75%, 100% levels
- **Accessibility**: ARIA roles, keyboard control for sliders

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Success Criteria

1. Volume slider has smooth, responsive dragging
2. Haptic feedback triggers at volume detents
3. Play/pause button is prominent with blue glow
4. All transport controls have consistent styling
5. Number pad has staggered reveal animation
6. Loading states work on all interactive elements
7. Volume changes are debounced appropriately
8. Controls feel responsive and Apple-quality

## Estimated Effort

**Time**: 6-8 hours
**Complexity**: Medium
**Risk**: Low

## Dependencies

- Requires Animation & Motion (Plan 03)
- Requires Button & Control Design (Plan 05)
- Required by TV Remote and Chromecast features

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slider precision on small screens | Medium | Increase thumb size, add momentum |
| Too many API calls from volume | Medium | Debounce value changes |
| Haptic feedback not supported | Low | Silent fallback when unavailable |
| Transport layout breaking at sizes | Low | Responsive gap and size adjustments |
