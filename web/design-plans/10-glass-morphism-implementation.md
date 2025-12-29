# Plan 10: Glass Morphism Implementation

**Focus**: Premium translucent materials, backdrop blur, layered depth, and frosted glass effects that define Apple's visual language.

---

## Key Decisions

1. **Layered Blur System**: Use CSS `backdrop-filter` with multiple blur intensities (4px, 8px, 16px, 24px) for different surface hierarchies
2. **Material Types**: Define distinct material types (ultra-thin, thin, regular, thick, chrome) matching Apple's material system
3. **Noise Texture**: Subtle noise overlay for authentic frosted glass appearance
4. **Color Tinting**: Dynamic tint based on background content for vibrancy effect
5. **Performance Fallbacks**: Graceful degradation for devices without backdrop-filter support

---

## Implementation Steps

### Step 1: Glass Material Token System

```typescript
// src/design-system/tokens/materials.ts

export const glassMaterials = {
  // Ultra-thin - minimal blur, high transparency
  ultraThin: {
    blur: '4px',
    saturation: '180%',
    opacity: 0.4,
    background: 'hsla(0, 0%, 100%, 0.1)',
    darkBackground: 'hsla(0, 0%, 0%, 0.1)',
  },

  // Thin - light blur, used for overlays
  thin: {
    blur: '8px',
    saturation: '180%',
    opacity: 0.5,
    background: 'hsla(0, 0%, 100%, 0.15)',
    darkBackground: 'hsla(0, 0%, 0%, 0.15)',
  },

  // Regular - standard glass effect
  regular: {
    blur: '16px',
    saturation: '180%',
    opacity: 0.6,
    background: 'hsla(0, 0%, 100%, 0.2)',
    darkBackground: 'hsla(0, 0%, 0%, 0.2)',
  },

  // Thick - heavy blur, prominent surfaces
  thick: {
    blur: '24px',
    saturation: '180%',
    opacity: 0.7,
    background: 'hsla(0, 0%, 100%, 0.3)',
    darkBackground: 'hsla(0, 0%, 0%, 0.3)',
  },

  // Chrome - metallic glass for controls
  chrome: {
    blur: '20px',
    saturation: '200%',
    opacity: 0.8,
    background: 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.4), hsla(0, 0%, 100%, 0.1))',
    darkBackground: 'linear-gradient(135deg, hsla(0, 0%, 100%, 0.15), hsla(0, 0%, 0%, 0.2))',
  },
} as const;

export type GlassMaterial = keyof typeof glassMaterials;

// Border treatments for glass surfaces
export const glassBorders = {
  subtle: '1px solid hsla(0, 0%, 100%, 0.1)',
  light: '1px solid hsla(0, 0%, 100%, 0.2)',
  prominent: '1px solid hsla(0, 0%, 100%, 0.3)',
  inset: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.1)',
} as const;

// Shadow treatments for floating glass
export const glassShadows = {
  float: '0 8px 32px hsla(0, 0%, 0%, 0.3), 0 2px 8px hsla(0, 0%, 0%, 0.2)',
  elevated: '0 16px 48px hsla(0, 0%, 0%, 0.4), 0 4px 16px hsla(0, 0%, 0%, 0.25)',
  subtle: '0 4px 16px hsla(0, 0%, 0%, 0.2)',
} as const;
```

### Step 2: CSS Custom Properties for Glass

```css
/* src/app/globals.css - Glass material system */

:root {
  /* Glass blur intensities */
  --glass-blur-ultra-thin: 4px;
  --glass-blur-thin: 8px;
  --glass-blur-regular: 16px;
  --glass-blur-thick: 24px;
  --glass-blur-chrome: 20px;

  /* Glass saturation boost */
  --glass-saturation: 180%;
  --glass-chrome-saturation: 200%;

  /* Glass backgrounds - light mode */
  --glass-ultra-thin-bg: hsla(0, 0%, 100%, 0.1);
  --glass-thin-bg: hsla(0, 0%, 100%, 0.15);
  --glass-regular-bg: hsla(0, 0%, 100%, 0.2);
  --glass-thick-bg: hsla(0, 0%, 100%, 0.3);
  --glass-chrome-bg: linear-gradient(135deg, hsla(0, 0%, 100%, 0.4), hsla(0, 0%, 100%, 0.1));

  /* Glass borders */
  --glass-border-subtle: 1px solid hsla(0, 0%, 100%, 0.1);
  --glass-border-light: 1px solid hsla(0, 0%, 100%, 0.2);
  --glass-border-prominent: 1px solid hsla(0, 0%, 100%, 0.3);
  --glass-border-inner: inset 0 1px 0 hsla(0, 0%, 100%, 0.1);

  /* Glass shadows */
  --glass-shadow-float: 0 8px 32px hsla(0, 0%, 0%, 0.3), 0 2px 8px hsla(0, 0%, 0%, 0.2);
  --glass-shadow-elevated: 0 16px 48px hsla(0, 0%, 0%, 0.4), 0 4px 16px hsla(0, 0%, 0%, 0.25);
  --glass-shadow-subtle: 0 4px 16px hsla(0, 0%, 0%, 0.2);

  /* Noise texture */
  --glass-noise: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  --glass-noise-opacity: 0.03;
}

/* Dark mode glass adjustments */
.dark {
  --glass-ultra-thin-bg: hsla(0, 0%, 0%, 0.1);
  --glass-thin-bg: hsla(0, 0%, 0%, 0.15);
  --glass-regular-bg: hsla(0, 0%, 0%, 0.2);
  --glass-thick-bg: hsla(0, 0%, 0%, 0.3);
  --glass-chrome-bg: linear-gradient(135deg, hsla(0, 0%, 100%, 0.15), hsla(0, 0%, 0%, 0.2));

  --glass-border-subtle: 1px solid hsla(0, 0%, 100%, 0.05);
  --glass-border-light: 1px solid hsla(0, 0%, 100%, 0.1);
  --glass-border-prominent: 1px solid hsla(0, 0%, 100%, 0.15);

  --glass-noise-opacity: 0.02;
}
```

