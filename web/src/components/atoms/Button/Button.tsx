'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLongPress } from '@/hooks/useLongPress';
import { useHaptics } from '@/hooks/useHaptics';
import { springConfigs } from '@/styles/tokens';

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
  sm: 'h-9 px-3 text-sm gap-1.5 min-w-[36px]',
  md: 'h-11 px-4 text-sm gap-2 min-w-[44px]',
  lg: 'h-12 px-5 text-base gap-2.5 min-w-[48px]',
  xl: 'h-14 px-6 text-lg gap-3 min-w-[56px]',
  icon: 'h-11 w-11 p-0',
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
    const { triggerHaptic } = useHaptics();

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
        transition={springConfigs.snappy}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium',
          'border transition-all duration-[var(--duration-button)]',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-accent-blue)] focus-visible:ring-offset-2',
          'focus-visible:ring-offset-[var(--color-bg-primary)]',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none cursor-pointer',
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
            {leftIcon && <span className="shrink-0 flex items-center justify-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 flex items-center justify-center">{rightIcon}</span>}
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
