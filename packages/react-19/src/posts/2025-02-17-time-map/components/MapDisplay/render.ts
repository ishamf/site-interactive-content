import { canvasHeight, canvasWidth } from '../../constants';
import type { MapImageData } from '../../images';
import { createAlphaCalculator } from './math';

export function renderMapAtTime({
  mapImageData: { dayImageData, nightImageData },
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
  let start = performance.now();

  const partHeight = canvasHeight / parts;

  const imageData = ctx.createImageData(canvasWidth, partHeight);

  let now = performance.now();

  console.log('createImageData', now - start);
  start = now;

  const getAlpha = createAlphaCalculator(time);

  const alphaCache = [];

  for (let ry = 0; ry < partHeight; ry++) {
    const y = ry + partHeight * partIndex;
    if (alphaSize > 1 && y % alphaSize === 0) {
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
        const sourceIdx = (y * canvasWidth + x) * 4 + i;
        const targetIdx = (ry * canvasWidth + x) * 4 + i;

        imageData.data[targetIdx] =
          dayImageData.data[sourceIdx] * alpha + nightImageData.data[sourceIdx] * (1 - alpha);
      }

      imageData.data[(ry * canvasWidth + x) * 4 + 3] = 255;
    }
  }

  now = performance.now();
  console.log('renderMap', now - start);
  start = now;

  return imageData;
}
