/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { flMod } from '../../../../utils/math';
import { useRef, useCallback } from 'react';

const HOUR_LENGTH = 3600 * 1000;
const DAY_LENGTH = 24 * 3600 * 1000;
const ACCURACY_LIMIT = 5 * 60 * 1000; // 5 minutes

interface DragState {
  initialTime: number;
  initialX: number;
  pointerId: number;

  roundedInitialTime: number;
  roundedInitialX: number;
}

export function TimeBar({ time, setTime }: { time: number; setTime: (time: number) => void }) {
  const dayPercentage = (flMod(time, DAY_LENGTH) / DAY_LENGTH) * 100;
  const hourPercentage = (flMod(time, HOUR_LENGTH) / HOUR_LENGTH) * 100;
  const offset2X = dayPercentage > 50 ? dayPercentage - 50 : dayPercentage + 50;
  const offset25 = ((hourPercentage > 50 ? hourPercentage - 50 : hourPercentage + 50) * 1) / 25;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef(null as DragState | null);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const offsetAccuracyLimit = (ACCURACY_LIMIT / DAY_LENGTH) * containerWidth;

      const offsetX = event.nativeEvent.offsetX;

      const roundedInitialTime = Math.round(time / ACCURACY_LIMIT) * ACCURACY_LIMIT;

      containerRef.current.setPointerCapture(event.pointerId);

      stateRef.current = {
        initialTime: time,
        initialX: offsetX,
        pointerId: event.pointerId,
        roundedInitialTime,
        roundedInitialX: Math.round(offsetX / offsetAccuracyLimit) * offsetAccuracyLimit,
      };
    },
    [time]
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (
        !stateRef.current ||
        !containerRef.current ||
        event.pointerId !== stateRef.current.pointerId
      )
        return;

      const containerWidth = containerRef.current.clientWidth;

      const offsetX = event.nativeEvent.offsetX;

      const deltaX = offsetX - stateRef.current.initialX;

      const deltaT = (deltaX / containerWidth) * DAY_LENGTH;

      const roundedDeltaT = Math.round(deltaT / ACCURACY_LIMIT) * ACCURACY_LIMIT;

      const newTime = stateRef.current.roundedInitialTime - roundedDeltaT;

      setTime(newTime);
    },
    [setTime]
  );

  // In mac chrome 134, sometimes pointerup is not fired, use pointerleave instead
  const onPointerUpOrLeave = useCallback((event: React.PointerEvent) => {
    if (!stateRef.current || event.pointerId !== stateRef.current.pointerId) return;

    stateRef.current = null;
  }, []);

  const onPointerCancel = useCallback(
    (event: React.PointerEvent) => {
      if (!stateRef.current || event.pointerId !== stateRef.current.pointerId) return;
      setTime(stateRef.current.initialTime);
      stateRef.current = null;
    },
    [setTime]
  );

  return (
    <div
      className="w-full h-8 overflow-hidden cursor-grab select-none touch-pan-y"
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUpOrLeave}
      onPointerLeave={onPointerUpOrLeave}
      onPointerCancel={onPointerCancel}
    >
      <div className="pointer-events-none w-full h-full relative">
        <div
          css={css`
            --day-color: #f0fffe;
            --night-color: #000b5b;
            width: 200%;
            height: 50%;
            background: repeating-linear-gradient(
              to right,
              var(--night-color) 0%,
              var(--night-color) 10%,

              var(--day-color) 15%,
              var(--day-color) 25%,
              var(--day-color) 35%,

              var(--night-color) 40%,
              var(--night-color) 50%
            );
          `}
          style={{
            transform: `translateX(-${offset2X / 2}%)`,
          }}
        ></div>
        <div
          className="relative"
          css={css`
            width: ${(100 * 25) / 24}%;
          `}
          style={{
            transform: `translateX(-${offset25}%)`,
          }}
        >
          {Array(25)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="w-0.5 h-2 absolute bg-gray-300 "
                style={{
                  transform: `translateX(-50%)`,
                  left: `${(i * 100) / 24}%`,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
