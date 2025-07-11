import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';
import { z } from 'zod';

const multiTimerSchema = z.object({
  id: z.string(),
  title: z.string().default('New Timer'),
});

const persistedStateSchema = z.object({
  multiTimers: z.array(multiTimerSchema),
});

type PersistedState = z.infer<typeof persistedStateSchema>;

export type MultiTimer = z.infer<typeof multiTimerSchema>;

export const useTimerStore = create(
  persist(
    combine(
      {
        multiTimers: [] as MultiTimer[],
        isStorageLoaded: false,
      },
      (set) => ({
        createMultiTimer: () => {
          const id = nanoid();

          set((state) => ({
            multiTimers: [...state.multiTimers, multiTimerSchema.parse({ id })],
          }));

          return { id };
        },

        updateTitle: (id: string, title: string) => {
          set((state) => ({
            multiTimers: state.multiTimers.map((timer) =>
              timer.id === id ? { ...timer, title } : timer
            ),
          }));
        },

        deleteMultiTimer: (id: string) => {
          set((state) => ({
            multiTimers: state.multiTimers.filter((timer) => timer.id !== id),
          }));
        },
      })
    ),
    {
      name: 'multi-timer-store',
      partialize: (state): PersistedState => ({
        multiTimers: state.multiTimers,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedStateSchema.parse(persistedState),
        isStorageLoaded: true,
      }),
    }
  )
);
