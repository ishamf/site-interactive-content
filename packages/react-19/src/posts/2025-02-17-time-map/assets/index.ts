export type { MapImageData } from './images';

export async function loadImageData() {
  const { loadImageData: load } = await import('./images');

  return load();
}

export async function loadSelectionData() {
  const { selectionData } = await import('./selectionData');

  return selectionData;
}
