# Plan 14: Performance Optimization

**Focus**: 60fps animations, optimized bundle size, efficient rendering, and fast initial load for a native-like experience.

---

## Key Decisions

1. **Performance Budget**: <100KB initial JS, <3s FCP on 3G, 60fps animations
2. **Code Splitting**: Dynamic imports for route-based and component-based splitting
3. **Animation Optimization**: GPU-accelerated properties only, use `will-change` strategically
4. **Image Optimization**: Next.js Image component with WebP/AVIF, lazy loading
5. **State Management**: Minimize re-renders with proper memoization and selective subscriptions

---

## Implementation Steps

### Step 1: Performance Monitoring Hook

```typescript
// src/hooks/usePerformance.ts

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  longTasks: number;
}

interface PerformanceOptions {
  reportInterval?: number;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  warnOnLowFPS?: boolean;
  fpsThreshold?: number;
}

export function usePerformance(options: PerformanceOptions = {}) {
  const {
    reportInterval = 1000,
    onMetrics,
    warnOnLowFPS = true,
    fpsThreshold = 30,
  } = options;

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const longTaskCount = useRef(0);
  const rafId = useRef<number>();

  const measureFPS = useCallback(() => {
    frameCount.current++;

    const currentTime = performance.now();
    const elapsed = currentTime - lastTime.current;

    if (elapsed >= reportInterval) {
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      const frameTime = elapsed / frameCount.current;

      const metrics: PerformanceMetrics = {
        fps,
        frameTime,
        longTasks: longTaskCount.current,
      };

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576);
      }

      onMetrics?.(metrics);

      if (warnOnLowFPS && fps < fpsThreshold) {
        console.warn(`Low FPS detected: ${fps}fps (threshold: ${fpsThreshold}fps)`);
      }

      frameCount.current = 0;
      lastTime.current = currentTime;
      longTaskCount.current = 0;
    }

    rafId.current = requestAnimationFrame(measureFPS);
  }, [reportInterval, onMetrics, warnOnLowFPS, fpsThreshold]);

  useEffect(() => {
    // Track long tasks
    let observer: PerformanceObserver | null = null;

    if ('PerformanceObserver' in window) {
      try {
        observer = new PerformanceObserver((list) => {
          longTaskCount.current += list.getEntries().length;
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }
    }

    // Start FPS measurement
    rafId.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      observer?.disconnect();
    };
  }, [measureFPS]);
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  const startTime = useRef<number>();

  useEffect(() => {
    if (startTime.current) {
      const renderTime = performance.now() - startTime.current;
      if (renderTime > 16) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  startTime.current = performance.now();
}
```

### Step 2: Bundle Optimization Configuration

```typescript
// next.config.ts

import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 428, 744, 1024, 1280, 1440],
    imageSizes: [64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compress output
  compress: true,

  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
```

### Step 3: Lazy Loading Utilities

```typescript
// src/lib/lazy.ts

import dynamic from 'next/dynamic';
import React from 'react';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-fill-secondary)] border-t-[var(--color-blue)]" />
    </div>
  );
}

// Create lazy component with loading state
export function lazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ReactNode;
    ssr?: boolean;
  } = {}
) {
  return dynamic(importFn, {
    loading: () => <>{options.loading || <LoadingFallback />}</>,
    ssr: options.ssr ?? true,
  });
}

// Preload component on hover/focus
export function usePreload(importFn: () => Promise<any>) {
  const preloaded = React.useRef(false);

  const preload = React.useCallback(() => {
    if (!preloaded.current) {
      preloaded.current = true;
      importFn();
    }
  }, [importFn]);

  return {
    onMouseEnter: preload,
    onFocus: preload,
  };
}
```

### Step 4: Optimized Animation Utilities

```typescript
// src/lib/animation-utils.ts

import { MotionStyle } from 'framer-motion';

// GPU-accelerated properties only
export const gpuAcceleratedStyle: MotionStyle = {
  willChange: 'transform, opacity',
  transform: 'translateZ(0)',
};

// Use transform instead of top/left for positioning
export function transformPosition(x: number, y: number): MotionStyle {
  return {
    transform: `translate3d(${x}px, ${y}px, 0)`,
    willChange: 'transform',
  };
}

// Optimized spring configurations
export const springConfigs = {
  // Fast, snappy - for micro-interactions
  snappy: {
    type: 'spring' as const,
    stiffness: 700,
    damping: 30,
    mass: 0.8,
  },

  // Default - balanced feel
  default: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  // Smooth - for larger movements
  smooth: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
    mass: 1,
  },

  // Reduced motion - instant
  instant: {
    type: 'tween' as const,
    duration: 0,
  },
} as const;

// Defer animation until after first paint
export function useDefferredAnimation<T>(
  animatedValue: T,
  initialValue: T
): T {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

    const id = schedule(() => {
      setValue(animatedValue);
    });

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(id as number);
      } else {
        clearTimeout(id as number);
      }
    };
  }, [animatedValue]);

  return value;
}

import React from 'react';
```

