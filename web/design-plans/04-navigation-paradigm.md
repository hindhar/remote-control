# Plan 04: Navigation Paradigm

**Focus**: Implementing iOS-style navigation patterns with fluid tab transitions, spatial awareness, and native-feeling navigation behaviors.

## Key Decisions

1. **Tab Bar as Primary Navigation**: Use a persistent bottom tab bar (iOS-style) on mobile, adapting to sidebar on larger screens for spatial consistency.

2. **Animated Pill Indicator**: The active tab indicator slides smoothly between tabs using Framer Motion's layout animations.

3. **Gesture-Based Navigation**: Implement swipe gestures between tabs on touch devices for native app feel.

4. **Spatial Memory**: Content position is preserved when switching between tabs, respecting user's spatial mental model.

## Implementation Steps

### Step 1: Create Tab Bar Component

```typescript
// src/components/organisms/TabBar/TabBar.tsx
'use client';

import { motion, LayoutGroup, useReducedMotion, useDragControls, PanInfo } from 'framer-motion';
import { type ReactNode } from 'react';
import { springs } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number | string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  position?: 'bottom' | 'top';
  className?: string;
}

export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  position = 'bottom',
  className,
}: TabBarProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleSwipe = (info: PanInfo) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    const threshold = 50;

    if (info.offset.x < -threshold && currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1].id);
    } else if (info.offset.x > threshold && currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1].id);
    }
  };

  return (
    <motion.nav
      className={cn(
        // Base styles
        'fixed left-0 right-0 z-40',
        position === 'bottom' ? 'bottom-0' : 'top-0',
        // Glass effect
        'bg-[var(--color-surface-glass)]',
        'backdrop-blur-2xl',
        'border-[var(--color-surface-glass-border)]',
        position === 'bottom' ? 'border-t' : 'border-b',
        // Safe area padding
        position === 'bottom' && 'pb-[env(safe-area-inset-bottom)]',
        position === 'top' && 'pt-[env(safe-area-inset-top)]',
        className
      )}
      initial={{ y: position === 'bottom' ? 100 : -100 }}
      animate={{ y: 0 }}
      transition={springs.smooth}
    >
      <LayoutGroup>
        <div
          className="flex items-center justify-around px-2 py-2"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <TabBarItem
                key={tab.id}
                tab={tab}
                isActive={isActive}
                onClick={() => onTabChange(tab.id)}
                reduceMotion={shouldReduceMotion}
              />
            );
          })}
        </div>
      </LayoutGroup>

      {/* Subtle top highlight */}
      <div
        className={cn(
          'absolute left-0 right-0 h-[0.5px]',
          'bg-gradient-to-r from-transparent via-white/10 to-transparent',
          position === 'bottom' ? 'top-0' : 'bottom-0'
        )}
      />
    </motion.nav>
  );
}

interface TabBarItemProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
  reduceMotion: boolean | null;
}

function TabBarItem({ tab, isActive, onClick, reduceMotion }: TabBarItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'min-w-[64px] py-1 px-3',
        'rounded-[var(--radius-lg)]',
        'transition-colors duration-200'
      )}
      role="tab"
      aria-selected={isActive}
      whileTap={reduceMotion ? {} : { scale: 0.92 }}
    >
      {/* Active background pill */}
      {isActive && (
        <motion.div
          layoutId="tabIndicator"
          className={cn(
            'absolute inset-0',
            'bg-[var(--color-accent-blue)]/15',
            'rounded-[var(--radius-lg)]'
          )}
          transition={reduceMotion ? { duration: 0 } : springs.smooth}
        />
      )}

      {/* Icon */}
      <motion.span
        className={cn(
          'relative z-10 mb-0.5',
          isActive
            ? 'text-[var(--color-accent-blue)]'
            : 'text-[var(--color-text-tertiary)]'
        )}
        animate={
          reduceMotion
            ? {}
            : {
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0,
              }
        }
        transition={springs.snappy}
      >
        <span className="w-6 h-6 block">{tab.icon}</span>
      </motion.span>

      {/* Label */}
      <motion.span
        className={cn(
          'relative z-10 text-[10px] font-medium',
          isActive
            ? 'text-[var(--color-accent-blue)]'
            : 'text-[var(--color-text-tertiary)]'
        )}
        animate={
          reduceMotion
            ? {}
            : {
                opacity: isActive ? 1 : 0.7,
              }
        }
      >
        {tab.label}
      </motion.span>

      {/* Badge */}
      {tab.badge && (
        <motion.span
          className={cn(
            'absolute -top-0.5 -right-0.5',
            'min-w-[18px] h-[18px] px-1',
            'bg-[var(--color-accent-red)]',
            'rounded-full',
            'text-[10px] font-bold text-white',
            'flex items-center justify-center'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springs.bouncy}
        >
          {tab.badge}
        </motion.span>
      )}
    </motion.button>
  );
}
```

