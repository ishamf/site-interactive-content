import { create } from 'zustand';

import { persist, combine } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';

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
