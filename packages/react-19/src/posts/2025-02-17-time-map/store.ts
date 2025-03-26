import { create } from 'zustand';

import { persist, combine } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';
import { LoadableSelectionData } from './assets';

interface Selection {
  itemId: string | null;
  rowId: string;
}

const INITIAL_CITY_IDS = [
  '5368361', // Los Angeles
  '5128581', // New York
  '2643743', // London
  '1275339', // Mumbai
  '1642911', // Jakarta
  '1850147', // Tokyo
];

export const useSelectionStore = create(
  persist(
    combine({ selectedItems: [] as Selection[] }, (set, get) => ({
      addInitialCitiesIfEmpty: (data: LoadableSelectionData) => {
        if (get().selectedItems.length > 0) {
          return;
        }

        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let localSelection = data.selectionData.find(
          (selection) => selection.type === 'timezone' && selection.timezone === localTimeZone
        );

        if (
          localSelection &&
          localSelection.type === 'timezone' &&
          localSelection.representativeCity
        ) {
          localSelection = localSelection.representativeCity;
        }

        const newIds = localSelection ? [localSelection.id] : [];

        newIds.push(...INITIAL_CITY_IDS.filter((id) => id !== localSelection?.id));

        set({
          selectedItems: newIds.map((itemId) => ({ itemId, rowId: nanoid() })),
        });
      },
      addNewSelection: (itemId: string) => {
        set((state) => ({
          selectedItems: [...state.selectedItems, { itemId, rowId: nanoid() }],
        }));
      },
      updateSelection: (rowId: string, itemId: string | null) => {
        set((state) => ({
          selectedItems: state.selectedItems.map((item) =>
            item.rowId === rowId ? { ...item, itemId } : item
          ),
        }));
      },
      removeSelection: (rowId: string) => {
        set((state) => ({
          selectedItems: state.selectedItems.filter((item) => item.rowId !== rowId),
        }));
      },
      reorderSelection: (fromId: string, toId: string) => {
        set((state) => {
          const fromIndex = state.selectedItems.findIndex((item) => item.rowId === fromId);
          const toIndex = state.selectedItems.findIndex((item) => item.rowId === toId);

          if (fromIndex === -1 || toIndex === -1) {
            return state;
          }

          return { selectedItems: arrayMove(state.selectedItems, fromIndex, toIndex) };
        });
      },
    })),
    {
      name: 'time-map-selection',
    }
  )
);
