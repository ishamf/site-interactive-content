import { useTimeMapStore } from '../../2025-02-17-time-map/store';
import { ComponentProps, useMemo } from 'react';
import { SelectionData } from '../../2025-02-17-time-map/assets';
import { CityDisplay } from '../../2025-02-17-time-map/components/MapDisplay/CityDisplay';
import { useCityProjectedPositions } from '../store';

export function CityItemsRenderer({
  time,

  selectionDataById,
  onRowFocus,
}: {
  time: number;

  selectionDataById: Record<string, SelectionData | undefined>;
  onRowFocus: (rowId: string) => void;
}) {
  const selectedItems = useTimeMapStore((state) => state.selectedItems);

  const registerDisplayItem = useTimeMapStore((state) => state.registerDisplayItem);

  const citiesProjectedPositions = useCityProjectedPositions((s) => s.cities);

  const cityDisplayItemsWithoutPosition = useMemo(() => {
    return selectedItems.map((selectionItem) => {
      if (!selectionItem.itemId) {
        return null;
      }

      const item = selectionDataById[selectionItem.itemId];

      if (!item) {
        return null;
      }

      const city = item.type === 'city' ? item : item.representativeCity;

      if (!city) {
        return null;
      }

      const displayProps: Pick<
        ComponentProps<typeof CityDisplay>,
        'city' | 'onLabelClick' | 'onLabelSizeChange'
      > = {
        city,
        onLabelClick: (event) => {
          onRowFocus(selectionItem.rowId);
          event.stopPropagation();
        },
        onLabelSizeChange: (size) => {
          if (size) {
            registerDisplayItem(selectionItem.rowId, { city, size });
          } else {
            registerDisplayItem(selectionItem.rowId, null);
          }
        },
      };

      return { rowId: selectionItem.rowId, displayProps };
    });
  }, [onRowFocus, registerDisplayItem, selectedItems, selectionDataById]);

  // This is separated from the above to prevent recreating onLabelSizeChange when citiesProjectedPositions changes
  // which may cause an infinite loop
  const cityDisplayItems = useMemo(() => {
    const result = cityDisplayItemsWithoutPosition.map((item) => {
      if (!item) return null;

      const projectedPosition = citiesProjectedPositions[item.displayProps.city.id];

      if (!projectedPosition || projectedPosition.hidden) {
        return null;
      }

      const overridePosition: ComponentProps<typeof CityDisplay>['overridePosition'] = {
        xPercentage: projectedPosition.x,
        yPercentage: projectedPosition.y,
      };

      //   console.log(item.displayProps.city.label, overridePosition);

      return {
        ...item,
        overridePosition,
      };
    });

    // Render the items in reverse order to ensure that the first item is on top
    result.reverse();

    return result;
  }, [citiesProjectedPositions, cityDisplayItemsWithoutPosition]);

  return (
    <>
      {cityDisplayItems.map((displayItem) => {
        if (!displayItem) return null;

        const { rowId, displayProps, overridePosition } = displayItem;

        return (
          <CityDisplay
            {...displayProps}
            labelPosition={'bottomright'}
            overridePosition={overridePosition}
            key={rowId}
            time={time}
          ></CityDisplay>
        );
      })}
    </>
  );
}
