import { canvasHeight } from '../../constants';
import { WorkerMessage, WorkerResponse } from './types';
import ImageWorker from './worker?worker';

const imageParts = 4;

const workers = new Array(imageParts).fill(null).map(() => new ImageWorker());

let taskIdCounter = 0;

async function renderPartialMapAtTimeWithWorker({
  worker,
  time,
  alphaSize = 1,
  partIndex,
  parts,
}: {
  worker: Worker;
  time: number;
  alphaSize: number;
  partIndex: number;
  parts: number;
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
    type: 'render',
    id: taskId,
    renderArgs: { time, alphaSize, partIndex, parts },
  };

  worker.postMessage(message);

  return promise;
}

export async function drawMapAtTimeWithWorker({
  ctx,
  time,
  alphaSize = 1,
}: {
  ctx: CanvasRenderingContext2D;
  time: number;
  alphaSize: number;
}) {
  const imageDataArray = await Promise.all(
    workers.map((worker, index) =>
      renderPartialMapAtTimeWithWorker({
        worker,
        time,
        alphaSize,
        partIndex: index,
        parts: imageParts,
      })
    )
  );

  for (let i = 0; i < imageParts; i++) {
    const partHeight = canvasHeight / imageParts;
    ctx.putImageData(imageDataArray[i], 0, partHeight * i);
  }
}
