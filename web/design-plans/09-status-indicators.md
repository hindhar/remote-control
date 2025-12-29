# Plan 09: Status Indicators Design

**Focus**: Creating subtle, informative status indicators with connection states, pulsing animations, and ambient feedback that communicates system state elegantly.

## Key Decisions

1. **Traffic Light Semantics**: Use green/amber/red color system for connected/connecting/disconnected states, matching universal conventions.

2. **Subtle Pulse Animation**: Connected status shows a gentle breathing pulse to indicate "alive" state without being distracting.

3. **Contextual Information**: Status cards show device name, IP address, and current state with appropriate visual hierarchy.

4. **Inline Status Pills**: Small pill indicators can be embedded in headers or tab bars for at-a-glance status.

## Implementation Steps

### Step 1: Create Status Dot Component

```typescript
// src/components/atoms/StatusDot/StatusDot.tsx
'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline' | 'error';

interface StatusDotProps {
  /** Current connection status */
  status: ConnectionStatus;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show pulse animation for connected state */
  pulse?: boolean;
  /** Show outer ring */
  ring?: boolean;
  className?: string;
}

const statusColors: Record<ConnectionStatus, { bg: string; glow: string; ring: string }> = {
  connected: {
    bg: 'bg-[var(--color-accent-green)]',
    glow: 'hsla(142, 69%, 58%, 0.5)',
    ring: 'ring-[var(--color-accent-green)]/30',
  },
  connecting: {
    bg: 'bg-[var(--color-accent-orange)]',
    glow: 'hsla(28, 100%, 60%, 0.5)',
    ring: 'ring-[var(--color-accent-orange)]/30',
  },
  disconnected: {
    bg: 'bg-[var(--color-accent-red)]',
    glow: 'hsla(0, 100%, 67%, 0.5)',
    ring: 'ring-[var(--color-accent-red)]/30',
  },
  offline: {
    bg: 'bg-[var(--color-text-tertiary)]',
    glow: 'hsla(0, 0%, 50%, 0.3)',
    ring: 'ring-[var(--color-text-tertiary)]/30',
  },
  error: {
    bg: 'bg-[var(--color-accent-red)]',
    glow: 'hsla(0, 100%, 67%, 0.5)',
    ring: 'ring-[var(--color-accent-red)]/30',
  },
};

const sizeClasses = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const ringSizes = {
  xs: 'ring-2',
  sm: 'ring-2',
  md: 'ring-[3px]',
  lg: 'ring-4',
};

export function StatusDot({
  status,
  size = 'md',
  pulse = true,
  ring = false,
  className,
}: StatusDotProps) {
  const shouldReduceMotion = useReducedMotion();
  const colors = statusColors[status];
  const showPulse = pulse && status === 'connected' && !shouldReduceMotion;
  const showSpinner = status === 'connecting' && !shouldReduceMotion;

  const pulseVariants: Variants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const spinVariants: Variants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Pulse ring for connected state */}
      {showPulse && (
        <motion.span
          className={cn(
            'absolute rounded-full',
            colors.bg,
            sizeClasses[size]
          )}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          style={{ opacity: 0.4 }}
        />
      )}

      {/* Main dot */}
      <motion.span
        className={cn(
          'relative rounded-full',
          colors.bg,
          sizeClasses[size],
          ring && ringSizes[size],
          ring && colors.ring
        )}
        style={{
          boxShadow: `0 0 8px ${colors.glow}`,
        }}
        variants={showSpinner ? spinVariants : undefined}
        animate={showSpinner ? 'animate' : undefined}
      >
        {/* Inner highlight */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
          }}
        />

        {/* Connecting spinner overlay */}
        {showSpinner && (
          <motion.span
            className="absolute inset-0 rounded-full border-t border-white/50"
            style={{ borderRadius: '50%' }}
          />
        )}
      </motion.span>

      {/* Glow effect */}
      <span
        className={cn('absolute rounded-full blur-sm', colors.bg, sizeClasses[size])}
        style={{ opacity: 0.3 }}
      />
    </div>
  );
}
```

### Step 2: Create Status Badge Component

