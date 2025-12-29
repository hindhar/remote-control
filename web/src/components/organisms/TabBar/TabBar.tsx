'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springConfigs } from '@/styles/tokens';
import { useHaptics } from '@/hooks/useHaptics';

export interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface TabBarProps {
  /** Tab items */
  tabs: TabItem[];
  /** Currently active tab id */
  activeTab: string;
  /** Called when a tab is selected */
  onTabChange: (tabId: string) => void;
  /** Position of the tab bar */
  position?: 'top' | 'bottom';
  /** Style variant */
  variant?: 'default' | 'pill' | 'underline';
  className?: string;
}

const TabBar = forwardRef<HTMLDivElement, TabBarProps>(
  (
    {
      tabs,
      activeTab,
      onTabChange,
      position = 'bottom',
      variant = 'default',
      className,
    },
    ref
  ) => {
    const { triggerHaptic } = useHaptics();

    const handleTabClick = (tabId: string) => {
      if (tabId !== activeTab) {
        triggerHaptic('light');
        onTabChange(tabId);
      }
    };

    return (
      <motion.nav
        ref={ref}
        className={cn(
          'w-full',
          'bg-[var(--color-surface-glass)]',
          'backdrop-blur-xl',
          'border-[var(--color-surface-glass-border)]',
          position === 'bottom' ? 'border-t' : 'border-b',
          'safe-area-inset-bottom',
          className
        )}
        initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfigs.gentle}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <motion.button
                key={tab.id}
                className={cn(
                  'relative flex flex-col items-center justify-center',
                  'min-w-[64px] py-1 px-3 rounded-xl',
                  'transition-colors duration-[var(--duration-normal)]',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-[var(--color-accent-blue)]',
                  isActive
                    ? 'text-[var(--color-accent-blue)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                )}
                whileTap={{ scale: 0.95 }}
                transition={springConfigs.snappy}
                onClick={() => handleTabClick(tab.id)}
                aria-selected={isActive}
                role="tab"
              >
                {/* Active indicator background */}
                <AnimatePresence>
                  {isActive && variant === 'pill' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-[var(--color-fill-secondary)]"
                      layoutId="activeTabBg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={springConfigs.default}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <motion.span
                  className={cn(
                    'relative z-10 w-6 h-6',
                    'transition-transform duration-[var(--duration-normal)]',
                    isActive && 'scale-110'
                  )}
                  animate={{ y: isActive ? -1 : 0 }}
                  transition={springConfigs.snappy}
                >
                  {tab.icon}
                </motion.span>

                {/* Label */}
                <motion.span
                  className={cn(
                    'relative z-10 text-[10px] font-medium mt-0.5',
                    'transition-all duration-[var(--duration-normal)]'
                  )}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    fontWeight: isActive ? 600 : 500,
                  }}
                  transition={springConfigs.snappy}
                >
                  {tab.label}
                </motion.span>

                {/* Active dot indicator */}
                {variant === 'underline' && (
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-[var(--color-accent-blue)]"
                        layoutId="activeTabDot"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, x: '-50%' }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={springConfigs.bouncy}
                      />
                    )}
                  </AnimatePresence>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    );
  }
);

TabBar.displayName = 'TabBar';

export { TabBar };
