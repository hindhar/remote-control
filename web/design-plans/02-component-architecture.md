# Plan 02: Component Architecture

**Focus**: Breaking down the ~1800 line monolithic page.tsx into a modular, maintainable component hierarchy with clear composition patterns and separation of concerns.

## Key Decisions

1. **Atomic Design Methodology**: Structure components following Atoms -> Molecules -> Organisms -> Templates pattern for maximum reusability.

2. **Colocation Strategy**: Keep component files, styles, types, and tests together in component folders rather than separate `/types`, `/styles` directories.

3. **Composition over Configuration**: Prefer component composition (children, render props) over complex prop drilling for flexibility.

4. **State Management Pattern**: Use React Context for global state (theme, connection status) with local component state for UI-specific concerns.

## Implementation Steps

### Step 1: Define Component Hierarchy

```
src/
  components/
    atoms/           # Smallest UI primitives
      Button/
        Button.tsx
        Button.types.ts
        index.ts
      Icon/
      Text/
      Badge/
      Toggle/
      Slider/

    molecules/       # Composed atoms with behavior
      IconButton/
      VolumeControl/
      StatusIndicator/
      TabItem/
      Toast/
      NumberPad/

    organisms/       # Complex feature components
      DPad/
      MediaControls/
      ConnectionCard/
      AppGrid/
      MacroCard/
      DeviceStatus/

    templates/       # Page-level layouts
      RemoteLayout/
      SettingsLayout/

    providers/       # Context providers
      ThemeProvider/
      ConnectionProvider/
      NotificationProvider/

  features/          # Feature-specific components
    tv/
      TVRemote/
      TVConnection/
      TVControls/
    chromecast/
      ChromecastRemote/
      ChromecastVolume/
      QuickCast/
    ps5/
      PS5Remote/
      PS5Navigation/
      PS5FaceButtons/
    apps/
      AppLauncher/
      AppCategory/
    macros/
      MacroList/
      MacroExecutor/
    settings/
      SettingsPanel/
      KeyboardShortcuts/

  hooks/             # Shared custom hooks
    useDebounce.ts
    useLocalStorage.ts
    useLongPress.ts
    useHapticFeedback.ts
    useConnection.ts

  lib/               # Utilities and configuration
    tv-config.ts
    api.ts

  types/             # Shared type definitions
    index.ts
```

### Step 2: Create Base Atom Components

**Button Component** (`/src/components/atoms/Button/Button.tsx`):

```typescript
// src/components/atoms/Button/Button.tsx
'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLongPress } from '@/hooks/useLongPress';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  /** Visual style variant */
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  /** Loading state */
  loading?: boolean;
  /** Long press handler */
  onLongPress?: () => void;
  /** Long press threshold in ms */
  longPressThreshold?: number;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Icon to display before children */
  leftIcon?: ReactNode;
  /** Icon to display after children */
  rightIcon?: ReactNode;
  /** Make button full width */
  fullWidth?: boolean;
  /** Rounded style */
  rounded?: 'default' | 'full' | 'none';
}

const buttonVariants = {
  default: `
    bg-[var(--color-fill-primary)]
    hover:bg-[var(--color-fill-secondary)]
    active:bg-[var(--color-fill-tertiary)]
    text-[var(--color-text-primary)]
    border-[var(--color-separator)]
  `,
  primary: `
    bg-[var(--color-accent-blue)]
    hover:brightness-110
    active:brightness-90
    text-white
    border-transparent
  `,
  secondary: `
    bg-[var(--color-surface-solid)]
    hover:bg-[var(--color-surface-solid-hover)]
    text-[var(--color-text-primary)]
    border-[var(--color-separator)]
  `,
  danger: `
    bg-[var(--color-accent-red)]
    hover:brightness-110
    active:brightness-90
    text-white
    border-transparent
  `,
  ghost: `
    bg-transparent
    hover:bg-[var(--color-fill-secondary)]
    active:bg-[var(--color-fill-tertiary)]
    text-[var(--color-text-primary)]
    border-transparent
  `,
  glass: `
    bg-[var(--color-surface-glass)]
    hover:bg-[var(--color-surface-glass-hover)]
    backdrop-blur-xl
    text-[var(--color-text-primary)]
    border-[var(--color-surface-glass-border)]
    shadow-[var(--shadow-glass)]
    hover:shadow-[var(--shadow-glass-hover)]
  `,
};

const sizeVariants = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2.5',
  xl: 'h-14 px-6 text-lg gap-3',
  icon: 'h-10 w-10 p-0',
};

const roundedVariants = {
  default: 'rounded-[var(--radius-button)]',
  full: 'rounded-full',
  none: 'rounded-none',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      onLongPress,
      longPressThreshold = 500,
      haptic = true,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = 'default',
      className,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { triggerHaptic } = useHapticFeedback();

    const longPressProps = useLongPress({
      onLongPress: () => {
        if (onLongPress) {
          if (haptic) triggerHaptic('medium');
          onLongPress();
        }
      },
      threshold: longPressThreshold,
    });

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) triggerHaptic('light');
      onClick?.(e);
    };

    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium',
          'border transition-all duration-[var(--duration-button)]',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-accent-blue)] focus-visible:ring-offset-2',
          'focus-visible:ring-offset-[var(--color-bg-primary)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variants
          buttonVariants[variant],
          sizeVariants[size],
          roundedVariants[rounded],
          // Conditional styles
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...(onLongPress ? longPressProps : {})}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner sub-component
function LoadingSpinner({ size }: { size: ButtonProps['size'] }) {
  const spinnerSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    icon: 'w-4 h-4',
  };

  return (
    <svg
      className={cn('animate-spin', spinnerSize[size || 'md'])}
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export { Button };
export type { ButtonProps };
```

