import { loadImageData, MapImageData } from '../../assets';
import { canvasHeight, canvasWidth } from '../../constants';
import { renderAlphaMapAtTime } from './render';
import { WorkerMessage, WorkerResponse } from './types';
import ImageWorker from './worker?worker';

const imageWorker = new ImageWorker();

let taskIdCounter = 0;

async function renderAlphaMapWithWorker({
  worker,
  time,
  width,
  height,
}: {
  worker: Worker;
  time: number;
  width: number;
  height: number;
}) {
  const taskId = taskIdCounter++;

  const { promise, resolve } = Promise.withResolvers<ImageData>();

  function listener(event: MessageEvent) {
    const { id, imageData }: WorkerResponse = event.data;

    if (id !== taskId) return;

    worker.removeEventListener('message', listener);

    resolve(imageData);
  }

  worker.addEventListener('message', listener);

  const message: WorkerMessage = {
    type: 'renderAlpha',
    id: taskId,
    time,
    width,
    height,
  };

  worker.postMessage(message);

  return promise;
}

let mapImageDataPromise: Promise<MapImageData> | null = null;

async function getMapImageData() {
  if (mapImageDataPromise) return mapImageDataPromise;

  mapImageDataPromise = loadImageData();

  return mapImageDataPromise;
}

export async function drawMapAtTime({
  ctx,
  time,
  alphaSize = 1,
  useWorker,
}: {
  ctx: CanvasRenderingContext2D;
  time: number;
  alphaSize: number;
  useWorker: boolean;
}) {
  const mapImageData = await getMapImageData();

  const alphaMapWidth = canvasWidth / alphaSize;
  const alphaMapHeight = canvasHeight / alphaSize;

  const alphaMapData = useWorker
    ? await renderAlphaMapWithWorker({
        worker: imageWorker,
        time,
        width: alphaMapWidth,
        height: alphaMapHeight,
      })
    : renderAlphaMapAtTime({
        time,
        width: alphaMapWidth,
        height: alphaMapHeight,
      });

  const alphaBitmap = await createImageBitmap(alphaMapData);

  ctx.reset();

  ctx.scale(alphaSize, alphaSize);
  ctx.drawImage(alphaBitmap, 0, 0);

  ctx.resetTransform();

  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(mapImageData.dayImageBitmap, 0, 0);

  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(mapImageData.nightImageBitmap, 0, 0);
}
