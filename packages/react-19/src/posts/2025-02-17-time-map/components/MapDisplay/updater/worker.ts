import { renderAlphaMap } from './renderAlphaMap';
import { WorkerMessage, WorkerResponse } from './types';

const canvas = new OffscreenCanvas(256, 256);
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Could not get 2d context');

self.addEventListener('message', (event) => {
  const data = event.data as WorkerMessage;

  if (data.type === 'renderAlpha') {
    const imageData = renderAlphaMap({
      width: data.width,
      height: data.height,
      state: data.state,
    });

    const response: WorkerResponse = { id: data.id, imageData };

    self.postMessage(response);
  }
});
