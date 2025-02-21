import { loadImageData, MapImageData } from '../../assets';
import { WorkerMessage, WorkerResponse } from './types';

const canvas = new OffscreenCanvas(256, 256);
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Could not get 2d context');

self.addEventListener('message', async (event) => {
  const data: WorkerMessage = event.data;

  if (data.type === 'render') {
    const { renderMapAtTime } = await import('./render');

    const mapImageData = await getMapImageData();

    const imageData = renderMapAtTime({ ...data.renderArgs, ctx, mapImageData });

    const response: WorkerResponse = { id: data.id, imageData };

    self.postMessage(response);
  }
});

let mapImageDataPromise: Promise<MapImageData> | null = null;

async function getMapImageData() {
  if (mapImageDataPromise) return mapImageDataPromise;

  mapImageDataPromise = loadImageData();

  return mapImageDataPromise;
}
