/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { flMod } from '../../../../utils/math';
import { useRef } from 'react';

const DAY_LENGTH = 24 * 3600 * 1000;
const ACCURACY_LIMIT = 5 * 60 * 1000; // 5 minutes

interface DragState {
  initialTime: number;
  initialX: number;

  roundedInitialTime: number;
  roundedInitialX: number;
}

export function TimeBar({ time, setTime }: { time: number; setTime: (time: number) => void }) {
  const dayPercentage = (flMod(time, DAY_LENGTH) / DAY_LENGTH) * 100;
  const offset = dayPercentage > 50 ? dayPercentage - 50 : dayPercentage + 50;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef(null as DragState | null);

  function onPointerDown(event: React.PointerEvent) {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const offsetAccuracyLimit = (ACCURACY_LIMIT / DAY_LENGTH) * containerWidth;

    const offsetX = event.nativeEvent.offsetX;

    const roundedInitialTime = Math.round(time / ACCURACY_LIMIT) * ACCURACY_LIMIT;

    containerRef.current.setPointerCapture(event.pointerId);

    stateRef.current = {
      initialTime: time,
      initialX: offsetX,
      roundedInitialTime,
      roundedInitialX: Math.round(offsetX / offsetAccuracyLimit) * offsetAccuracyLimit,
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!stateRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;

    const offsetX = event.nativeEvent.offsetX;

    const deltaX = offsetX - stateRef.current.initialX;

    const deltaT = (deltaX / containerWidth) * DAY_LENGTH;

    const roundedDeltaT = Math.round(deltaT / ACCURACY_LIMIT) * ACCURACY_LIMIT;

    const newTime = stateRef.current.roundedInitialTime - roundedDeltaT;

    setTime(newTime);
  }

  function onPointerUp() {
    stateRef.current = null;
  }

  function onPointerCancel() {
    if (!stateRef.current) return;
    setTime(stateRef.current.initialTime);
    stateRef.current = null;
  }

  return (
    <div
      className="w-full h-8 overflow-hidden cursor-grab select-none"
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div
        css={css`
          --day-color: #f0fffe;
          --night-color: #000b5b;
          pointer-events: none;
          width: 200%;
          height: 100%;
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
          transform: `translateX(-${offset / 2}%)`,
        }}
      ></div>
    </div>
  );
}
