'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springConfigs } from '@/styles/tokens';

export interface GlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  /** Content of the card */
  children: ReactNode;
  /** Enable hover scale effect */
  hoverable?: boolean;
  /** Custom padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Animation on mount */
  animated?: boolean;
  /** Delay for mount animation (in seconds) */
  animationDelay?: number;
}

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      hoverable = false,
      padding = 'md',
      animated = true,
      animationDelay = 0,
      className,
      ...props
    },
    ref
  ) => {
    const baseAnimation = animated
      ? {
          initial: { opacity: 0, y: 8, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: {
            ...springConfigs.gentle,
            delay: animationDelay,
          },
        }
      : {};

    const hoverAnimation = hoverable
      ? {
          whileHover: { scale: 1.02, y: -2 },
          transition: springConfigs.snappy,
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          // Glass effect
          'bg-[var(--color-surface-glass)]',
          'backdrop-blur-xl',
          'border border-[var(--color-surface-glass-border)]',
          'rounded-[var(--radius-card)]',
          'shadow-[var(--shadow-glass)]',
          // Transitions
          'transition-all duration-[var(--duration-normal)]',
          // Hover styles
          hoverable && [
            'hover:bg-[var(--color-surface-glass-hover)]',
            'hover:border-[var(--color-surface-glass-border-hover)]',
            'hover:shadow-[var(--shadow-glass-hover)]',
            'cursor-pointer',
          ],
          // Padding
          paddingVariants[padding],
          className
        )}
        {...baseAnimation}
        {...hoverAnimation}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export { GlassCard };
