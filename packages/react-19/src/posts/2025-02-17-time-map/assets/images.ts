import dayImageSrc from './data/day.jpg?url';
import nightImageSrc from './data/night.jpg?url';
import { loadImage } from './utils';

export async function loadImageData() {
  const [dayImageBitmap, nightImageBitmap] = await Promise.all(
    [dayImageSrc, nightImageSrc].map(loadImage)
  );

  return { dayImageBitmap, nightImageBitmap };
}

export type MapImageData = Awaited<ReturnType<typeof loadImageData>>;
