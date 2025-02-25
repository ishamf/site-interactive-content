import dayImageSrc from './data/day.jpg?url';
import nightImageSrc from './data/night.jpg?url';

async function loadImage(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

export async function loadImageData() {
  const [dayImageBitmap, nightImageBitmap] = await Promise.all(
    [dayImageSrc, nightImageSrc].map(loadImage)
  );

  return { dayImageBitmap, nightImageBitmap };
}

export type MapImageData = Awaited<ReturnType<typeof loadImageData>>;
