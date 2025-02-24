import { renderAlphaMapAtTime } from './render';
import { WorkerMessage, WorkerResponse } from './types';

const canvas = new OffscreenCanvas(256, 256);
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Could not get 2d context');

self.addEventListener('message', async (event) => {
  const data: WorkerMessage = event.data;

  if (data.type === 'renderAlpha') {
    const imageData = renderAlphaMapAtTime({
      width: data.width,
      height: data.height,
      time: data.time,
    });

    const response: WorkerResponse = { id: data.id, imageData };

    self.postMessage(response);
  }
});
