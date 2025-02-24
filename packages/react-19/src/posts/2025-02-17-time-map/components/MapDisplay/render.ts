import { createAlphaCalculator } from './math';

export function renderAlphaMapAtTime({
  width,
  height,
  time,
}: {
  width: number;
  height: number;
  time: number;
}) {
  const imageData = new ImageData(width, height);

  const getAlpha = createAlphaCalculator(time);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const latitude = -(((y + 0.5) / height) * 180 - 90);
      const longitude = ((x + 0.5) / width) * 360 - 180;

      const alpha = getAlpha(latitude, longitude);

      imageData.data[(y * width + x) * 4 + 3] = alpha * 255;
    }
  }

  return imageData;
}