### Step 3: Core GlassSurface Component

```typescript
// src/components/atoms/GlassSurface.tsx

'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type GlassMaterial = 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chrome';
type GlassBorder = 'none' | 'subtle' | 'light' | 'prominent';

interface GlassSurfaceProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  material?: GlassMaterial;
  border?: GlassBorder;
  shadow?: 'none' | 'subtle' | 'float' | 'elevated';
  noise?: boolean;
  tint?: string;
  innerGlow?: boolean;
  children: React.ReactNode;
}

const materialClasses: Record<GlassMaterial, string> = {
  ultraThin: 'backdrop-blur-[4px] backdrop-saturate-[180%] bg-[var(--glass-ultra-thin-bg)]',
  thin: 'backdrop-blur-[8px] backdrop-saturate-[180%] bg-[var(--glass-thin-bg)]',
  regular: 'backdrop-blur-[16px] backdrop-saturate-[180%] bg-[var(--glass-regular-bg)]',
  thick: 'backdrop-blur-[24px] backdrop-saturate-[180%] bg-[var(--glass-thick-bg)]',
  chrome: 'backdrop-blur-[20px] backdrop-saturate-[200%] bg-[var(--glass-chrome-bg)]',
};

const borderClasses: Record<GlassBorder, string> = {
  none: '',
  subtle: 'border border-white/10',
  light: 'border border-white/20',
  prominent: 'border border-white/30',
};

const shadowClasses = {
  none: '',
  subtle: 'shadow-[var(--glass-shadow-subtle)]',
  float: 'shadow-[var(--glass-shadow-float)]',
  elevated: 'shadow-[var(--glass-shadow-elevated)]',
};

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface(
    {
      material = 'regular',
      border = 'subtle',
      shadow = 'none',
      noise = true,
      tint,
      innerGlow = false,
      className,
      children,
      style,
      ...props
    },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          materialClasses[material],
          borderClasses[border],
          shadowClasses[shadow],
          className
        )}
        style={{
          ...style,
          ...(tint && { backgroundColor: tint }),
        }}
        {...props}
      >
        {/* Noise texture overlay */}
        {noise && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'var(--glass-noise)',
              opacity: 'var(--glass-noise-opacity)',
              mixBlendMode: 'overlay',
            }}
            aria-hidden="true"
          />
        )}

        {/* Inner glow for depth */}
        {innerGlow && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: 'inset 0 1px 0 hsla(0, 0%, 100%, 0.1)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);
```

### Step 4: GlassCard Component

```typescript
// src/components/molecules/GlassCard.tsx

'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { GlassSurface } from '../atoms/GlassSurface';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  tiltEffect?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  interactive = false,
  tiltEffect = false,
  glowOnHover = false,
  onClick,
}: GlassCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [5, -5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-5, 5]), {
    stiffness: 300,
    damping: 30,
  });

  const glowX = useTransform(x, [-100, 100], ['0%', '100%']);
  const glowY = useTransform(y, [-100, 100], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn(
        'relative',
        interactive && 'cursor-pointer',
        className
      )}
      style={{
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
    >
      <GlassSurface
        material="regular"
        border="light"
        shadow="float"
        innerGlow
        className="rounded-2xl"
        style={{
          rotateX: tiltEffect ? rotateX : 0,
          rotateY: tiltEffect ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Hover glow effect */}
        {glowOnHover && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at ${glowX} ${glowY}, hsla(210, 100%, 60%, 0.15), transparent 50%)`,
            }}
          />
        )}

        {children}
      </GlassSurface>
    </motion.div>
  );
}
```

### Step 5: GlassModal Component

```typescript
// src/components/organisms/GlassModal.tsx

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassSurface } from '../atoms/GlassSurface';
import { Button } from '../atoms/Button';
import { cn } from '@/lib/utils';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
    },
  },
};