```typescript
// src/components/atoms/StatusBadge/StatusBadge.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { StatusDot } from '@/components/atoms/StatusDot';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline' | 'error';

interface StatusBadgeProps {
  /** Current connection status */
  status: ConnectionStatus;
  /** Optional label text */
  label?: string;
  /** Show status icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Variant style */
  variant?: 'pill' | 'inline' | 'minimal';
  className?: string;
}

const statusLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting',
  disconnected: 'Disconnected',
  offline: 'Offline',
  error: 'Error',
};

const statusIcons = {
  connected: Wifi,
  connecting: Loader2,
  disconnected: WifiOff,
  offline: WifiOff,
  error: AlertCircle,
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1',
    dot: 'xs' as const,
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1.5',
    dot: 'sm' as const,
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    icon: 'w-5 h-5',
    gap: 'gap-2',
    dot: 'md' as const,
  },
};

const variantStyles = {
  pill: `
    rounded-full
    bg-[var(--color-fill-secondary)]
    border border-[var(--color-separator)]
  `,
  inline: `
    rounded-lg
    bg-transparent
  `,
  minimal: `
    bg-transparent
  `,
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'md',
  variant = 'pill',
  className,
}: StatusBadgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = sizeConfig[size];
  const Icon = statusIcons[status];
  const displayLabel = label ?? statusLabels[status];

  return (
    <motion.div
      className={cn(
        'inline-flex items-center',
        config.padding,
        config.gap,
        variantStyles[variant],
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : springs.snappy}
    >
      {/* Status indicator */}
      {showIcon ? (
        <motion.span
          animate={status === 'connecting' && !shouldReduceMotion ? { rotate: 360 } : {}}
          transition={
            status === 'connecting'
              ? { duration: 1, repeat: Infinity, ease: 'linear' }
              : {}
          }
        >
          <Icon
            className={cn(
              config.icon,
              status === 'connected' && 'text-[var(--color-accent-green)]',
              status === 'connecting' && 'text-[var(--color-accent-orange)]',
              status === 'disconnected' && 'text-[var(--color-accent-red)]',
              status === 'offline' && 'text-[var(--color-text-tertiary)]',
              status === 'error' && 'text-[var(--color-accent-red)]'
            )}
          />
        </motion.span>
      ) : (
        <StatusDot status={status} size={config.dot} />
      )}

      {/* Label */}
      <span
        className={cn(
          config.text,
          'font-medium',
          status === 'connected' && 'text-[var(--color-accent-green)]',
          status === 'connecting' && 'text-[var(--color-accent-orange)]',
          status === 'disconnected' && 'text-[var(--color-accent-red)]',
          status === 'offline' && 'text-[var(--color-text-tertiary)]',
          status === 'error' && 'text-[var(--color-accent-red)]'
        )}
      >
        {displayLabel}
      </span>
    </motion.div>
  );
}
```

### Step 3: Create Connection Card Component

```typescript
// src/components/organisms/ConnectionCard/ConnectionCard.tsx
'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Power, RefreshCw, Sun, Tv, Cast, Gamepad } from 'lucide-react';
import { GlassCard } from '@/components/atoms/GlassCard';
import { StatusDot } from '@/components/atoms/StatusDot';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { PremiumButton } from '@/components/atoms/PremiumButton';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

type DeviceType = 'tv' | 'chromecast' | 'ps5';
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline';

interface ConnectionCardProps {
  /** Type of device */
  device: DeviceType;
  /** Device name */
  name: string;
  /** Device IP address */
  ip?: string;
  /** Connection status */
  connected: boolean;
  /** Currently connecting */
  connecting?: boolean;
  /** Called when connect is pressed */
  onConnect: () => void;
  /** Called when wake is pressed */
  onWake?: () => void;
  /** Additional status info */
  statusInfo?: string;
  /** Loading state */
  loading?: boolean;
  className?: string;
}

const deviceIcons = {
  tv: Tv,
  chromecast: Cast,
  ps5: Gamepad,
};

const deviceColors = {
  tv: 'var(--color-accent-blue)',
  chromecast: 'var(--color-accent-orange)',
  ps5: 'var(--color-accent-indigo)',
};

export function ConnectionCard({
  device,
  name,
  ip,
  connected,
  connecting = false,
  onConnect,
  onWake,
  statusInfo,
  loading = false,
  className,
}: ConnectionCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const DeviceIcon = deviceIcons[device];
  const deviceColor = deviceColors[device];

  const status: ConnectionStatus = connecting
    ? 'connecting'
    : connected
    ? 'connected'
    : 'disconnected';

  return (
    <GlassCard className={cn('overflow-hidden', className)}>
      <motion.div
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={springs.smooth}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Device info */}
          <div className="flex items-center gap-3">
            {/* Device icon with status indicator */}
            <div className="relative">
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${deviceColor}20`,
                }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              >
                <DeviceIcon
                  className="w-5 h-5"
                  style={{ color: deviceColor }}
                />
              </motion.div>

              {/* Status dot overlay */}
              <div className="absolute -bottom-0.5 -right-0.5">
                <StatusDot status={status} size="sm" pulse ring />
              </div>
            </div>

            {/* Device details */}
            <div className="flex flex-col">
              <span className="font-medium text-[var(--color-text-primary)]">
                {name}
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {ip || 'IP unknown'}
              </span>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Wake button (if available) */}
            {onWake && (
              <PremiumButton
                variant="ghost"
                size="sm"
                onClick={onWake}
                loading={loading}
                aria-label="Wake device"
              >
                <Sun className="w-4 h-4" />
              </PremiumButton>
            )}

            {/* Connect/Refresh button */}
            <PremiumButton
              variant={connected ? 'success' : 'primary'}
              size="sm"
              onClick={onConnect}
              loading={loading || connecting}
              aria-label={connected ? 'Refresh connection' : 'Connect'}
            >
              {connected ? (
                <RefreshCw className="w-4 h-4" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
            </PremiumButton>
          </div>
        </div>

        {/* Status info (optional) */}
        <AnimatePresence>
          {statusInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springs.smooth}
              className="mt-3 pt-3 border-t border-[var(--color-separator)]"
            >
              <span className="text-xs text-[var(--color-text-secondary)]">
                {statusInfo}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom status bar */}
      <motion.div
        className="h-1"
        style={{
          backgroundColor:
            status === 'connected'
              ? 'var(--color-accent-green)'
              : status === 'connecting'
              ? 'var(--color-accent-orange)'
              : 'var(--color-accent-red)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={springs.smooth}
        style={{ transformOrigin: 'left' }}
      />
    </GlassCard>
  );
}
```

### Step 4: Create Toast Notifications with Status

```typescript
// src/components/organisms/StatusToast/StatusToast.tsx
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, X, AlertCircle, Info, Wifi, WifiOff } from 'lucide-react';
import { StatusDot } from '@/components/atoms/StatusDot';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'connection';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  connectionStatus?: 'connected' | 'disconnected';
}

