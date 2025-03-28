import { create } from 'zustand';

import { persist, combine } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';
import { LoadableSelectionData } from './assets';

interface Selection {
  itemId: string | null;
  rowId: string;
}

const INITIAL_CITY_DATA = [
  { id: '5368361', timezone: 'America/Los_Angeles' },
  { id: '5128581', timezone: 'America/New_York' },
  { id: '2643743', timezone: 'Europe/London' },
  { id: '1642911', timezone: 'Asia/Jakarta' },
  { id: '1850147', timezone: 'Asia/Tokyo' },
  { id: '1275339', timezone: 'Asia/Kolkata', links: ['Asia/Calcutta'] },
];

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const INITIAL_DISPLAY_LENGTH =
  // Local timezone
  (INITIAL_CITY_DATA.map((city) => city.timezone).includes(localTimeZone) ? 0 : 1) +
  // Initial cities
  INITIAL_CITY_DATA.length;

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

        newIds.push(
          ...INITIAL_CITY_DATA.filter((city) => city.id !== localSelection?.id).map(
            (city) => city.id
          )
        );

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

type HiddenRowData = { reason: 'intersect' | 'duplicate' };

export type HiddenRowInput = {
  rowId: string;
  data: HiddenRowData;
};

export const useHiddenRowsStore = create(
  combine({ hiddenRows: new Map<string, HiddenRowData>() }, (set) => ({
    setHiddenRows: (hiddenRows: HiddenRowInput[]) => {
      set({ hiddenRows: new Map(hiddenRows.map(({ rowId, data }) => [rowId, data])) });
    },
  }))
);
