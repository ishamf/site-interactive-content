import { CitySelectionData, LoadableSelectionData } from '../assets';

// Selection types
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

// UI state types

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

// City layout types

export const labelPositions = [
  'topleft',
  'topright',
  'bottomleft',
  'bottomright',
  'left',
  'top',
  'right',
  'bottom',
] as const;
export type LabelPosition = (typeof labelPositions)[number];

export type BoxSize = { width: number; height: number };

export const boxRectKeys = [...labelPositions, 'potential'] as const;
export type BoxRectKey = (typeof boxRectKeys)[number];

export type BoxRect = BoxSize & { left: number; top: number };

export type CityDisplayItem = {
  rowId: string;
  city: CitySelectionData;
  labelPosition: LabelPosition | null;
  intersections: string[];
  size: BoxSize;
};

export interface CityDisplayState {
  containerSize: BoxSize | null;
  validRowIds: Set<string>;
  displayItemById: Record<string, CityDisplayItem | undefined>;
  obstructions: BoxRect[];
  setObstructions: (obstructions: BoxRect[]) => void;
  setValidRowIds: (rowIds: string[]) => void;
  registerContainerSize(size: BoxSize): void;
  registerDisplayItem(rowId: string, item: { size: BoxSize; city: CitySelectionData } | null): void;
  queueRecalculatePositions(): void;
  recalculatePositions(): void;
}

export type Mutators = [['zustand/persist', unknown]];
export type AppState = SelectionState & UIState & CityDisplayState;
