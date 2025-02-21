import { useRef } from 'react';
import { canvasWidth, canvasHeight } from '../../constants';
import { useMapUpdater } from './updater';

export function MapDisplay({ time, needQuickUpdate }: { time: number; needQuickUpdate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMapUpdater(canvasRef, time, needQuickUpdate);

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />;
}
