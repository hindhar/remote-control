'use client';

import { useCallback, useRef, type MouseEvent, type TouchEvent } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  threshold?: number;
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

/**
 * Hook to detect long press gestures
 */
export function useLongPress({
  onLongPress,
  threshold = 500,
  onStart,
  onFinish,
  onCancel,
}: UseLongPressOptions) {
  const isLongPress = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      onStart?.();
      isLongPress.current = false;

      timeoutRef.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
      }, threshold);
    },
    [onLongPress, threshold, onStart]
  );

  const cancel = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (isLongPress.current) {
        onFinish?.();
      } else {
        onCancel?.();
      }
    },
    [onFinish, onCancel]
  );

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
}