export function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
}: GlassModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className={cn('relative w-full', sizeClasses[size])}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <GlassSurface
              material="thick"
              border="light"
              shadow="elevated"
              innerGlow
              className="rounded-3xl"
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold text-white"
                    >
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                      aria-label="Close modal"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </GlassSurface>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

### Step 6: GlassSheet (Bottom Sheet)

```typescript
// src/components/organisms/GlassSheet.tsx

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { GlassSurface } from '../atoms/GlassSurface';
import { cn } from '@/lib/utils';

interface GlassSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
  showHandle?: boolean;
}

const heightClasses = {
  auto: 'max-h-[80vh]',
  half: 'h-[50vh]',
  full: 'h-[90vh]',
};

export function GlassSheet({
  isOpen,
  onClose,
  children,
  height = 'auto',
  showHandle = true,
}: GlassSheetProps) {
  const dragControls = useDragControls();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              'absolute bottom-0 left-0 right-0 overflow-hidden',
              heightClasses[height]
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
            }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <GlassSurface
              material="thick"
              border="prominent"
              shadow="elevated"
              className="h-full rounded-t-3xl"
            >
              {/* Drag handle */}
              {showHandle && (
                <div
                  className="flex justify-center py-3"
                  onPointerDown={(e) => dragControls.start(e)}
                >
                  <div className="h-1.5 w-10 rounded-full bg-white/30" />
                </div>
              )}

              {/* Content */}
              <div className={cn(
                'overflow-y-auto px-6 pb-8',
                showHandle ? 'pt-2' : 'pt-6',
                height === 'auto' ? 'max-h-[calc(80vh-24px)]' : 'h-[calc(100%-24px)]'
              )}>
                {children}
              </div>
            </GlassSurface>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

### Step 7: GlassNavBar Component

```typescript
// src/components/organisms/GlassNavBar.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassSurface } from '../atoms/GlassSurface';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GlassNavBarProps {
  items: NavItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
  position?: 'top' | 'bottom';
}

export function GlassNavBar({
  items,
  activeItem,
  onItemSelect,
  position = 'bottom',
}: GlassNavBarProps) {
  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 px-4 pb-safe',
        position === 'bottom' ? 'bottom-0' : 'top-0'
      )}
    >
      <GlassSurface
        material="thick"
        border="light"
        shadow="float"
        className={cn(
          'mx-auto max-w-md',
          position === 'bottom' ? 'mb-4 rounded-2xl' : 'mt-4 rounded-2xl'
        )}
      >
        <nav className="flex items-center justify-around px-2 py-3">
          {items.map((item) => {
            const isActive = item.id === activeItem;

            return (
              <button
                key={item.id}
                onClick={() => onItemSelect(item.id)}
                className="relative flex flex-col items-center gap-1 px-4 py-1"
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-xl bg-white/10"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  className={cn(
                    'relative z-10 transition-colors',
                    isActive ? 'text-blue-400' : 'text-white/60'
                  )}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  {item.icon}
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    'relative z-10 text-xs font-medium transition-colors',
                    isActive ? 'text-blue-400' : 'text-white/60'
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </GlassSurface>
    </div>
  );
}
```

### Step 8: Vibrancy Effect Hook

```typescript
// src/hooks/useVibrancy.ts

'use client';

import { useEffect, useRef, useState } from 'react';

interface VibrancyOptions {
  sampleRate?: number;
  blendMode?: 'luminosity' | 'color' | 'overlay';
}

interface VibrancyColor {
  hue: number;
  saturation: number;
  lightness: number;
}

export function useVibrancy(
  containerRef: React.RefObject<HTMLElement>,
  options: VibrancyOptions = {}
) {
  const { sampleRate = 100, blendMode = 'luminosity' } = options;
  const [dominantColor, setDominantColor] = useState<VibrancyColor>({ hue: 0, saturation: 0, lightness: 50 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const sampleColors = () => {
      const container = containerRef.current;
      if (!container) return;

      // This is a simplified version - in production, you'd use
      // html2canvas or similar to capture the actual content
      // For now, we'll use a placeholder that transitions smoothly
    };

    const interval = setInterval(sampleColors, sampleRate);
    return () => clearInterval(interval);
  }, [containerRef, sampleRate]);

  return {
    dominantColor,
    tintStyle: {
      backgroundColor: `hsla(${dominantColor.hue}, ${dominantColor.saturation}%, ${dominantColor.lightness}%, 0.1)`,
      mixBlendMode: blendMode,
    },
  };
}
```

### Step 9: Feature Detection and Fallbacks

```typescript
// src/lib/glass-support.ts