### Step 2: Create Swipeable Tab Content

```typescript
// src/components/organisms/SwipeableTabContent/SwipeableTabContent.tsx
'use client';

import { useState, useRef, type ReactNode } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useDragControls,
  type PanInfo,
} from 'framer-motion';
import { springs } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface SwipeableTabContentProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: Record<string, ReactNode>;
  className?: string;
  /** Enable swipe gestures */
  swipeable?: boolean;
  /** Threshold for swipe detection */
  swipeThreshold?: number;
}

export function SwipeableTabContent({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  swipeable = true,
  swipeThreshold = 50,
}: SwipeableTabContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const currentIndex = tabs.indexOf(activeTab);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeable) return;

    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    // Determine direction based on velocity and offset
    if (swipe < -swipeThreshold * 10 || (offset.x < -swipeThreshold && velocity.x < -100)) {
      // Swipe left - go to next tab
      if (currentIndex < tabs.length - 1) {
        setDirection(1);
        onTabChange(tabs[currentIndex + 1]);
      }
    } else if (swipe > swipeThreshold * 10 || (offset.x > swipeThreshold && velocity.x > 100)) {
      // Swipe right - go to previous tab
      if (currentIndex > 0) {
        setDirection(-1);
        onTabChange(tabs[currentIndex - 1]);
      }
    }
  };

  // Update direction when tab changes
  const handleTabChangeWithDirection = (newTab: string) => {
    const newIndex = tabs.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    onTabChange(newTab);
  };

  const contentVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={shouldReduceMotion ? {} : contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  x: springs.snappy,
                  opacity: { duration: 0.2 },
                }
          }
          drag={swipeable ? 'x' : false}
          dragControls={dragControls}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="w-full"
        >
          {children[activeTab]}
        </motion.div>
      </AnimatePresence>

      {/* Edge indicators showing more content */}
      {swipeable && (
        <>
          {currentIndex > 0 && (
            <motion.div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-8',
                'bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent',
                'pointer-events-none opacity-0'
              )}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            />
          )}
          {currentIndex < tabs.length - 1 && (
            <motion.div
              className={cn(
                'absolute right-0 top-0 bottom-0 w-8',
                'bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent',
                'pointer-events-none opacity-0'
              )}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            />
          )}
        </>
      )}
    </div>
  );
}
```

### Step 3: Create Navigation Context

```typescript
// src/providers/NavigationProvider/NavigationProvider.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

type Tab = 'tv' | 'chromecast' | 'ps5' | 'apps' | 'macros' | 'settings';

interface NavigationState {
  /** Currently active tab */
  activeTab: Tab;
  /** Previous tab for back navigation */
  previousTab: Tab | null;
  /** Scroll positions for each tab */
  scrollPositions: Record<Tab, number>;
  /** Whether the tab bar should be visible */
  tabBarVisible: boolean;
}

interface NavigationContextValue extends NavigationState {
  /** Navigate to a specific tab */
  navigateTo: (tab: Tab) => void;
  /** Go back to the previous tab */
  goBack: () => void;
  /** Save scroll position for current tab */
  saveScrollPosition: (position: number) => void;
  /** Get saved scroll position for a tab */
  getScrollPosition: (tab: Tab) => number;
  /** Show/hide the tab bar */
  setTabBarVisible: (visible: boolean) => void;
  /** All available tabs */
  tabs: Tab[];
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

const ALL_TABS: Tab[] = ['tv', 'chromecast', 'ps5', 'apps', 'macros', 'settings'];

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NavigationState>({
    activeTab: 'tv',
    previousTab: null,
    scrollPositions: {
      tv: 0,
      chromecast: 0,
      ps5: 0,
      apps: 0,
      macros: 0,
      settings: 0,
    },
    tabBarVisible: true,
  });

  const navigateTo = useCallback((tab: Tab) => {
    setState((prev) => ({
      ...prev,
      previousTab: prev.activeTab,
      activeTab: tab,
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (!prev.previousTab) return prev;
      return {
        ...prev,
        activeTab: prev.previousTab,
        previousTab: null,
      };
    });
  }, []);

  const saveScrollPosition = useCallback((position: number) => {
    setState((prev) => ({
      ...prev,
      scrollPositions: {
        ...prev.scrollPositions,
        [prev.activeTab]: position,
      },
    }));
  }, []);

  const getScrollPosition = useCallback(
    (tab: Tab) => state.scrollPositions[tab],
    [state.scrollPositions]
  );

  const setTabBarVisible = useCallback((visible: boolean) => {
    setState((prev) => ({
      ...prev,
      tabBarVisible: visible,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      navigateTo,
      goBack,
      saveScrollPosition,
      getScrollPosition,
      setTabBarVisible,
      tabs: ALL_TABS,
    }),
    [state, navigateTo, goBack, saveScrollPosition, getScrollPosition, setTabBarVisible]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
```

