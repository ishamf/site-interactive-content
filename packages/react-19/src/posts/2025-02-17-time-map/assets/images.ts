import dayImageUrl from './data/day.jpg?no-inline';
import nightImageUrl from './data/night.jpg?no-inline';
import smallDayImageUrl from './data/daysmall.jpg?no-inline';
import smallNightImageUrl from './data/nightsmall.jpg?no-inline';

async function loadImage(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

export async function loadImageData() {
  const [dayImageBitmap, nightImageBitmap] = await Promise.all(
    [dayImageUrl, nightImageUrl].map(loadImage)
  );

  return { dayImageBitmap, nightImageBitmap };
}

export type MapImageData = Awaited<ReturnType<typeof loadImageData>>;

export async function loadSmallImageData(): Promise<MapImageData> {
  const [dayImageBitmap, nightImageBitmap] = await Promise.all(
    [smallDayImageUrl, smallNightImageUrl].map(loadImage)
  );

  return { dayImageBitmap, nightImageBitmap };
}
