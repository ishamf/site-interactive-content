import dayImageSrc from './data/day.jpg?url';
import nightImageSrc from './data/night.jpg?url';
import { canvasWidth } from '../constants';

async function loadImage(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

export async function loadImageData() {
  const [dayImage, nightImage] = await Promise.all([dayImageSrc, nightImageSrc].map(loadImage));

  const dayImageCanvas = new OffscreenCanvas(canvasWidth, canvasWidth);
  const nightImageCanvas = new OffscreenCanvas(canvasWidth, canvasWidth);

  function createImageData(image: ImageBitmap, canvas: OffscreenCanvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    ctx.drawImage(image, 0, 0);

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  const dayImageData = createImageData(dayImage, dayImageCanvas);
  const nightImageData = createImageData(nightImage, nightImageCanvas);

  const [dayImageBitmap, nightImageBitmap] = await Promise.all(
    [dayImageData, nightImageData].map((data) => createImageBitmap(data))
  );

  return { dayImageData, nightImageData, dayImageBitmap, nightImageBitmap };
}

export type MapImageData = Awaited<ReturnType<typeof loadImageData>>;
