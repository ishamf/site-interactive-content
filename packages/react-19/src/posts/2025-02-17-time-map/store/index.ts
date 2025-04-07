import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { PersistedState, SelectionState, UIState } from './types';
import { createSelectionSlice } from './selection';
import { createUISlice } from './ui';

export type { HiddenRowInput } from './types';
export { INITIAL_DISPLAY_LENGTH } from './selection';

export const useTimeMapStore = create<SelectionState & UIState>()(
  persist(
    (...a) => ({
      ...createSelectionSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'time-map-selection',
      partialize: (state): PersistedState => ({
        selectedItems: state.selectedItems,
      }),
    }
  )
);
