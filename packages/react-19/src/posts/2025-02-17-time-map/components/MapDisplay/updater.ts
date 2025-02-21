import { RefObject, useEffect } from 'react';
import { canvasHeight } from '../../constants';
import { useQuery } from '@tanstack/react-query';
import type { MapImageData } from '../../images';
import { renderMapAtTime } from './render';

function drawMapAtTime({
  mapImageData,
  ctx,
  time,
  alphaSize = 1,
  partIndex,
  parts,
}: {
  mapImageData: MapImageData;
  ctx: CanvasRenderingContext2D;
  time: number;
  alphaSize: number;
  partIndex: number;
  parts: number;
}) {
  const imageData = renderMapAtTime({
    mapImageData,
    ctx,
    time,
    alphaSize,
    partIndex,
    parts,
  });

  const start = performance.now();

  const partHeight = canvasHeight / parts;

  ctx.putImageData(imageData, 0, partHeight * partIndex);

  const now = performance.now();
  console.log('putImageData', now - start);
}

export function useMapUpdater(canvasRef: RefObject<HTMLCanvasElement | null>, time: number) {
  const { data: imageData } = useQuery({
    queryKey: ['mapImageData'],
    queryFn: async () => {
      const { loadImageData } = await import('../../images');

      return loadImageData();
    },
  });

  useEffect(() => {
    if (!imageData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMapAtTime({ mapImageData: imageData, ctx, time, alphaSize: 20, parts: 8, partIndex: 4 });
  }, [time, imageData, canvasRef]);
}
