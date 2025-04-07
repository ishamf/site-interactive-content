import { StateCreator } from 'zustand';
import { UIState, HiddenRowData, HiddenRowInput, Mutators, AppState } from './types';

export const createUISlice: StateCreator<AppState, Mutators, [], UIState> = (set) => ({
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
