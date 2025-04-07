import { LoadableSelectionData } from '../assets';

interface Selection {
  itemId: string | null;
  rowId: string;
}

export interface SelectionState {
  selectedItems: Selection[];

  addInitialCitiesIfEmpty: (data: LoadableSelectionData) => void;
  addNewSelection: (itemId: string) => void;
  updateSelection: (rowId: string, itemId: string | null) => void;
  removeSelection: (rowId: string) => void;
  reorderSelection: (fromId: string, toId: string) => void;
}

export type HiddenRowData =
  | { reason: 'intersect'; intersectingLabels: string[] }
  | { reason: 'duplicate' };

export type HiddenRowInput = {
  rowId: string;
  data: HiddenRowData;
};

export interface UIState {
  hiddenRows: Map<string, HiddenRowData>;
  rowWithOpenCitySelector: string | null;
  rowWithOpenTimeSelector: string | null;

  setHiddenRows: (hiddenRows: HiddenRowInput[]) => void;
  openCitySelector: (rowId: string) => void;
  closeCitySelector: () => void;
  openTimeSelector: (rowId: string) => void;
  closeTimeSelector: () => void;
}

export type PersistedState = Pick<SelectionState, 'selectedItems'>;