export function checkGlassSupport(): {
  backdropFilter: boolean;
  backdropBlur: boolean;
  saturation: boolean;
} {
  if (typeof window === 'undefined') {
    return { backdropFilter: true, backdropBlur: true, saturation: true };
  }

  const testElement = document.createElement('div');

  // Check backdrop-filter support
  testElement.style.cssText = 'backdrop-filter: blur(1px)';
  const backdropFilter = testElement.style.backdropFilter !== '';

  // Check -webkit- prefix
  testElement.style.cssText = '-webkit-backdrop-filter: blur(1px)';
  const webkitBackdropFilter = testElement.style.webkitBackdropFilter !== '';

  const backdropBlur = backdropFilter || webkitBackdropFilter;

  // Check saturate support
  testElement.style.cssText = 'backdrop-filter: saturate(180%)';
  const saturation = testElement.style.backdropFilter !== '';

  return {
    backdropFilter: backdropFilter || webkitBackdropFilter,
    backdropBlur,
    saturation,
  };
}

// CSS fallback classes
export const glassFallbackStyles = `
  /* Fallback for browsers without backdrop-filter */
  @supports not (backdrop-filter: blur(1px)) {
    .glass-surface {
      background-color: rgba(30, 30, 30, 0.95) !important;
    }

    .glass-surface-light {
      background-color: rgba(255, 255, 255, 0.95) !important;
    }
  }
`;
```

---

## Integration Points

### Files to Create
- `src/design-system/tokens/materials.ts` - Glass material token definitions
- `src/components/atoms/GlassSurface.tsx` - Core glass surface primitive
- `src/components/molecules/GlassCard.tsx` - Interactive glass cards
- `src/components/organisms/GlassModal.tsx` - Modal dialogs
- `src/components/organisms/GlassSheet.tsx` - Bottom sheet component
- `src/components/organisms/GlassNavBar.tsx` - Navigation bar
- `src/hooks/useVibrancy.ts` - Dynamic color tinting
- `src/lib/glass-support.ts` - Feature detection utilities

### Files to Modify
- `src/app/globals.css` - Add glass custom properties
- `src/app/page.tsx` - Replace solid backgrounds with glass surfaces
- `src/app/layout.tsx` - Add feature detection and fallback styles

### Component Hierarchy
```
GlassSurface (atom)
  |
  +-- GlassCard (molecule)
  |
  +-- GlassModal (organism)
  |
  +-- GlassSheet (organism)
  |
  +-- GlassNavBar (organism)
```

---

## Technical Specifications

### Performance Considerations
- **GPU Acceleration**: `backdrop-filter` is GPU-accelerated on modern browsers
- **Layer Promotion**: Use `will-change: transform` sparingly to promote layers
- **Reduce Repaints**: Minimize DOM changes behind glass surfaces
- **Batch Updates**: Group style changes to reduce layout thrashing

### Browser Support
| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 76+ | Full |
| Safari | 9+ | Full (prefixed) |
| Firefox | 103+ | Full |
| Edge | 79+ | Full |
| iOS Safari | 9+ | Full |

### Fallback Strategy
1. Detect `backdrop-filter` support on mount
2. Apply solid semi-transparent background if unsupported
3. Remove blur effects but keep shadows and borders
4. Maintain visual hierarchy through opacity differences

---

## Dependencies

### Required
- `framer-motion` - Animations and gestures
- `clsx` / `tailwind-merge` - Class name utilities

### Optional
- `html2canvas` - For true vibrancy color sampling

---

## Success Criteria

1. **Visual Fidelity**: Glass effects indistinguishable from native iOS/macOS
2. **Performance**: 60fps scroll and interaction on glass surfaces
3. **Consistency**: All glass surfaces share material tokens
4. **Accessibility**: Glass surfaces maintain 4.5:1 contrast ratio for text
5. **Fallbacks**: Graceful degradation on unsupported browsers

---

## Estimated Effort

- **Design Token System**: 2 hours
- **Core GlassSurface Component**: 3 hours
- **Modal and Sheet Components**: 4 hours
- **Navigation Bar**: 2 hours
- **Feature Detection & Fallbacks**: 2 hours
- **Integration Testing**: 3 hours
- **Total**: 16 hours (2 days)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance on older devices | Medium | Reduce blur intensity, disable noise texture |
| Browser compatibility issues | Low | Comprehensive fallback system with feature detection |
| Excessive blur causing eye strain | Medium | Limit blur to 24px max, provide reduced effects mode |
| Text readability on glass | High | Ensure proper contrast, use semi-bold fonts |
| GPU memory usage | Low | Limit number of simultaneous glass layers to 5-6 |