**Button Types** (`/src/components/atoms/Button/Button.types.ts`):

```typescript
// src/components/atoms/Button/Button.types.ts
export type { ButtonProps } from './Button';
```

**Button Index** (`/src/components/atoms/Button/index.ts`):

```typescript
// src/components/atoms/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

### Step 3: Create Molecule Components

**IconButton Component** (`/src/components/molecules/IconButton/IconButton.tsx`):

```typescript
// src/components/molecules/IconButton/IconButton.tsx
'use client';

import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  /** Icon element to display */
  icon: ReactNode;
  /** Accessible label for screen readers */
  'aria-label': string;
  /** Optional label to show below icon */
  label?: string;
  /** Size of the icon button */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const buttonSizes = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
  xl: 'h-16 w-16',
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = 'md', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        rounded="full"
        className={cn(
          buttonSizes[size],
          label && 'flex-col gap-1 h-auto py-2',
          className
        )}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
        {label && (
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            {label}
          </span>
        )}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };
export type { IconButtonProps };
```

**VolumeControl Component** (`/src/components/molecules/VolumeControl/VolumeControl.tsx`):

```typescript
// src/components/molecules/VolumeControl/VolumeControl.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { IconButton } from '@/components/molecules/IconButton';
import { Slider } from '@/components/atoms/Slider';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface VolumeControlProps {
  /** Current volume level (0-100) */
  volume: number;
  /** Whether the audio is muted */
  muted: boolean;
  /** Called when volume changes */
  onVolumeChange: (volume: number) => void;
  /** Called when mute toggles */
  onMuteToggle: () => void;
  /** Called when volume up is pressed */
  onVolumeUp?: () => void;
  /** Called when volume down is pressed */
  onVolumeDown?: () => void;
  /** Show volume percentage label */
  showLabel?: boolean;
  /** Orientation of the slider */
  orientation?: 'horizontal' | 'vertical';
  /** Whether the controls are loading */
  loading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  onVolumeUp,
  onVolumeDown,
  showLabel = true,
  orientation = 'horizontal',
  loading = false,
  size = 'md',
  className,
}: VolumeControlProps) {
  const [localVolume, setLocalVolume] = useState(volume);
  const debouncedVolume = useDebounce(localVolume, 150);

  // Sync local volume with prop
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedVolume !== volume) {
      onVolumeChange(debouncedVolume);
    }
  }, [debouncedVolume, volume, onVolumeChange]);

  const getVolumeIcon = () => {
    if (muted || localVolume === 0) return VolumeX;
    if (localVolume < 33) return Volume;
    if (localVolume < 66) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        orientation === 'vertical' && 'flex-col',
        className
      )}
    >
      {/* Volume Down Button */}
      {onVolumeDown && (
        <IconButton
          icon={<Volume1 />}
          aria-label="Volume down"
          variant="ghost"
          size={size}
          onClick={onVolumeDown}
          loading={loading}
        />
      )}

      {/* Volume Slider */}
      <div className="flex-1 flex items-center gap-3 min-w-[120px]">
        <Slider
          value={[localVolume]}
          onValueChange={([val]) => setLocalVolume(val)}
          min={0}
          max={100}
          step={1}
          orientation={orientation}
          disabled={loading}
          className="flex-1"
        />

        {showLabel && (
          <motion.span
            key={localVolume}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-[var(--color-text-secondary)] w-10 text-center"
          >
            {localVolume}%
          </motion.span>
        )}
      </div>

      {/* Volume Up Button */}
      {onVolumeUp && (
        <IconButton
          icon={<Volume2 />}
          aria-label="Volume up"
          variant="ghost"
          size={size}
          onClick={onVolumeUp}
          loading={loading}
        />
      )}

      {/* Mute Button */}
      <IconButton
        icon={<VolumeIcon />}
        aria-label={muted ? 'Unmute' : 'Mute'}
        variant={muted ? 'danger' : 'ghost'}
        size={size}
        onClick={onMuteToggle}
        loading={loading}
      />
    </div>
  );
}
```

### Step 4: Create Organism Components

**DPad Component** (`/src/components/organisms/DPad/DPad.tsx`):

```typescript
// src/components/organisms/DPad/DPad.tsx
'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface DPadProps {
  /** Handler for direction press */
  onDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  /** Handler for center/select press */
  onSelect: () => void;
  /** Handler for long press on any direction */
  onLongPress?: (direction: 'up' | 'down' | 'left' | 'right' | 'select') => void;
  /** Currently loading direction */
  loadingDirection?: 'up' | 'down' | 'left' | 'right' | 'select' | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Center button content */
  centerContent?: React.ReactNode;
  /** Center button label */
  centerLabel?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-36 h-36',
    button: 'w-12 h-12',
    center: 'w-14 h-14',
    icon: 'w-5 h-5',
    gap: 'gap-1',
  },
  md: {
    container: 'w-48 h-48',
    button: 'w-14 h-14',
    center: 'w-16 h-16',
    icon: 'w-6 h-6',
    gap: 'gap-2',
  },
  lg: {
    container: 'w-60 h-60',
    button: 'w-16 h-16',
    center: 'w-20 h-20',
    icon: 'w-7 h-7',
    gap: 'gap-3',
  },
};

