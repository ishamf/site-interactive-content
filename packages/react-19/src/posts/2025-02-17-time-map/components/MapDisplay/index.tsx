import { useRef } from 'react';
import { canvasWidth, canvasHeight } from '../../constants';
import { useMapUpdater } from './updater';

export function MapDisplay({ time }: { time: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMapUpdater(canvasRef, time);

  return (
    <canvas className="max-w-full" ref={canvasRef} width={canvasWidth} height={canvasHeight} />
  );
}