### Step 4: Create Scroll-Aware Container

```typescript
// src/components/templates/ScrollContainer/ScrollContainer.tsx
'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useNavigation } from '@/providers/NavigationProvider';
import { cn } from '@/lib/utils';

interface ScrollContainerProps {
  children: ReactNode;
  /** ID for scroll position persistence */
  id: string;
  /** Show/hide header based on scroll */
  hideHeaderOnScroll?: boolean;
  /** Callback when scroll changes */
  onScroll?: (position: number) => void;
  className?: string;
}

export function ScrollContainer({
  children,
  id,
  hideHeaderOnScroll = false,
  onScroll,
  className,
}: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { saveScrollPosition, getScrollPosition, setTabBarVisible } = useNavigation();
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll({
    container: containerRef,
  });

  // Restore scroll position on mount
  useEffect(() => {
    const savedPosition = getScrollPosition(id as 'tv');
    if (containerRef.current && savedPosition > 0) {
      containerRef.current.scrollTop = savedPosition;
    }
  }, [id, getScrollPosition]);

  // Save scroll position on unmount and scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const position = containerRef.current.scrollTop;
      saveScrollPosition(position);
      onScroll?.(position);

      // Hide/show tab bar based on scroll direction
      if (hideHeaderOnScroll) {
        // Implementation would track scroll direction
      }
    }
  }, [saveScrollPosition, onScroll, hideHeaderOnScroll]);

  // Parallax effect for header (optional)
  const headerY = useTransform(scrollY, [0, 100], [0, -30]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'h-full overflow-y-auto overflow-x-hidden',
        'scroll-smooth scrollbar-thin',
        className
      )}
      onScroll={handleScroll}
      style={{
        // Hide scrollbar on touch devices
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </motion.div>
  );
}
```

### Step 5: Create Main Navigation Layout

```typescript
// src/components/templates/NavigationLayout/NavigationLayout.tsx
'use client';

import { type ReactNode, useMemo } from 'react';
import { Tv, Cast, Gamepad, Grid3X3, Zap, Settings } from 'lucide-react';
import { TabBar } from '@/components/organisms/TabBar';
import { SwipeableTabContent } from '@/components/organisms/SwipeableTabContent';
import { ScrollContainer } from '@/components/templates/ScrollContainer';
import { useNavigation, NavigationProvider } from '@/providers/NavigationProvider';
import { TVRemote } from '@/features/tv/TVRemote';
import { ChromecastRemote } from '@/features/chromecast/ChromecastRemote';
import { PS5Remote } from '@/features/ps5/PS5Remote';
import { AppLauncher } from '@/features/apps/AppLauncher';
import { MacroList } from '@/features/macros/MacroList';
import { SettingsPanel } from '@/features/settings/SettingsPanel';
import { cn } from '@/lib/utils';

type Tab = 'tv' | 'chromecast' | 'ps5' | 'apps' | 'macros' | 'settings';

interface TabConfig {
  id: Tab;
  label: string;
  icon: ReactNode;
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'tv', label: 'TV', icon: <Tv /> },
  { id: 'chromecast', label: 'Cast', icon: <Cast /> },
  { id: 'ps5', label: 'PS5', icon: <Gamepad /> },
  { id: 'apps', label: 'Apps', icon: <Grid3X3 /> },
  { id: 'macros', label: 'Scenes', icon: <Zap /> },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
];

function NavigationLayoutInner() {
  const { activeTab, navigateTo, tabs, tabBarVisible } = useNavigation();

  const tabContent = useMemo(
    () => ({
      tv: (
        <ScrollContainer id="tv" className="px-4 py-6">
          <TVRemote />
        </ScrollContainer>
      ),
      chromecast: (
        <ScrollContainer id="chromecast" className="px-4 py-6">
          <ChromecastRemote />
        </ScrollContainer>
      ),
      ps5: (
        <ScrollContainer id="ps5" className="px-4 py-6">
          <PS5Remote />
        </ScrollContainer>
      ),
      apps: (
        <ScrollContainer id="apps" className="px-4 py-6">
          <AppLauncher />
        </ScrollContainer>
      ),
      macros: (
        <ScrollContainer id="macros" className="px-4 py-6">
          <MacroList />
        </ScrollContainer>
      ),
      settings: (
        <ScrollContainer id="settings" className="px-4 py-6">
          <SettingsPanel />
        </ScrollContainer>
      ),
    }),
    []
  );

  return (
    <div className="relative min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header area */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-30',
          'pt-[env(safe-area-inset-top)]',
          'bg-[var(--color-surface-glass)]',
          'backdrop-blur-xl',
          'border-b border-[var(--color-surface-glass-border)]'
        )}
      >
        <div className="px-4 py-3 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Absolutely Massive TV
          </h1>
        </div>
      </header>

      {/* Main content with safe areas */}
      <main
        className={cn(
          'pt-[calc(env(safe-area-inset-top)+56px)]',
          'pb-[calc(env(safe-area-inset-bottom)+72px)]',
          'h-screen'
        )}
      >
        <SwipeableTabContent
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={navigateTo}
          className="h-full"
        >
          {tabContent}
        </SwipeableTabContent>
      </main>

      {/* Tab bar */}
      {tabBarVisible && (
        <TabBar
          tabs={TAB_CONFIG}
          activeTab={activeTab}
          onTabChange={navigateTo}
          position="bottom"
        />
      )}
    </div>
  );
}

export function NavigationLayout() {
  return (
    <NavigationProvider>
      <NavigationLayoutInner />
    </NavigationProvider>
  );
}
```

