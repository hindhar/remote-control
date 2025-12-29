# Plan 08: App Grid Design

**Focus**: Creating an App Store-inspired grid layout for app launchers with polished icons, category sections, and engaging hover states.

## Key Decisions

1. **Rounded Icon Style**: App icons follow iOS app icon shape (squircle) with consistent corner radius and subtle shadows for depth.

2. **Category Organization**: Apps grouped by category with elegant section headers and horizontal scroll for overflow.

3. **Launch Animation**: App icons have a satisfying "bounce" animation on tap, followed by launch feedback.

4. **Visual Hierarchy**: Streaming apps prominently displayed, with secondary categories collapsed into expandable sections.

## Implementation Steps

### Step 1: Create App Icon Component

```typescript
// src/components/atoms/AppIcon/AppIcon.tsx
'use client';

import { forwardRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { springs } from '@/lib/motion';

interface AppIconProps {
  /** App name */
  name: string;
  /** Icon URL or first letter fallback */
  icon?: string;
  /** Background color for fallback icon */
  color: string;
  /** Called when app is tapped */
  onLaunch: () => void;
  /** Loading state during launch */
  loading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show app name label */
  showLabel?: boolean;
  /** Badge content (e.g., notification count) */
  badge?: number | string;
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'w-14 h-14',
    icon: 48,
    text: 'text-[9px]',
    badge: 'w-4 h-4 text-[8px]',
    radius: 10,
  },
  md: {
    container: 'w-16 h-16',
    icon: 56,
    text: 'text-[10px]',
    badge: 'w-4.5 h-4.5 text-[9px]',
    radius: 12,
  },
  lg: {
    container: 'w-20 h-20',
    icon: 72,
    text: 'text-xs',
    badge: 'w-5 h-5 text-[10px]',
    radius: 16,
  },
  xl: {
    container: 'w-24 h-24',
    icon: 88,
    text: 'text-sm',
    badge: 'w-5.5 h-5.5 text-xs',
    radius: 20,
  },
};

const AppIcon = forwardRef<HTMLButtonElement, AppIconProps>(
  (
    {
      name,
      icon,
      color,
      onLaunch,
      loading = false,
      size = 'md',
      showLabel = true,
      badge,
      disabled = false,
      className,
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const { triggerHaptic } = useHapticFeedback();
    const [isPressed, setIsPressed] = useState(false);
    const [hasLaunched, setHasLaunched] = useState(false);
    const config = sizeConfig[size];

    const handleLaunch = () => {
      if (disabled || loading) return;

      triggerHaptic('medium');
      setHasLaunched(true);
      onLaunch();

      // Reset launch state after animation
      setTimeout(() => setHasLaunched(false), 600);
    };

    // Icon content - either image or first letter
    const IconContent = () => {
      if (loading) {
        return (
          <motion.div
            className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        );
      }

      if (icon && icon.startsWith('/')) {
        return (
          <Image
            src={icon}
            alt={name}
            width={config.icon}
            height={config.icon}
            className="object-cover"
          />
        );
      }

      // Fallback to first letter
      return (
        <span className="text-2xl font-bold text-white drop-shadow-sm">
          {name.charAt(0).toUpperCase()}
        </span>
      );
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-1.5',
          'focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-accent-blue)]',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={handleLaunch}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        disabled={disabled || loading}
        aria-label={`Launch ${name}`}
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.92 }}
        transition={springs.button}
      >
        {/* Icon container */}
        <motion.div
          className={cn(
            'relative flex items-center justify-center',
            'shadow-lg',
            config.container
          )}
          style={{
            backgroundColor: color,
            borderRadius: config.radius,
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: hasLaunched ? [1, 1.1, 1] : isPressed ? 0.95 : 1,
                }
          }
          transition={springs.bouncy}
        >
          {/* iOS-style highlight gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: config.radius,
              background: `linear-gradient(
                180deg,
                rgba(255,255,255,0.25) 0%,
                rgba(255,255,255,0.08) 30%,
                transparent 50%
              )`,
            }}
          />

          {/* Inner shadow for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: config.radius,
              boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15)',
            }}
          />

          {/* Icon content */}
          <IconContent />

          {/* Badge */}
          <AnimatePresence>
            {badge !== undefined && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={springs.bouncy}
                className={cn(
                  'absolute -top-1 -right-1',
                  'flex items-center justify-center',
                  'bg-[var(--color-accent-red)] text-white',
                  'font-bold rounded-full',
                  'min-w-[16px] shadow-sm',
                  config.badge
                )}
              >
                {badge}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Label */}
        {showLabel && (
          <span
            className={cn(
              'font-medium text-[var(--color-text-primary)]',
              'truncate max-w-full px-0.5',
              config.text
            )}
          >
            {name}
          </span>
        )}
      </motion.button>
    );
  }
);

AppIcon.displayName = 'AppIcon';

export { AppIcon };
export type { AppIconProps };
```

