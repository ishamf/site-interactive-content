import { useCallback, useEffect, useRef, useState } from 'react';
import { DAY_LENGTH } from './constants';

const ACCURACY_LIMIT = 5 * 60 * 1000; // 5 minutes

interface DragState {
  initialTime: number;
  initialX: number;
  pointerId: number;

  roundedInitialTime: number;
  roundedInitialX: number;

  hasMoved: boolean;
  isTrackingCurrentTimeAtStart: boolean;
}

export function useGrabTime({
  container,
  time,
  isTrackingCurrentTime,
  setTime,
  trackCurrentTime,
  onDragEnd,
}: {
  container: HTMLElement | null;
  time: number;
  isTrackingCurrentTime: boolean;
  setTime: (time: number) => void;
  trackCurrentTime: () => void;
  onDragEnd?: () => void;
}) {
  const [isGrabbing, setIsGrabbing] = useState(false);
  const stateRef = useRef(null as DragState | null);

  const prevIsGrabbing = useRef(isGrabbing);
  useEffect(() => {
    if (prevIsGrabbing.current && !isGrabbing && onDragEnd) {
      onDragEnd();
    }
    prevIsGrabbing.current = isGrabbing;
  }, [isGrabbing, onDragEnd]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!container) return;

      const containerWidth = container.clientWidth;
      const offsetAccuracyLimit = (ACCURACY_LIMIT / DAY_LENGTH) * containerWidth;

      const offsetX = event.nativeEvent.offsetX;

      const roundedInitialTime = Math.round(time / ACCURACY_LIMIT) * ACCURACY_LIMIT;

      container.setPointerCapture(event.pointerId);

      setIsGrabbing(true);

      stateRef.current = {
        initialTime: time,
        isTrackingCurrentTimeAtStart: isTrackingCurrentTime,
        initialX: offsetX,
        pointerId: event.pointerId,
        roundedInitialTime,
        roundedInitialX: Math.round(offsetX / offsetAccuracyLimit) * offsetAccuracyLimit,
        hasMoved: false,
      };
    },
    [container, isTrackingCurrentTime, time]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!stateRef.current || !container || event.pointerId !== stateRef.current.pointerId) return;

      const containerWidth = container.clientWidth;

      const offsetX = event.nativeEvent.offsetX;

      const deltaX = offsetX - stateRef.current.initialX;

      const deltaT = (deltaX / containerWidth) * DAY_LENGTH;

      const roundedDeltaT = Math.round(deltaT / ACCURACY_LIMIT) * ACCURACY_LIMIT;

      const newTime = stateRef.current.roundedInitialTime - roundedDeltaT;

      if (stateRef.current.hasMoved || roundedDeltaT !== 0) {
        setTime(newTime);
        stateRef.current.hasMoved = true;
      }
    },
    [container, setTime]
  );

  // In mac chrome 134, sometimes pointerup is not fired, use pointerleave instead
  const onPointerUpOrLeave = useCallback((event: React.PointerEvent) => {
    if (!stateRef.current || event.pointerId !== stateRef.current.pointerId) return;

    setIsGrabbing(false);
    stateRef.current = null;
  }, []);

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => {
      if (!stateRef.current || event.pointerId !== stateRef.current.pointerId) return;

      if (stateRef.current.hasMoved) {
        if (stateRef.current.isTrackingCurrentTimeAtStart) {
          trackCurrentTime();
        } else {
          setTime(stateRef.current.initialTime);
        }
      }
      setIsGrabbing(false);
      stateRef.current = null;
    },
    [setTime, trackCurrentTime]
  );

  return {
    isGrabbing,
    listeners: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerUpOrLeave,
      onPointerLeave: onPointerUpOrLeave,
      onPointerCancel,
    },
  };
}

export function waitForMs(ms: number) {
  return new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
}
