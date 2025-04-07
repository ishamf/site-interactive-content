import { StateCreator } from 'zustand';
import { UIState, Mutators, AppState } from './types';

export const createUISlice: StateCreator<AppState, Mutators, [], UIState> = (set) => ({
  rowWithOpenCitySelector: null,
  rowWithOpenTimeSelector: null,
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
