import { loadWorker } from '../../../../../utils/worker';
import { MapImageData } from '../../../assets';
import { canvasHeight, canvasWidth } from '../../../constants';
import { SunAndEarthState } from '../../../types';
import { renderAlphaMap } from './renderAlphaMap';
import { WorkerMessage, WorkerResponse } from './types';

const imageWorker = loadWorker('2025-time-map');

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

export async function drawMap({
  ctx,
  state,
  alphaSize = 1,
  useWorker,
  abortSignal,
  mapImageData,
}: {
  ctx: CanvasRenderingContext2D;
  state: SunAndEarthState;
  alphaSize: number;
  useWorker: boolean;
  abortSignal?: AbortSignal;
  mapImageData: MapImageData;
}) {
  // const start = performance.now();

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
  ctx.drawImage(mapImageData.dayImageBitmap, 0, 0, canvasWidth, canvasHeight);

  ctx.globalCompositeOperation = 'destination-over';
  ctx.drawImage(mapImageData.nightImageBitmap, 0, 0, canvasWidth, canvasHeight);

  // const end = performance.now();

  // console.log('Rendered map with alphaSize', alphaSize, 'in', end - start);
}
