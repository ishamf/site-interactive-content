import dayImageSrc from './assets/day.jpg?url';
import nightImageSrc from './assets/night.jpg?url';
import { canvasWidth } from './constants';

export async function loadImageData() {
  const dayImageElement = new Image();
  dayImageElement.src = dayImageSrc;

  const nightImageElement = new Image();
  nightImageElement.src = nightImageSrc;

  await Promise.all(
    [dayImageElement, nightImageElement].map(
      (image) => new Promise((resolve) => image.addEventListener('load', resolve))
    )
  );

  const dayImage = dayImageElement;
  const nightImage = nightImageElement;

  const dayImageCanvas = new OffscreenCanvas(canvasWidth, canvasWidth);
  const nightImageCanvas = new OffscreenCanvas(canvasWidth, canvasWidth);

  function createImageData(image: HTMLImageElement, canvas: OffscreenCanvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    ctx.drawImage(image, 0, 0);

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  const dayImageData = createImageData(dayImageElement, dayImageCanvas);
  const nightImageData = createImageData(nightImageElement, nightImageCanvas);

  return { dayImage, nightImage, dayImageData, nightImageData };
}
