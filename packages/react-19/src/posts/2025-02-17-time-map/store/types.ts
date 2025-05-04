import { CitySelectionData, LoadableSelectionData } from '../assets';

// Selection types
export interface AppSelection {
  itemId: string | null;
  rowId: string;
}

export interface SelectionState {
  selectedItems: AppSelection[];

  addInitialCitiesIfEmpty: (data: LoadableSelectionData) => void;
  addNewSelection: (itemId: string) => void;
  updateSelection: (rowId: string, itemId: string | null) => void;
  removeSelection: (rowId: string) => void;
  reorderSelection: (fromId: string, toId: string) => void;
}

// UI state types

export interface UIState {
  rowWithOpenCitySelector: string | null;
  rowWithOpenTimeSelector: string | null;

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

export type HiddenData =
  | { reason: 'intersect'; intersectingLabel?: string }
  | { reason: 'duplicate' };

export type CityDisplayItem = {
  rowId: string;
  city: CitySelectionData;
  overridePosition?: { xPercentage: number; yPercentage: number };
  labelPosition: LabelPosition | null;
  intersections: string[];
  potentialSpaceIntersections: string[];
  hidden?: HiddenData;
  size: BoxSize;
};

export interface CityDisplayState {
  containerSize: BoxSize | null;
  displayItemById: Record<string, CityDisplayItem | undefined>;
  obstructions: BoxRect[];
  setObstructions: (obstructions: BoxRect[]) => void;
  registerContainerSize(size: BoxSize): void;
  registerDisplayItem(
    rowId: string,
    item: Pick<CityDisplayItem, 'size' | 'city' | 'overridePosition'> | null
  ): void;
  queueRecalculatePositions(): void;
  recalculatePositions(): void;
  recalculationDelay: number;
  setRecalculationDelay: (delay: number) => void;
}

export type Mutators = [['zustand/persist', unknown]];
export type AppState = SelectionState & UIState & CityDisplayState;