### Step 5: Virtualized List Component

```typescript
// src/components/organisms/VirtualList.tsx

'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  containerHeight,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(containerHeight || 0);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(height / itemHeight);
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2);

    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
    };
  }, [scrollTop, height, itemHeight, items.length, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Update height on resize
  useEffect(() => {
    if (containerHeight) {
      setHeight(containerHeight);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setHeight(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, [containerHeight]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Image Optimization Component

```typescript
// src/components/atoms/OptimizedImage.tsx

'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: React.ReactNode;
  blurHash?: string;
  aspectRatio?: number;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallback,
  blurHash,
  aspectRatio,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            className="absolute inset-0 bg-[var(--color-fill-tertiary)]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {blurHash && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${blurHash})`,
                  backgroundSize: 'cover',
                  filter: 'blur(10px)',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
    </div>
  );
}
```

### Step 7: Memoization Utilities

```typescript
// src/lib/memo.ts

import React, { useMemo, useCallback, useRef, useEffect } from 'react';

// Deep comparison for complex objects
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!deepEqual((a as any)[key], (b as any)[key])) {
      return false;
    }
  }

  return true;
}

// useMemo with deep comparison
export function useDeepMemo<T>(factory: () => T, deps: unknown[]): T {
  const prevDeps = useRef<unknown[]>();
  const value = useRef<T>();

  if (!prevDeps.current || !deepEqual(prevDeps.current, deps)) {
    prevDeps.current = deps;
    value.current = factory();
  }

  return value.current as T;
}

// Stable callback reference
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

// Debounced value
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args) => {
      const now = Date.now();
      const elapsed = now - lastRan.current;

      if (elapsed >= delay) {
        lastRan.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastRan.current = Date.now();
          callback(...args);
        }, delay - elapsed);
      }
    }) as T,
    [callback, delay]
  );
}
```

### Step 8: State Optimization with Zustand

```typescript
// src/store/remote-store.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TVStatus {
  power: boolean;
  volume: number;
  muted: boolean;
  channel: number;
  input: string;
}

interface RemoteState {
  // TV State
  tvStatus: TVStatus;
  setTVStatus: (status: Partial<TVStatus>) => void;

  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Connection status
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useRemoteStore = create<RemoteState>()(
  subscribeWithSelector((set) => ({
    // TV State
    tvStatus: {
      power: false,
      volume: 50,
      muted: false,
      channel: 1,
      input: 'HDMI1',
    },
    setTVStatus: (status) =>
      set((state) => ({
        tvStatus: { ...state.tvStatus, ...status },
      })),

    // Active tab
    activeTab: 'tv',
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Connection status
    isConnected: false,
    setConnected: (connected) => set({ isConnected: connected }),

    // UI State
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
  }))
);

// Selectors for optimal re-renders
export const selectTVPower = (state: RemoteState) => state.tvStatus.power;
export const selectTVVolume = (state: RemoteState) => state.tvStatus.volume;
export const selectActiveTab = (state: RemoteState) => state.activeTab;
export const selectIsConnected = (state: RemoteState) => state.isConnected;

// Custom hook with selector
export function useTVVolume() {
  return useRemoteStore(selectTVVolume);
}

export function useActiveTab() {
  const activeTab = useRemoteStore(selectActiveTab);
  const setActiveTab = useRemoteStore((state) => state.setActiveTab);
  return [activeTab, setActiveTab] as const;
}
```

### Step 9: WebSocket Connection Optimization

```typescript
// src/lib/websocket.ts

type MessageHandler = (data: unknown) => void;

interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class OptimizedWebSocket {
  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private heartbeatTimer?: NodeJS.Timeout;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(private options: WebSocketOptions) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.options.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.flushQueue();
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const type = data.type as string;
        const handlers = this.handlers.get(type);

        if (handlers) {
          // Use microtask to batch handler calls
          queueMicrotask(() => {
            handlers.forEach((handler) => handler(data));
          });
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private scheduleReconnect() {
    const { reconnectInterval = 1000, maxReconnectAttempts = 10 } = this.options;

    if (this.reconnectAttempts < maxReconnectAttempts) {
      const delay = reconnectInterval * Math.pow(2, this.reconnectAttempts);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, Math.min(delay, 30000));
    }
  }

  private startHeartbeat() {
    const { heartbeatInterval = 30000 } = this.options;

    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' });
    }, heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  private flushQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(message);
      }
    }
  }

  send(data: unknown) {
    const message = JSON.stringify(data);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue for later
      this.messageQueue.push(message);
    }
  }

  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.ws?.close();
  }
}