### Step 2: Create App Grid Container

```typescript
// src/components/organisms/AppGrid/AppGrid.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AppIcon } from '@/components/atoms/AppIcon';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface App {
  id: string;
  name: string;
  icon?: string;
  color: string;
}

interface AppGridProps {
  /** Array of apps to display */
  apps: App[];
  /** Called when an app is launched */
  onLaunch: (appId: string) => void;
  /** Currently loading app ID */
  loadingApp?: string | null;
  /** Number of columns */
  columns?: 3 | 4 | 5 | 6;
  /** App icon size */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show app labels */
  showLabels?: boolean;
  /** Enable stagger animation on mount */
  staggerAnimation?: boolean;
  className?: string;
}

const columnClasses = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
};

export function AppGrid({
  apps,
  onLaunch,
  loadingApp,
  columns = 4,
  iconSize = 'md',
  showLabels = true,
  staggerAnimation = true,
  className,
}: AppGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerAnimation && !shouldReduceMotion ? 0.05 : 0,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springs.smooth,
    },
  };

  return (
    <motion.div
      className={cn(
        'grid gap-4',
        columnClasses[columns],
        className
      )}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {apps.map((app) => (
        <motion.div
          key={app.id}
          variants={itemVariants}
          className="flex justify-center"
        >
          <AppIcon
            name={app.name}
            icon={app.icon}
            color={app.color}
            onLaunch={() => onLaunch(app.id)}
            loading={loadingApp === app.id}
            size={iconSize}
            showLabel={showLabels}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Step 3: Create Category Section

```typescript
// src/components/organisms/AppCategory/AppCategory.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AppGrid } from '@/components/organisms/AppGrid';
import { GlassCard } from '@/components/atoms/GlassCard';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface App {
  id: string;
  name: string;
  icon?: string;
  color: string;
}

interface AppCategoryProps {
  /** Category title */
  title: string;
  /** Apps in this category */
  apps: App[];
  /** Called when an app is launched */
  onLaunch: (appId: string) => void;
  /** Currently loading app ID */
  loadingApp?: string | null;
  /** Initially expanded state */
  defaultExpanded?: boolean;
  /** Make category collapsible */
  collapsible?: boolean;
  /** Number of columns in grid */
  columns?: 3 | 4 | 5 | 6;
  /** Icon size */
  iconSize?: 'sm' | 'md' | 'lg';
  /** Show as horizontal scroll instead of grid */
  horizontal?: boolean;
  className?: string;
}

export function AppCategory({
  title,
  apps,
  onLaunch,
  loadingApp,
  defaultExpanded = true,
  collapsible = true,
  columns = 4,
  iconSize = 'md',
  horizontal = false,
  className,
}: AppCategoryProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Category header */}
      <motion.button
        className={cn(
          'w-full flex items-center justify-between',
          'px-1 py-1',
          collapsible && 'cursor-pointer hover:opacity-80',
          !collapsible && 'cursor-default'
        )}
        onClick={handleToggle}
        whileTap={collapsible && !shouldReduceMotion ? { scale: 0.98 } : {}}
      >
        <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          {title}
        </h3>

        {collapsible && (
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : springs.snappy}
          >
            <ChevronDown className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          </motion.span>
        )}
      </motion.button>

      {/* Apps container */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : springs.smooth}
            style={{ overflow: 'hidden' }}
          >
            {horizontal ? (
              <HorizontalAppScroll
                apps={apps}
                onLaunch={onLaunch}
                loadingApp={loadingApp}
                iconSize={iconSize}
              />
            ) : (
              <AppGrid
                apps={apps}
                onLaunch={onLaunch}
                loadingApp={loadingApp}
                columns={columns}
                iconSize={iconSize}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Horizontal scrolling variant
function HorizontalAppScroll({
  apps,
  onLaunch,
  loadingApp,
  iconSize,
}: {
  apps: App[];
  onLaunch: (appId: string) => void;
  loadingApp?: string | null;
  iconSize: 'sm' | 'md' | 'lg';
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'flex gap-4 overflow-x-auto pb-2',
        'scrollbar-thin scrollbar-thumb-[var(--color-fill-secondary)]',
        'scrollbar-track-transparent',
        '-mx-4 px-4' // Extend to edges with padding
      )}
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {apps.map((app, index) => (
        <motion.div
          key={app.id}
          className="flex-shrink-0"
          style={{ scrollSnapAlign: 'start' }}
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={shouldReduceMotion ? {} : { delay: index * 0.05, ...springs.smooth }}
        >
          <AppIcon
            name={app.name}
            icon={app.icon}
            color={app.color}
            onLaunch={() => onLaunch(app.id)}
            loading={loadingApp === app.id}
            size={iconSize}
          />
        </motion.div>
      ))}
    </div>
  );
}
```

### Step 4: Create Featured App Banner

```typescript
// src/components/organisms/FeaturedApp/FeaturedApp.tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { PremiumButton } from '@/components/atoms/PremiumButton';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface FeaturedAppProps {
  /** App name */
  name: string;
  /** App subtitle/description */
  subtitle: string;
  /** Background color or gradient */
  background: string;
  /** Icon URL */
  icon?: string;
  /** Featured tag (e.g., "NEW", "POPULAR") */
  tag?: string;
  /** Called when launched */
  onLaunch: () => void;
  /** Loading state */
  loading?: boolean;
  className?: string;
}

