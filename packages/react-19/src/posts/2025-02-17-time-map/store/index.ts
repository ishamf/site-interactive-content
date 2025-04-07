import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AppState, PersistedState } from './types';
import { createSelectionSlice } from './selection';
import { createUISlice } from './ui';
import { createCityLayoutSlice } from './cityLayout';
import { onlyIfChanged } from '../../../utils/store';

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

// Effects

// Recalculate positions when selected items change
useTimeMapStore.subscribe(
  onlyIfChanged(
    (s) => [s.selectedItems],
    (state) => {
      state.queueRecalculatePositions();
    }
  )
);
