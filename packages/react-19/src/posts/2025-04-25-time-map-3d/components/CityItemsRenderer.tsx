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

  selectionDataById?: Record<string, SelectionData | undefined>;
  onRowFocus: (rowId: string) => void;
}) {
  const selectedItems = useTimeMapStore((state) => state.selectedItems);

  const registerDisplayItem = useTimeMapStore((state) => state.registerDisplayItem);
  const displayItemById = useTimeMapStore((state) => state.displayItemById);

  const citiesProjectedPositions = useCityProjectedPositions((s) => s.cities);

  const cityDisplayItemsWithoutPosition = useMemo(() => {
    return selectedItems.map((selectionItem) => {
      if (!selectionItem.itemId) {
        return null;
      }

      const item = selectionDataById?.[selectionItem.itemId];

      if (!item) {
        return null;
      }

      const city = item.type === 'city' ? item : item.representativeCity;

      if (!city) {
        return null;
      }

      const projectedPosition = citiesProjectedPositions[city.id];

      if (!projectedPosition) {
        return null;
      }

      const overridePosition: ComponentProps<typeof CityDisplay>['overridePosition'] = {
        xPercentage: projectedPosition.x,
        yPercentage: projectedPosition.y,
      };

      const displayProps: Pick<
        ComponentProps<typeof CityDisplay>,
        'city' | 'onLabelClick' | 'onLabelSizeChange' | 'overridePosition'
      > = {
        city,
        overridePosition,
        onLabelClick: (event) => {
          onRowFocus(selectionItem.rowId);
          event.stopPropagation();
        },
        onLabelSizeChange: (size) => {
          if (size && overridePosition && !projectedPosition.hidden) {
            registerDisplayItem(selectionItem.rowId, { overridePosition, city, size });
          } else {
            registerDisplayItem(selectionItem.rowId, null);
          }
        },
      };

      return { rowId: selectionItem.rowId, displayProps };
    });
  }, [citiesProjectedPositions, onRowFocus, registerDisplayItem, selectedItems, selectionDataById]);

  // This is separated from the above to prevent recreating onLabelSizeChange when displayItemById changes
  // which would cause an infinite loop
  const cityDisplayItems = useMemo(() => {
    const result = cityDisplayItemsWithoutPosition.map((item) => {
      if (!item) return null;

      //   console.log(item.displayProps.city.label, overridePosition);

      const displayItem = displayItemById[item.rowId];

      return {
        ...item,
        labelPosition: displayItem?.labelPosition,
        labelHidden: !displayItem?.labelPosition || !!displayItem?.hidden,
      };
    });

    // Render the items in reverse order to ensure that the first item is on top
    result.reverse();

    return result;
  }, [cityDisplayItemsWithoutPosition, displayItemById]);

  return (
    <>
      {cityDisplayItems.map((displayItem) => {
        if (!displayItem) return null;

        const { rowId, displayProps, labelHidden, labelPosition } = displayItem;

        return (
          <CityDisplay
            {...displayProps}
            labelPosition={labelPosition ?? null}
            labelHidden={labelHidden}
            key={rowId}
            time={time}
          ></CityDisplay>
        );
      })}
    </>
  );
}
