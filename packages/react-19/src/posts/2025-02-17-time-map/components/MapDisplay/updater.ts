import { RefObject, useEffect } from 'react';
import { canvasWidth, canvasHeight } from '../../constants';
import { createAlphaCalculator } from './math';
import { useQuery } from '@tanstack/react-query';

async function loadImages() {
  const { loadImageData } = await import('../../images');

  return loadImageData();
}
type MapImageData = Awaited<ReturnType<typeof loadImages>>;

function renderMapAtTime(
  { dayImageData, nightImageData }: MapImageData,
  ctx: CanvasRenderingContext2D,
  time: number
) {
  const imageData = ctx.createImageData(canvasWidth, canvasHeight);

  const getAlpha = createAlphaCalculator(time);

  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const latitude = -((y / canvasHeight) * 180 - 90);
      const longitude = (x / canvasWidth) * 360 - 180;

      const alpha = getAlpha(latitude, longitude);

      for (let i = 0; i < 3; i++) {
        const idx = (y * canvasWidth + x) * 4 + i;

        imageData.data[idx] =
          dayImageData.data[idx] * alpha + nightImageData.data[idx] * (1 - alpha);
      }

      imageData.data[(y * canvasWidth + x) * 4 + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function useMapUpdater(canvasRef: RefObject<HTMLCanvasElement | null>, time: number) {
  const { data: imageData } = useQuery({
    queryKey: ['mapImageData'],
    queryFn: loadImages,
  });

  useEffect(() => {
    if (!imageData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderMapAtTime(imageData, ctx, time);
  }, [time, imageData, canvasRef]);
}
