export type { MapImageData } from './images';
export type { SelectionData, CitySelectionData } from './selectionData';

export async function loadImageData() {
  const { loadImageData: load } = await import('./images');

  return load();
}

export async function loadSelectionData() {
  const { selectionData, selectionDataById } = await import('./selectionData');

  return { selectionData, selectionDataById };
}

export type LoadableSelectionData = Awaited<ReturnType<typeof loadSelectionData>>;
