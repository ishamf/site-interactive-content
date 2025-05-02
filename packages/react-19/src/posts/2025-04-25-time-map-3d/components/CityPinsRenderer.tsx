import { useEffect, useMemo } from 'react';
import { useTimeMapStore } from '../../2025-02-17-time-map/store';
import { SelectionData } from '../../2025-02-17-time-map/assets';
import { AppSelection } from '../../2025-02-17-time-map/store/types';
import { CityPin } from './CityPin';
import { useThree } from '@react-three/fiber';

export function CityPinsRenderer({
  selectionDataById,
}: {
  selectionDataById: Record<string, SelectionData | undefined>;
}) {
  const selectedItems = useTimeMapStore((state) => state.selectedItems);

  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate, selectedItems]);

  const citySelectedItems = useMemo(() => {
    const seenItemIds = new Set<string>();
    const uniqueSelectedItems = selectedItems.filter(
      (item): item is AppSelection & { itemId: string } => {
        if (!item.itemId) {
          return false;
        }

        if (seenItemIds.has(item.itemId)) {
          return false;
        }
        seenItemIds.add(item.itemId);
        return true;
      }
    );

    const cityItems = uniqueSelectedItems
      .map((row) => {
        const item = selectionDataById[row.itemId];
        if (!item) {
          return null;
        }
        const city = item.type === 'city' ? item : item.representativeCity;
        if (!city) {
          return null;
        }
        return { rowId: row.rowId, city };
      })
      .filter((x) => x !== null);

    return cityItems;
  }, [selectedItems, selectionDataById]);

  return citySelectedItems.map((item) => <CityPin key={item.rowId} city={item.city}></CityPin>);
}
