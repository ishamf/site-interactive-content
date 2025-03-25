import { loadImageData, MapImageData } from '../../../assets';
import { canvasHeight, canvasWidth } from '../../../constants';
import { SunAndEarthState } from '../../../types';
import { renderAlphaMap } from './renderAlphaMap';
import { WorkerMessage, WorkerResponse } from './types';

const imageWorker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

let taskIdCounter = 0;

async function renderAlphaMapWithWorker({
  worker,
  state,
  width,
  height,
}: {
  worker: Worker;
  state: SunAndEarthState;
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
    state,
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

export async function drawMap({
  ctx,
  state,
  alphaSize = 1,
  useWorker,
  abortSignal,
}: {
  ctx: CanvasRenderingContext2D;
  state: SunAndEarthState;
  alphaSize: number;
  useWorker: boolean;
  abortSignal?: AbortSignal;
}) {
  const mapImageData = await getMapImageData();

  // const start  = performance.now();

  const alphaMapWidth = canvasWidth / alphaSize;
  const alphaMapHeight = canvasHeight / alphaSize;

  const alphaMapData = useWorker
    ? await renderAlphaMapWithWorker({
        worker: imageWorker,
        state,
        width: alphaMapWidth,
        height: alphaMapHeight,
      })
    : renderAlphaMap({
        state,
        width: alphaMapWidth,
        height: alphaMapHeight,
      });

  const alphaBitmap = await createImageBitmap(alphaMapData);

  if (abortSignal?.aborted) {
    return;
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.drawImage(alphaBitmap, 0, 0, canvasWidth, canvasHeight);

  ctx.globalCompositeOperation = 'source-in';
  ctx.drawImage(mapImageData.dayImageBitmap, 0, 0);

  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(mapImageData.nightImageBitmap, 0, 0);

  // const end = performance.now();

  // console.log('Rendered map with alphaSize', alphaSize, 'in', end - start);
}