interface StatusToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const typeConfig = {
  success: {
    icon: Check,
    bg: 'bg-[var(--color-accent-green)]/10',
    border: 'border-[var(--color-accent-green)]/30',
    iconColor: 'text-[var(--color-accent-green)]',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-[var(--color-accent-red)]/10',
    border: 'border-[var(--color-accent-red)]/30',
    iconColor: 'text-[var(--color-accent-red)]',
  },
  info: {
    icon: Info,
    bg: 'bg-[var(--color-accent-blue)]/10',
    border: 'border-[var(--color-accent-blue)]/30',
    iconColor: 'text-[var(--color-accent-blue)]',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-[var(--color-accent-orange)]/10',
    border: 'border-[var(--color-accent-orange)]/30',
    iconColor: 'text-[var(--color-accent-orange)]',
  },
  connection: {
    icon: Wifi,
    bg: 'bg-[var(--color-surface-glass)]',
    border: 'border-[var(--color-surface-glass-border)]',
    iconColor: 'text-[var(--color-text-primary)]',
  },
};

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function StatusToast({
  toasts,
  onDismiss,
  position = 'top-right',
}: StatusToastProps) {
  const shouldReduceMotion = useReducedMotion();

  const getEntryAnimation = () => {
    if (position.includes('right')) return { x: 100, opacity: 0 };
    if (position.includes('center')) return { y: -20, opacity: 0, scale: 0.9 };
    return { x: -100, opacity: 0 };
  };

  const getExitAnimation = () => {
    if (position.includes('right')) return { x: 100, opacity: 0 };
    if (position.includes('center')) return { y: -10, opacity: 0, scale: 0.95 };
    return { x: -100, opacity: 0 };
  };

  return (
    <div
      className={cn(
        'fixed z-50',
        'flex flex-col gap-2',
        'max-w-sm w-full',
        'pointer-events-none',
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            entryAnimation={getEntryAnimation()}
            exitAnimation={getExitAnimation()}
            reduceMotion={shouldReduceMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
  entryAnimation,
  exitAnimation,
  reduceMotion,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  entryAnimation: object;
  exitAnimation: object;
  reduceMotion: boolean | null;
}) {
  const config = typeConfig[toast.type];
  const Icon =
    toast.type === 'connection'
      ? toast.connectionStatus === 'connected'
        ? Wifi
        : WifiOff
      : config.icon;

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={reduceMotion ? { opacity: 0 } : entryAnimation}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : exitAnimation}
      transition={springs.smooth}
      className={cn(
        'pointer-events-auto',
        'flex items-start gap-3 p-4',
        'rounded-[var(--radius-xl)]',
        'bg-[var(--color-surface-glass)]',
        'backdrop-blur-xl',
        'border',
        config.border,
        'shadow-[var(--shadow-glass)]'
      )}
      role="alert"
    >
      {/* Icon or status dot */}
      {toast.type === 'connection' ? (
        <StatusDot
          status={toast.connectionStatus === 'connected' ? 'connected' : 'disconnected'}
          size="md"
          pulse
        />
      ) : (
        <motion.span
          className={config.iconColor}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springs.bouncy}
        >
          <Icon className="w-5 h-5" />
        </motion.span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {toast.title}
          </p>
        )}
        <p className="text-sm text-[var(--color-text-secondary)]">
          {toast.message}
        </p>
      </div>

      {/* Dismiss button */}
      <motion.button
        onClick={() => onDismiss(toast.id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-full',
          'hover:bg-white/10',
          'transition-colors'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </motion.button>

      {/* Progress bar */}
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 h-0.5 rounded-full',
          config.iconColor.replace('text-', 'bg-')
        )}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{
          duration: (toast.duration ?? 4000) / 1000,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}
```

### Step 5: Create Header Status Indicator

```typescript
// src/components/molecules/HeaderStatus/HeaderStatus.tsx
'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Tv, Cast, Gamepad } from 'lucide-react';
import { StatusDot } from '@/components/atoms/StatusDot';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface DeviceStatus {
  type: 'tv' | 'chromecast' | 'ps5';
  connected: boolean;
  name?: string;
}

interface HeaderStatusProps {
  devices: DeviceStatus[];
  className?: string;
}

const deviceIcons = {
  tv: Tv,
  chromecast: Cast,
  ps5: Gamepad,
};

export function HeaderStatus({ devices, className }: HeaderStatusProps) {
  const shouldReduceMotion = useReducedMotion();
  const connectedCount = devices.filter((d) => d.connected).length;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-1.5',
        'px-2 py-1',
        'rounded-full',
        'bg-[var(--color-fill-secondary)]',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.smooth}
    >
      {devices.map((device) => {
        const Icon = deviceIcons[device.type];

        return (
          <motion.div
            key={device.type}
            className="relative"
            whileHover={{ scale: 1.1 }}
            title={`${device.name || device.type}: ${device.connected ? 'Connected' : 'Disconnected'}`}
          >
            <Icon
              className={cn(
                'w-4 h-4',
                device.connected
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-quaternary)]'
              )}
            />

            {/* Mini status dot */}
            <StatusDot
              status={device.connected ? 'connected' : 'disconnected'}
              size="xs"
              pulse={false}
              className="absolute -bottom-0.5 -right-0.5"
            />
          </motion.div>
        );
      })}

      {/* Connected count */}
      <span className="text-xs font-medium text-[var(--color-text-secondary)] ml-1">
        {connectedCount}/{devices.length}
      </span>
    </motion.div>
  );
}
```

## Integration Points

### Files to Create

```
/src/components/atoms/StatusDot/StatusDot.tsx
/src/components/atoms/StatusBadge/StatusBadge.tsx
/src/components/organisms/ConnectionCard/ConnectionCard.tsx
/src/components/organisms/StatusToast/StatusToast.tsx
/src/components/molecules/HeaderStatus/HeaderStatus.tsx
```

### Files to Modify

- Replace existing toast system with StatusToast
- Update TV/Chromecast/PS5 tabs to use ConnectionCard
- Add HeaderStatus to main layout

## Technical Specifications

- **Animation**: CSS animations for pulse, Framer Motion for transitions
- **Colors**: Semantic green/amber/red matching iOS conventions
- **Accessibility**: Status communicated via ARIA labels
- **Performance**: Hardware-accelerated transforms only

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Success Criteria

1. Status dots pulse subtly when connected
2. Connecting state shows spinning indicator
3. Toast notifications have smooth entry/exit
4. Progress bar on toasts shows remaining time
5. Connection cards show device-specific icons
6. Header status shows at-a-glance device states
7. All status changes are animated smoothly
8. Color semantics are consistent throughout

## Estimated Effort

**Time**: 4-6 hours
**Complexity**: Medium
**Risk**: Low

## Dependencies

- Requires Design System Foundation (Plan 01)
- Requires Animation & Motion (Plan 03)
- Required by all device tabs

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pulse animation being distracting | Low | Use very subtle opacity animation |
| Too many toasts stacking up | Medium | Limit max visible, auto-dismiss |
| Status not updating in real-time | Medium | Use WebSocket for live updates |
| Color-blind accessibility | Medium | Add icons alongside colors |
