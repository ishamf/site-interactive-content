import { createAlphaCalculator } from '../../../math';
import { SunAndEarthState } from '../../../types';

export function renderAlphaMap({
  width,
  height,
  state,
}: {
  width: number;
  height: number;
  state: SunAndEarthState;
}) {
  const imageData = new ImageData(width, height);

  const { getAlphaWithPrecalculatedComponents: getAlpha } = createAlphaCalculator({
    ...state,
    precalculate: { width, height },
  });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = getAlpha(x, y);

      imageData.data[(y * width + x) * 4 + 3] = alpha * 255;
    }
  }

  return imageData;
}
