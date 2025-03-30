export type { MapImageData } from './images';
export type { SelectionData, CitySelectionData } from './selectionData';

export { loadImageData, loadSmallImageData } from './images';

export async function loadSelectionData() {
  const { selectionData, selectionDataById } = await import('./selectionData');

  return { selectionData, selectionDataById };
}

export type LoadableSelectionData = Awaited<ReturnType<typeof loadSelectionData>>;
