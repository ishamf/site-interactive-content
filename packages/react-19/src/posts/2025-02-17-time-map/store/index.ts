import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AppState, PersistedState } from './types';
import { createSelectionSlice } from './selection';
import { createUISlice } from './ui';
import { createCityLayoutSlice } from './cityLayout';

export type { LabelPosition } from './types';
export { INITIAL_DISPLAY_LENGTH } from './selection';

export const useTimeMapStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createSelectionSlice(...a),
      ...createUISlice(...a),
      ...createCityLayoutSlice(...a),
    }),
    {
      name: 'time-map-selection',
      partialize: (state): PersistedState => ({
        selectedItems: state.selectedItems,
      }),
    }
  )
);
