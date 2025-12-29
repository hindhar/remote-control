'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springConfigs } from '@/styles/tokens';
import { useHaptics } from '@/hooks/useHaptics';
import { useLongPress } from '@/hooks/useLongPress';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface DPadProps {
  onDirection: (direction: Direction) => void;
  onSelect: () => void;
  onLongPress?: (direction: Direction | 'select') => void;
  loadingDirection?: Direction | 'select' | null;
  size?: 'sm' | 'md' | 'lg';
  centerContent?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 180,
    button: 48,
    center: 60,
    icon: 20,
    offset: 12,
  },
  md: {
    container: 220,
    button: 52,
    center: 68,
    icon: 22,
    offset: 16,
  },
  lg: {
    container: 260,
    button: 58,
    center: 76,
    icon: 26,
    offset: 20,
  },
};

interface DirectionButtonProps {
  direction: Direction;
  icon: typeof ChevronUp;
  style: React.CSSProperties;
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  onLongPress?: () => void;
  loading: boolean;
  disabled?: boolean;
}

const DirectionButton = ({
  direction,
  icon: Icon,
  style,
  size,
  onClick,
  onLongPress,
  loading,
  disabled,
}: DirectionButtonProps) => {
  const config = sizeConfig[size];
  const { triggerHaptic } = useHaptics();

  const longPressProps = useLongPress({
    onLongPress: () => {
      if (onLongPress) {
        triggerHaptic('medium');
        onLongPress();
      }
    },
    threshold: 400,
  });

  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.button
      className={cn(
        'absolute flex items-center justify-center',
        'rounded-full',
        'transition-all duration-150',
        'active:scale-95',
        'focus-visible:ring-2 focus-visible:ring-[hsl(211,100%,50%)]',
        'disabled:opacity-30 disabled:pointer-events-none'
      )}
      style={{
        ...style,
        width: config.button,
        height: config.button,
        background: 'hsla(0,0%,0%,0.05)',
        border: '1px solid hsla(0,0%,0%,0.08)',
        color: 'hsl(0,0%,30%)',
      }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ background: 'hsla(0,0%,0%,0.08)' }}
      transition={springConfigs.snappy}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={`${direction} arrow`}
      {...(onLongPress ? longPressProps : {})}
    >
      {loading ? (
        <div
          className="border-2 border-current border-t-transparent rounded-full animate-spin"
          style={{ width: config.icon * 0.8, height: config.icon * 0.8 }}
        />
      ) : (
        <Icon style={{ width: config.icon, height: config.icon }} strokeWidth={2.5} />
      )}
    </motion.button>
  );
};

const DPad = forwardRef<HTMLDivElement, DPadProps>(
  (
    {
      onDirection,
      onSelect,
      onLongPress,
      loadingDirection,
      size = 'md',
      centerContent,
      disabled,
      className,
    },
    ref
  ) => {
    const config = sizeConfig[size];
    const { triggerHaptic } = useHaptics();

    const centerLongPressProps = useLongPress({
      onLongPress: () => {
        if (onLongPress) {
          triggerHaptic('heavy');
          onLongPress('select');
        }
      },
      threshold: 400,
    });

    const handleSelect = () => {
      triggerHaptic('medium');
      onSelect();
    };

    // Calculate center position
    const center = config.container / 2;

    return (
      <motion.div
        ref={ref}
        className={cn('relative', className)}
        style={{
          width: config.container,
          height: config.container,
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springConfigs.gentle}
      >
        {/* Outer ring - premium light glass effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(145deg, hsla(0,0%,100%,0.9) 0%, hsla(0,0%,96%,0.95) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid hsla(0,0%,0%,0.08)',
            boxShadow: `
              0 4px 24px hsla(0,0%,0%,0.1),
              0 1px 3px hsla(0,0%,0%,0.08),
              inset 0 1px 0 hsla(0,0%,100%,1),
              inset 0 -1px 0 hsla(0,0%,0%,0.04)
            `,
          }}
        />

        {/* Inner subtle ring */}
        <div
          className="absolute rounded-full"
          style={{
            top: config.offset - 4,
            left: config.offset - 4,
            right: config.offset - 4,
            bottom: config.offset - 4,
            border: '1px solid hsla(0,0%,0%,0.04)',
            background: 'radial-gradient(circle at 50% 30%, hsla(0,0%,100%,0.5) 0%, transparent 60%)',
          }}
        />

        {/* Direction buttons */}
        <DirectionButton
          direction="up"
          icon={ChevronUp}
          style={{
            top: config.offset,
            left: center - config.button / 2,
          }}
          size={size}
          onClick={() => onDirection('up')}
          onLongPress={() => onLongPress?.('up')}
          loading={loadingDirection === 'up'}
          disabled={disabled}
        />

        <DirectionButton
          direction="down"
          icon={ChevronDown}
          style={{
            bottom: config.offset,
            left: center - config.button / 2,
          }}
          size={size}
          onClick={() => onDirection('down')}
          onLongPress={() => onLongPress?.('down')}
          loading={loadingDirection === 'down'}
          disabled={disabled}
        />

        <DirectionButton
          direction="left"
          icon={ChevronLeft}
          style={{
            left: config.offset,
            top: center - config.button / 2,
          }}
          size={size}
          onClick={() => onDirection('left')}
          onLongPress={() => onLongPress?.('left')}
          loading={loadingDirection === 'left'}
          disabled={disabled}
        />

        <DirectionButton
          direction="right"
          icon={ChevronRight}
          style={{
            right: config.offset,
            top: center - config.button / 2,
          }}
          size={size}
          onClick={() => onDirection('right')}
          onLongPress={() => onLongPress?.('right')}
          loading={loadingDirection === 'right'}
          disabled={disabled}
        />

        {/* Center Select Button - Premium Apple blue */}
        <motion.button
          className={cn(
            'absolute flex items-center justify-center',
            'rounded-full',
            'font-semibold',
            'transition-all duration-150',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(211,100%,50%)]',
            'disabled:opacity-30 disabled:pointer-events-none'
          )}
          style={{
            width: config.center,
            height: config.center,
            top: center - config.center / 2,
            left: center - config.center / 2,
            background: 'linear-gradient(180deg, hsl(211,100%,50%) 0%, hsl(211,100%,42%) 100%)',
            boxShadow: `
              0 4px 16px hsla(211,100%,50%,0.35),
              0 2px 4px hsla(0,0%,0%,0.1),
              inset 0 1px 0 hsla(0,0%,100%,0.25)
            `,
            border: 'none',
          }}
          whileTap={{ scale: 0.94 }}
          whileHover={{
            boxShadow: `
              0 6px 24px hsla(211,100%,50%,0.45),
              0 3px 6px hsla(0,0%,0%,0.15),
              inset 0 1px 0 hsla(0,0%,100%,0.25)
            `
          }}
          transition={springConfigs.snappy}
          onClick={handleSelect}
          disabled={disabled || loadingDirection === 'select'}
          aria-label="Select"
          {...(onLongPress ? centerLongPressProps : {})}
        >
          {loadingDirection === 'select' ? (
            <div
              className="border-2 border-white border-t-transparent rounded-full animate-spin"
              style={{ width: config.icon, height: config.icon }}
            />
          ) : centerContent ? (
            centerContent
          ) : (
            <span
              className="text-white tracking-wide font-semibold"
              style={{ fontSize: size === 'lg' ? 14 : size === 'md' ? 13 : 12 }}
            >
              OK
            </span>
          )}
        </motion.button>
      </motion.div>
    );
  }
);

DPad.displayName = 'DPad';

export { DPad };
