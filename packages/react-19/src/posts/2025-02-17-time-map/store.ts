import { create } from 'zustand';

import { persist, combine } from 'zustand/middleware';
import { nanoid } from 'nanoid';

interface Selection {
  itemId: string | null;
  rowId: string;
}

export const useSelectionStore = create(
  persist(
    combine({ selectedItems: [] as Selection[] }, (set) => ({
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
    })),
    {
      name: 'time-map-selection',
    }
  )
);
