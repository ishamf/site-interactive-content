import { StateCreator } from 'zustand';
import { SelectionState, UIState, HiddenRowData, HiddenRowInput } from './types';

export const createUISlice: StateCreator<
  SelectionState & UIState,
  [['zustand/persist', unknown]],
  [],
  UIState
> = (set) => ({
  hiddenRows: new Map<string, HiddenRowData>(),
  rowWithOpenCitySelector: null,
  rowWithOpenTimeSelector: null,
  setHiddenRows: (hiddenRows: HiddenRowInput[]) => {
    set({ hiddenRows: new Map(hiddenRows.map(({ rowId, data }) => [rowId, data])) });
  },
  openCitySelector: (rowId: string) => {
    set({ rowWithOpenCitySelector: rowId });
  },
  closeCitySelector: () => {
    set({ rowWithOpenCitySelector: null });
  },
  openTimeSelector: (rowId: string) => {
    set({ rowWithOpenTimeSelector: rowId });
  },
  closeTimeSelector: () => {
    set({ rowWithOpenTimeSelector: null });
  },
});