export function FeaturedApp({
  name,
  subtitle,
  background,
  icon,
  tag,
  onLaunch,
  loading = false,
  className,
}: FeaturedAppProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'p-5',
        className
      )}
      style={{
        background: background.includes('gradient') ? background : background,
      }}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={springs.smooth}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(0,0,0,0.1) 0%, transparent 40%)
          `,
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* App icon */}
        {icon && (
          <div
            className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-white/20 backdrop-blur-sm"
            style={{ borderRadius: 14 }}
          >
            <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {/* Tag */}
          {tag && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/80 mb-1">
              <Star className="w-3 h-3" fill="currentColor" />
              {tag}
            </span>
          )}

          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>

        {/* Launch button */}
        <PremiumButton
          variant="glass"
          size="lg"
          rounded="full"
          onClick={onLaunch}
          loading={loading}
          className="bg-white/20 hover:bg-white/30 border-white/20"
        >
          <Play className="w-5 h-5" fill="currentColor" />
        </PremiumButton>
      </div>
    </motion.div>
  );
}
```

### Step 5: Create Complete App Launcher Feature

```typescript
// src/features/apps/AppLauncher/AppLauncher.tsx
'use client';

import { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, Grid3X3, List } from 'lucide-react';
import { AppCategory } from '@/components/organisms/AppCategory';
import { FeaturedApp } from '@/components/organisms/FeaturedApp';
import { GlassCard } from '@/components/atoms/GlassCard';
import { PremiumIconButton } from '@/components/atoms/PremiumIconButton';
import { APP_DEFINITIONS, CHROMECAST_APPS } from '@/lib/tv-config';
import { useNotifications } from '@/providers/NotificationProvider';
import { cn } from '@/lib/utils';
import { springs } from '@/lib/motion';

interface AppLauncherProps {
  /** Target device for app launches */
  device?: 'samsung' | 'chromecast';
  className?: string;
}

export function AppLauncher({ device = 'samsung', className }: AppLauncherProps) {
  const shouldReduceMotion = useReducedMotion();
  const { notify } = useNotifications();
  const [loadingApp, setLoadingApp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Group apps by category
  const appsByCategory = useMemo(() => {
    const categories: Record<string, typeof APP_DEFINITIONS> = {};

    APP_DEFINITIONS.forEach((app) => {
      const category = app.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(app);
    });

    return categories;
  }, []);

  // Filter apps by search query
  const filteredApps = useMemo(() => {
    if (!searchQuery) return appsByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof APP_DEFINITIONS> = {};

    Object.entries(appsByCategory).forEach(([category, apps]) => {
      const matchingApps = apps.filter((app) =>
        app.name.toLowerCase().includes(query)
      );
      if (matchingApps.length > 0) {
        filtered[category] = matchingApps;
      }
    });

    return filtered;
  }, [appsByCategory, searchQuery]);

  // Launch app handler
  const handleLaunch = useCallback(
    async (appId: string, appName: string) => {
      setLoadingApp(appId);

      try {
        const endpoint = device === 'chromecast'
          ? '/api/chromecast/app'
          : '/api/tv/app';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app: appName }),
        });

        const data = await res.json();

        if (data.success) {
          notify('success', `Launching ${appName}`);
        } else {
          notify('error', data.error || 'Failed to launch app');
        }
      } catch (error) {
        notify('error', 'Failed to launch app');
        console.error('App launch error:', error);
      }

      setLoadingApp(null);
    },
    [device, notify]
  );

  // Chromecast apps formatted
  const chromecastApps = useMemo(() => {
    return Object.entries(CHROMECAST_APPS).map(([key, app]) => ({
      id: key,
      name: app.name,
      color: app.color,
    }));
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springs.smooth}
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          Tap to launch app on TV
        </p>

        {/* View toggle */}
        <div className="flex gap-1">
          <PremiumIconButton
            icon={<Grid3X3 className="w-4 h-4" />}
            aria-label="Grid view"
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          />
          <PremiumIconButton
            icon={<List className="w-4 h-4" />}
            aria-label="List view"
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          />
        </div>
      </motion.div>

      {/* Search bar */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'flex-1 bg-transparent',
              'text-[var(--color-text-primary)]',
              'placeholder-[var(--color-text-tertiary)]',
              'outline-none'
            )}
          />
        </div>
      </GlassCard>

      {/* Featured app (show when no search) */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.smooth}
        >
          <FeaturedApp
            name="Netflix"
            subtitle="Stream your favorite shows"
            background="linear-gradient(135deg, #E50914 0%, #831010 100%)"
            tag="POPULAR"
            onLaunch={() => handleLaunch('netflix', 'Netflix')}
            loading={loadingApp === 'netflix'}
          />
        </motion.div>
      )}

      {/* Chromecast Apps */}
      {device === 'samsung' && (
        <GlassCard className="p-4">
          <AppCategory
            title="Chromecast Apps"
            apps={chromecastApps}
            onLaunch={(id) => {
              const app = CHROMECAST_APPS[id as keyof typeof CHROMECAST_APPS];
              if (app) handleLaunch(id, app.name);
            }}
            loadingApp={loadingApp}
            columns={3}
            horizontal
            collapsible={false}
          />
        </GlassCard>
      )}

      {/* App categories */}
      <div className="space-y-6">
        {Object.entries(filteredApps).map(([category, apps]) => (
          <AppCategory
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            apps={apps.map((app) => ({
              id: app.id,
              name: app.name,
              icon: app.icon,
              color: app.color,
            }))}
            onLaunch={(id) => {
              const app = apps.find((a) => a.id === id);
              if (app) handleLaunch(id, app.name.toLowerCase().replace(/[+ ]/g, ''));
            }}
            loadingApp={loadingApp}
            columns={4}
            iconSize="md"
            defaultExpanded={category === 'streaming'}
            collapsible
          />
        ))}
      </div>

      {/* Empty state for search */}
      <AnimatePresence>
        {searchQuery && Object.keys(filteredApps).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <p className="text-[var(--color-text-tertiary)]">
              No apps found for &quot;{searchQuery}&quot;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Integration Points

### Files to Create

```
/src/components/atoms/AppIcon/AppIcon.tsx
/src/components/organisms/AppGrid/AppGrid.tsx
/src/components/organisms/AppCategory/AppCategory.tsx
/src/components/organisms/FeaturedApp/FeaturedApp.tsx
/src/features/apps/AppLauncher/AppLauncher.tsx
```

### Files to Modify

- Update app tab to use new AppLauncher
- Integrate with existing APP_DEFINITIONS from tv-config

## Technical Specifications

- **Icon Shape**: iOS-style squircle with 22% corner radius
- **Animation**: Staggered reveal, bounce on tap, pulse on load
- **Scroll**: Horizontal momentum scroll with snap points
- **Search**: Client-side filtering with debounce

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "next": ">=13.0.0"
  }
}
```

## Success Criteria

1. App icons have iOS-style rounded square shape
2. Icons have gradient highlight overlay for depth
3. Launch animation shows satisfying bounce
4. Categories expand/collapse smoothly
5. Horizontal scroll has momentum and snap
6. Search filters apps in real-time
7. Featured app banner is visually prominent
8. Loading states work on individual icons

## Estimated Effort

**Time**: 6-8 hours
**Complexity**: Medium
**Risk**: Low

## Dependencies

- Requires Animation & Motion (Plan 03)
- Requires Glass Morphism (Plan 10)
- Required by Apps tab feature

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Icon images not loading | Low | Always show fallback letter |
| Too many apps causing scroll jank | Medium | Virtualize list if > 50 apps |
| Category collapse animation janky | Low | Use CSS containment |
| Search performance with many apps | Low | Debounce input, memoize results |
