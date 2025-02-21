import { RefObject, useEffect } from 'react';
import { canvasWidth, canvasHeight } from '../../constants';
import { createAlphaCalculator } from './math';
import { useQuery } from '@tanstack/react-query';

async function loadImages() {
  const { loadImageData } = await import('../../images');

  return loadImageData();
}
type MapImageData = Awaited<ReturnType<typeof loadImages>>;

function renderMapAtTime({
  imageData: { dayImageData, nightImageData },
  ctx,
  time,
  alphaSize = 1,
}: {
  imageData: MapImageData;
  ctx: CanvasRenderingContext2D;
  time: number;
  alphaSize: number;
}) {
  let start = performance.now();

  const imageData = ctx.createImageData(canvasWidth, canvasHeight);

  let now = performance.now();

  console.log('createImageData', now - start);
  start = now;

  const getAlpha = createAlphaCalculator(time);

  const alphaCache = [];

  for (let y = 0; y < canvasHeight; y++) {
    if (alphaSize > 1 && y % alphaSize !== 0) {
      alphaCache.length = 0;
    }

    for (let x = 0; x < canvasWidth; x++) {
      let alpha: number;

      if (alphaSize <= 1) {
        const latitude = -((y / canvasHeight) * 180 - 90);
        const longitude = (x / canvasWidth) * 360 - 180;

        alpha = getAlpha(latitude, longitude);
      } else {
        const cacheIdx = Math.floor(x / alphaSize);

        if (alphaCache.length < cacheIdx + 1) {
          const latitude = -((y / canvasHeight) * 180 - 90);
          const longitude = (x / canvasWidth) * 360 - 180;

          alpha = getAlpha(latitude, longitude);
          alphaCache[cacheIdx] = alpha;
        } else {
          alpha = alphaCache[cacheIdx];
        }
      }

      for (let i = 0; i < 3; i++) {
        const idx = (y * canvasWidth + x) * 4 + i;

        imageData.data[idx] =
          dayImageData.data[idx] * alpha + nightImageData.data[idx] * (1 - alpha);
      }

      imageData.data[(y * canvasWidth + x) * 4 + 3] = 255;
    }
  }

  now = performance.now();
  console.log('renderMap', now - start);
  start = now;

  ctx.putImageData(imageData, 0, 0);

  now = performance.now();
  console.log('putImageData', now - start);
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

    renderMapAtTime({ imageData, ctx, time, alphaSize: 20 });
  }, [time, imageData, canvasRef]);
}
