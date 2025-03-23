import { useCallback, useRef, useState } from 'react';
import { DAY_LENGTH } from './constants';

const ACCURACY_LIMIT = 5 * 60 * 1000; // 5 minutes

interface DragState {
  initialTime: number;
  initialX: number;
  pointerId: number;

  roundedInitialTime: number;
  roundedInitialX: number;
}

export function useGrabTime({
  container,
  time,
  setTime,
}: {
  container: HTMLElement | null;
  time: number;
  setTime: (time: number) => void;
}) {
  const [isGrabbing, setIsGrabbing] = useState(false);
  const stateRef = useRef(null as DragState | null);

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
        initialX: offsetX,
        pointerId: event.pointerId,
        roundedInitialTime,
        roundedInitialX: Math.round(offsetX / offsetAccuracyLimit) * offsetAccuracyLimit,
      };
    },
    [container, time]
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

      setTime(newTime);
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
      setTime(stateRef.current.initialTime);
      setIsGrabbing(false);
      stateRef.current = null;
    },
    [setTime]
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
