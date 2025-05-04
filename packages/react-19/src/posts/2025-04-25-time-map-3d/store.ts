import { create } from 'zustand';
import { combine } from 'zustand/middleware';

interface CityProjectedPosition {
  x: number;
  y: number;

  hidden: boolean;
}

export const useCityProjectedPositions = create(
  combine(
    {
      cities: {} as Record<string, CityProjectedPosition | undefined>,
    },
    (set) => ({
      updateCityPosition: (cityId: string, position: CityProjectedPosition) => {
        set((state) => {
          const current = state.cities[cityId];
          if (
            current &&
            current.x === position.x &&
            current.y === position.y &&
            current.hidden === position.hidden
          ) {
            return state;
          }

          return {
            cities: {
              ...state.cities,
              [cityId]: position,
            },
          };
        });
      },
      removeCityPosition: (cityId: string) => {
        set((state) => {
          const newCities = { ...state.cities };
          delete newCities[cityId];
          return {
            cities: newCities,
          };
        });
      },
    })
  )
);
