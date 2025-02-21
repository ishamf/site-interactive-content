export type { MapImageData } from './images';

export async function loadImageData() {
  const { loadImageData: load } = await import('./images');

  return load();
}