### Step 6: Add Keyboard Navigation

```typescript
// src/hooks/useKeyboardNavigation.ts
'use client';

import { useEffect, useCallback } from 'react';
import { useNavigation } from '@/providers/NavigationProvider';

const TAB_SHORTCUTS: Record<string, string> = {
  '1': 'tv',
  '2': 'chromecast',
  '3': 'ps5',
  '4': 'apps',
  '5': 'macros',
  '6': 'settings',
};

export function useKeyboardNavigation() {
  const { navigateTo, goBack, activeTab, tabs } = useNavigation();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Number keys for tab navigation
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const tab = TAB_SHORTCUTS[e.key];
        if (tab && tabs.includes(tab as 'tv')) {
          e.preventDefault();
          navigateTo(tab as 'tv');
          return;
        }
      }

      // Cmd/Ctrl + [ and ] for tab cycling
      if (e.metaKey || e.ctrlKey) {
        const currentIndex = tabs.indexOf(activeTab);

        if (e.key === '[' && currentIndex > 0) {
          e.preventDefault();
          navigateTo(tabs[currentIndex - 1] as 'tv');
        } else if (e.key === ']' && currentIndex < tabs.length - 1) {
          e.preventDefault();
          navigateTo(tabs[currentIndex + 1] as 'tv');
        }
      }

      // Escape to go back
      if (e.key === 'Escape') {
        goBack();
      }
    },
    [navigateTo, goBack, activeTab, tabs]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

## Integration Points

### Files to Create

```
/src/components/organisms/TabBar/TabBar.tsx
/src/components/organisms/SwipeableTabContent/SwipeableTabContent.tsx
/src/components/templates/ScrollContainer/ScrollContainer.tsx
/src/components/templates/NavigationLayout/NavigationLayout.tsx
/src/providers/NavigationProvider/NavigationProvider.tsx
/src/hooks/useKeyboardNavigation.ts
```

### Files to Modify

- `/src/app/page.tsx` - Replace with NavigationLayout
- `/src/app/layout.tsx` - Add providers

## Technical Specifications

- **Navigation Model**: Single-page app with tab-based navigation
- **Gesture Support**: Pan gestures with velocity-based detection
- **Scroll Restoration**: Per-tab scroll position persistence
- **Safe Areas**: Full support for iPhone notch/home indicator

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Success Criteria

1. Tab bar indicator slides smoothly between tabs
2. Swipe gestures work naturally on touch devices
3. Scroll position is preserved when switching tabs
4. Keyboard shortcuts work for power users (1-6 for tabs)
5. Safe areas are respected on all iOS devices
6. Tab transitions feel instant with appropriate motion
7. Active tab has clear visual indication

## Estimated Effort

**Time**: 6-8 hours
**Complexity**: Medium
**Risk**: Low

## Dependencies

- Requires Animation & Motion (Plan 03)
- Requires Component Architecture (Plan 02)
- Required by all feature tabs

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Swipe conflicts with content scrolling | Medium | Use horizontal-only pan detection |
| Safe area inset inconsistencies | Low | Test on multiple iOS device sizes |
| Keyboard shortcuts conflict with TV controls | Medium | Use separate namespace for navigation |
| Tab bar obscuring content | Medium | Ensure proper bottom padding |