export function DPad({
  onDirection,
  onSelect,
  onLongPress,
  loadingDirection,
  size = 'md',
  centerContent,
  centerLabel = 'Select',
  className,
}: DPadProps) {
  const config = sizeConfig[size];

  const DirectionButton = ({
    direction,
    icon: Icon,
    position,
  }: {
    direction: 'up' | 'down' | 'left' | 'right';
    icon: typeof ChevronUp;
    position: string;
  }) => (
    <motion.div
      className={cn('absolute', position)}
      whileHover={{ scale: 1.05 }}
    >
      <Button
        variant="glass"
        rounded="full"
        className={cn(config.button, 'shadow-[var(--shadow-button)]')}
        onClick={() => onDirection(direction)}
        onLongPress={() => onLongPress?.(direction)}
        loading={loadingDirection === direction}
        aria-label={`${direction} arrow`}
      >
        <Icon className={config.icon} />
      </Button>
    </motion.div>
  );

  return (
    <motion.div
      className={cn(
        'relative',
        config.container,
        'bg-[var(--color-surface-glass)]',
        'backdrop-blur-xl',
        'rounded-full',
        'border border-[var(--color-surface-glass-border)]',
        'shadow-[var(--shadow-glass)]',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Outer ring glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle at center, transparent 60%, var(--color-fill-quaternary) 100%)',
        }}
      />

      {/* Up */}
      <DirectionButton
        direction="up"
        icon={ChevronUp}
        position="top-3 left-1/2 -translate-x-1/2"
      />

      {/* Down */}
      <DirectionButton
        direction="down"
        icon={ChevronDown}
        position="bottom-3 left-1/2 -translate-x-1/2"
      />

      {/* Left */}
      <DirectionButton
        direction="left"
        icon={ChevronLeft}
        position="left-3 top-1/2 -translate-y-1/2"
      />

      {/* Right */}
      <DirectionButton
        direction="right"
        icon={ChevronRight}
        position="right-3 top-1/2 -translate-y-1/2"
      />

      {/* Center Select Button */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="primary"
          rounded="full"
          className={cn(
            config.center,
            'shadow-[var(--shadow-button)]',
            'ring-4 ring-[var(--color-fill-quaternary)]'
          )}
          onClick={onSelect}
          onLongPress={() => onLongPress?.('select')}
          loading={loadingDirection === 'select'}
          aria-label={centerLabel}
        >
          {centerContent || (
            <span className="w-3 h-3 rounded-full bg-white/80" />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
```

### Step 5: Create Feature Components

**TVRemote Feature** (`/src/features/tv/TVRemote/TVRemote.tsx`):

```typescript
// src/features/tv/TVRemote/TVRemote.tsx
'use client';

import { useState, useCallback } from 'react';
import { Power, Home, MonitorPlay, Menu, Info, List, ArrowLeft, Grid3X3 } from 'lucide-react';
import { DPad } from '@/components/organisms/DPad';
import { VolumeControl } from '@/components/molecules/VolumeControl';
import { MediaControls } from '@/components/organisms/MediaControls';
import { ConnectionCard } from '@/components/organisms/ConnectionCard';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/molecules/IconButton';
import { GlassCard } from '@/components/atoms/GlassCard';
import { useTV } from '@/hooks/useTV';
import { useConnection } from '@/providers/ConnectionProvider';
import { cn } from '@/lib/utils';

interface TVRemoteProps {
  className?: string;
}

export function TVRemote({ className }: TVRemoteProps) {
  const { status, wsConnected } = useConnection();
  const {
    sendKey,
    wakeTV,
    connectTV,
    loading,
  } = useTV();

  const handleDirection = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    sendKey(direction);
  }, [sendKey]);

  const handleSelect = useCallback(() => {
    sendKey('enter');
  }, [sendKey]);

  const handleLongPress = useCallback((direction: string) => {
    sendKey(direction, { hold: true });
  }, [sendKey]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Connection Status */}
      <ConnectionCard
        device="tv"
        name={status?.name || 'Samsung TV'}
        ip={status?.ip}
        connected={wsConnected}
        onConnect={connectTV}
        onWake={wakeTV}
        loading={loading === 'connect' || loading === 'wake'}
      />

      {/* Power & Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="danger"
          className="flex-1"
          leftIcon={<Power className="w-5 h-5" />}
          onClick={() => sendKey('power')}
          loading={loading === 'power'}
        >
          Power
        </Button>
        <Button
          variant="glass"
          className="flex-1"
          leftIcon={<MonitorPlay className="w-5 h-5" />}
          onClick={() => sendKey('source')}
          loading={loading === 'source'}
        >
          Source
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          leftIcon={<Home className="w-5 h-5" />}
          onClick={() => sendKey('home')}
          loading={loading === 'home'}
        >
          Home
        </Button>
      </div>

      {/* D-Pad Navigation */}
      <GlassCard className="p-8 flex justify-center">
        <DPad
          onDirection={handleDirection}
          onSelect={handleSelect}
          onLongPress={handleLongPress}
          loadingDirection={
            ['up', 'down', 'left', 'right', 'enter'].includes(loading || '')
              ? (loading as 'up' | 'down' | 'left' | 'right' | 'select')
              : null
          }
          size="lg"
        />
      </GlassCard>

      {/* Quick Navigation */}
      <div className="flex justify-center gap-4">
        <IconButton
          icon={<ArrowLeft />}
          aria-label="Back"
          variant="glass"
          onClick={() => sendKey('return')}
          loading={loading === 'return'}
        />
        <IconButton
          icon={<Grid3X3 />}
          aria-label="Apps"
          variant="glass"
          onClick={() => sendKey('apps')}
          loading={loading === 'apps'}
        />
        <IconButton
          icon={<Menu />}
          aria-label="Menu"
          variant="glass"
          onClick={() => sendKey('menu')}
          loading={loading === 'menu'}
        />
        <IconButton
          icon={<Info />}
          aria-label="Info"
          variant="glass"
          onClick={() => sendKey('info')}
          loading={loading === 'info'}
        />
        <IconButton
          icon={<List />}
          aria-label="Guide"
          variant="glass"
          onClick={() => sendKey('guide')}
          loading={loading === 'guide'}
        />
      </div>

      {/* Volume & Channel Controls */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3 text-center">
            Volume
          </h3>
          <VolumeControl
            volume={50}
            muted={false}
            onVolumeChange={(vol) => {
              // Samsung TVs use key presses, not direct volume
            }}
            onVolumeUp={() => sendKey('volup')}
            onVolumeDown={() => sendKey('voldown')}
            onMuteToggle={() => sendKey('mute')}
            showLabel={false}
            orientation="vertical"
            loading={['volup', 'voldown', 'mute'].includes(loading || '')}
          />
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3 text-center">
            Channel
          </h3>
          {/* Channel controls... */}
        </GlassCard>
      </div>

      {/* Media Controls */}
      <GlassCard className="p-4">
        <h3 className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3 text-center">
          Media
        </h3>
        <MediaControls
          onPlay={() => sendKey('play')}
          onPause={() => sendKey('pause')}
          onStop={() => sendKey('stop')}
          onRewind={() => sendKey('rewind')}
          onFastForward={() => sendKey('ff')}
          onPrevious={() => sendKey('previous')}
          onNext={() => sendKey('next')}
          loading={loading}
        />
      </GlassCard>
    </div>
  );
}
```

### Step 6: Create Provider Components

**ConnectionProvider** (`/src/providers/ConnectionProvider/ConnectionProvider.tsx`):

```typescript
// src/providers/ConnectionProvider/ConnectionProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface TVStatus {
  name: string;
  ip: string;
  online: boolean;
}

interface ChromecastDevice {
  name: string;
  ip: string;
  app: string;
  volume: number;
  muted: boolean;
  standby: boolean;
}

interface PS5Status {
  online: boolean;
  status: string;
  name: string;
  running_app?: string;
  ip: string;
}

interface ConnectionContextValue {
  // TV
  tvStatus: TVStatus | null;
  wsConnected: boolean;

  // Chromecast
  chromecasts: ChromecastDevice[];
  activeChromecast: ChromecastDevice | null;

  // PS5
  ps5Status: PS5Status | null;

  // Actions
  refreshTV: () => Promise<void>;
  refreshChromecasts: () => Promise<void>;
  refreshPS5: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Loading states
  loading: boolean;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [tvStatus, setTvStatus] = useState<TVStatus | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [chromecasts, setChromecasts] = useState<ChromecastDevice[]>([]);
  const [ps5Status, setPs5Status] = useState<PS5Status | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshTV = useCallback(async () => {
    try {
      const [statusRes, connectRes] = await Promise.all([
        fetch('/api/tv/status'),
        fetch('/api/tv/connect'),
      ]);
      const statusData = await statusRes.json();
      const connectData = await connectRes.json();
      setTvStatus(statusData);
      setWsConnected(connectData.connected || false);
    } catch (error) {
      console.error('Failed to refresh TV status:', error);
    }
  }, []);

  const refreshChromecasts = useCallback(async () => {
    try {
      const res = await fetch('/api/chromecast/status');
      const data = await res.json();
      if (data.devices) {
        setChromecasts(data.devices);
      }
    } catch (error) {
      console.error('Failed to refresh Chromecast status:', error);
    }
  }, []);

  const refreshPS5 = useCallback(async () => {
    try {
      const res = await fetch('/api/ps5/status');
      const data = await res.json();
      setPs5Status(data);
    } catch (error) {
      console.error('Failed to refresh PS5 status:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([refreshTV(), refreshChromecasts(), refreshPS5()]);
    setLoading(false);
  }, [refreshTV, refreshChromecasts, refreshPS5]);

  // Initial fetch and polling
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 5000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <ConnectionContext.Provider
      value={{
        tvStatus,
        wsConnected,
        chromecasts,
        activeChromecast: chromecasts[0] || null,
        ps5Status,
        refreshTV,
        refreshChromecasts,
        refreshPS5,
        refreshAll,
        loading,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
```

## Integration Points

### Files to Create

```
/src/components/atoms/Button/Button.tsx
/src/components/atoms/Button/Button.types.ts
/src/components/atoms/Button/index.ts
/src/components/atoms/GlassCard/GlassCard.tsx
/src/components/atoms/Slider/Slider.tsx
/src/components/atoms/Text/Text.tsx
/src/components/atoms/Icon/Icon.tsx
/src/components/atoms/Badge/Badge.tsx
/src/components/atoms/Toggle/Toggle.tsx

/src/components/molecules/IconButton/IconButton.tsx
/src/components/molecules/VolumeControl/VolumeControl.tsx
/src/components/molecules/StatusIndicator/StatusIndicator.tsx
/src/components/molecules/TabItem/TabItem.tsx
/src/components/molecules/Toast/Toast.tsx

/src/components/organisms/DPad/DPad.tsx
/src/components/organisms/MediaControls/MediaControls.tsx
/src/components/organisms/ConnectionCard/ConnectionCard.tsx
/src/components/organisms/AppGrid/AppGrid.tsx

/src/features/tv/TVRemote/TVRemote.tsx
/src/features/chromecast/ChromecastRemote/ChromecastRemote.tsx
/src/features/ps5/PS5Remote/PS5Remote.tsx
/src/features/apps/AppLauncher/AppLauncher.tsx
/src/features/macros/MacroList/MacroList.tsx
/src/features/settings/SettingsPanel/SettingsPanel.tsx

/src/providers/ConnectionProvider/ConnectionProvider.tsx
/src/providers/ThemeProvider/ThemeProvider.tsx
/src/providers/NotificationProvider/NotificationProvider.tsx

/src/hooks/useLongPress.ts
/src/hooks/useHapticFeedback.ts
/src/hooks/useTV.ts
/src/hooks/useChromecast.ts
/src/hooks/usePS5.ts

/src/lib/utils.ts
```

### Files to Modify

- `/src/app/page.tsx` - Replace with composition of feature components
- `/src/app/layout.tsx` - Wrap with providers

### Barrel Exports

Create index files for clean imports:

```typescript
// /src/components/index.ts
export * from './atoms';
export * from './molecules';
export * from './organisms';

// /src/features/index.ts
export * from './tv';
export * from './chromecast';
export * from './ps5';
export * from './apps';
export * from './macros';
export * from './settings';

// /src/providers/index.ts
export * from './ConnectionProvider';
export * from './ThemeProvider';
export * from './NotificationProvider';

// /src/hooks/index.ts
export * from './useDebounce';
export * from './useLocalStorage';
export * from './useLongPress';
export * from './useHapticFeedback';
export * from './useConnection';
```

## Technical Specifications

- **Component Pattern**: Compound components with context for complex UI
- **Prop Types**: Strict TypeScript interfaces with JSDoc comments
- **Styling**: CSS custom properties with Tailwind utility classes
- **Animation**: Framer Motion for interactive feedback
- **Accessibility**: ARIA attributes, keyboard navigation, focus management

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

```typescript
// /src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Success Criteria

1. All components are self-contained with their types and styles
2. Component API is consistent across all atoms, molecules, and organisms
3. Props are fully typed with helpful JSDoc comments
4. Components are tree-shakeable for optimal bundle size
5. Unit tests can be written for each component in isolation
6. Storybook stories can document each component's variations
7. page.tsx reduced from ~1800 lines to ~100 lines

## Estimated Effort

**Time**: 16-20 hours
**Complexity**: High
**Risk**: Medium

## Dependencies

- Requires Design System Foundation (Plan 01)
- Required by all feature-specific plans
- Required for Animation & Motion (Plan 03)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing functionality during refactor | High | Implement gradually, feature-flag new components |
| Prop API inconsistencies between components | Medium | Define strict component API guidelines upfront |
| Over-abstraction leading to complexity | Medium | Follow "3 usages" rule before abstracting |
| Performance regression from component composition | Low | Profile render counts, use React.memo strategically |
