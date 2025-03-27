import dayImageSrc from './data/daysmall.jpg?url';
import nightImageSrc from './data/nightsmall.jpg?url';
import { loadImage } from './utils';

export async function loadImageData() {
  const [dayImageBitmap, nightImageBitmap] = await Promise.all(
    [dayImageSrc, nightImageSrc].map(loadImage)
  );

  return { dayImageBitmap, nightImageBitmap };
}

export type MapImageData = Awaited<ReturnType<typeof loadImageData>>;
