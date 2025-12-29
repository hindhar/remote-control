'use client';

import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy';

/**
 * Hook to trigger haptic feedback on supported devices
 * Uses the Vibration API as a fallback on non-iOS devices
 */
export function useHaptics() {
  const triggerHaptic = useCallback((intensity: HapticIntensity = 'light') => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Try to use the Vibration API (works on Android)
    if ('vibrate' in navigator) {
      const durations: Record<HapticIntensity, number> = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(durations[intensity]);
    }

    // Note: iOS Safari doesn't support the Vibration API
    // but will have native haptic feedback through CSS touch-action
    // and native form controls
  }, []);

  const isSupported = typeof window !== 'undefined' && 'vibrate' in navigator;

  return {
    triggerHaptic,
    isSupported,
  };
}