// Singleton instance
let wsInstance: OptimizedWebSocket | null = null;

export function getWebSocket(options: WebSocketOptions): OptimizedWebSocket {
  if (!wsInstance) {
    wsInstance = new OptimizedWebSocket(options);
  }
  return wsInstance;
}
```

### Step 10: Performance Testing Utilities

```typescript
// src/lib/performance-test.ts

interface PerformanceResult {
  name: string;
  duration: number;
  memory?: number;
}

const results: PerformanceResult[] = [];

export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const memoryBefore = (performance as any).memory?.usedJSHeapSize;

  const result = fn();

  const duration = performance.now() - start;
  const memoryAfter = (performance as any).memory?.usedJSHeapSize;

  results.push({
    name,
    duration,
    memory: memoryAfter && memoryBefore ? memoryAfter - memoryBefore : undefined,
  });

  if (duration > 16) {
    console.warn(`Slow operation "${name}": ${duration.toFixed(2)}ms`);
  }

  return result;
}

export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  results.push({ name, duration });

  if (duration > 100) {
    console.warn(`Slow async operation "${name}": ${duration.toFixed(2)}ms`);
  }

  return result;
}

export function getPerformanceResults(): PerformanceResult[] {
  return [...results];
}

export function clearPerformanceResults(): void {
  results.length = 0;
}

// React DevTools performance mark
export function markRenderStart(componentName: string): void {
  performance.mark(`${componentName}-render-start`);
}

export function markRenderEnd(componentName: string): void {
  performance.mark(`${componentName}-render-end`);
  performance.measure(
    `${componentName} render`,
    `${componentName}-render-start`,
    `${componentName}-render-end`
  );
}
```

---

## Integration Points

### Files to Create
- `src/hooks/usePerformance.ts` - FPS and performance monitoring
- `src/lib/lazy.ts` - Lazy loading utilities
- `src/lib/animation-utils.ts` - Optimized animation helpers
- `src/components/organisms/VirtualList.tsx` - Virtualized list
- `src/components/atoms/OptimizedImage.tsx` - Optimized images
- `src/lib/memo.ts` - Memoization utilities
- `src/store/remote-store.ts` - Zustand state store
- `src/lib/websocket.ts` - Optimized WebSocket
- `src/lib/performance-test.ts` - Performance testing

### Files to Modify
- `next.config.ts` - Bundle optimization configuration
- `package.json` - Add `@next/bundle-analyzer`, `zustand`

### Dependencies to Add
```json
{
  "dependencies": {
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^14.0.0"
  }
}
```

---

## Technical Specifications

### Performance Budget
| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint | 1.5s | 2.5s |
| Largest Contentful Paint | 2.0s | 3.0s |
| Time to Interactive | 2.5s | 4.0s |
| Total Bundle Size | 100KB | 150KB |
| Animation Frame Rate | 60fps | 30fps min |
| Long Task Count | 0 | 3 |

### Animation Performance Rules
1. Only animate `transform` and `opacity`
2. Use `will-change` sparingly (max 3 elements per view)
3. Avoid layout thrashing (read, then write)
4. Use `requestAnimationFrame` for JS animations
5. Disable animations on reduced motion preference

### Memory Management
1. Clean up subscriptions in `useEffect` return
2. Use WeakMap for caches when possible
3. Limit event listener count
4. Pool frequently created objects

---

## Success Criteria

1. **Bundle Size**: Initial JS under 100KB gzipped
2. **FCP**: Under 1.5s on 4G connection
3. **Frame Rate**: Consistent 60fps during animations
4. **Memory**: No memory leaks over 1 hour session
5. **Long Tasks**: Zero long tasks during normal usage
6. **Lighthouse Score**: Performance score above 90

---

## Estimated Effort

- **Performance Monitoring**: 2 hours
- **Bundle Optimization**: 3 hours
- **Animation Optimization**: 3 hours
- **Virtual List**: 3 hours
- **State Optimization**: 4 hours
- **WebSocket Optimization**: 2 hours
- **Testing & Tuning**: 4 hours
- **Total**: 21 hours (3 days)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Framer Motion bundle size | Medium | Tree-shake, use motion/lazy |
| Memory leaks in subscriptions | High | Strict cleanup in useEffect |
| WebSocket message flooding | Medium | Message batching and throttling |
| Virtualization scroll jank | Medium | Optimize overscan, use CSS containment |
| State causing cascading re-renders | High | Zustand selectors, React.memo |
