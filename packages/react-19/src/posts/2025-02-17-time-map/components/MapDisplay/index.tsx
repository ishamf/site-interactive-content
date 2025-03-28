import { ComponentProps, useEffect, useMemo, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import { canvasWidth, canvasHeight } from '../../constants';
import { useMapUpdater } from './updater';
import { useSelectionStore } from '../../store';
import { CityDisplay } from './CityDisplay';
import { useCityDisplayStore } from './cityLayout';
import { useElementSize } from '../../../../utils/hooks';
import { SelectionData } from '../../assets';
import { useGrabTime } from '../../utils';
import classNames from 'classnames';

export function MapDisplay({
  time,
  animateTime = true,
  selectionDataById,
  setTime,
  onRowFocus,
  onTimeDragEnd,
}: {
  time: number;
  animateTime: boolean;
  selectionDataById: Record<string, SelectionData | undefined>;
  setTime: (time: number) => void;
  onRowFocus: (rowId: string) => void;
  onTimeDragEnd?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedItems = useSelectionStore((state) => state.selectedItems);

  const { registerContainerSize, registerDisplayItem, displayItemById } = useCityDisplayStore();

  const cityDisplayItems = useMemo(() => {
    const seenItems = new Set<string>();

    const uniqueSelectedItems = selectedItems.filter((item) => {
      if (!item.itemId) {
        return false;
      }

      if (seenItems.has(item.itemId)) {
        return false;
      }

      seenItems.add(item.itemId);

      return true;
    });

    return uniqueSelectedItems.map((selectionItem) => {
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
        onLabelClick: () => {
          onRowFocus(selectionItem.rowId);
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

  const { hasRenderedOnce, isLoadingImages } = useMapUpdater(canvasRef, time, animateTime);

  const containerSize = useElementSize({
    ref: canvasRef,
  });

  useEffect(() => {
    if (containerSize) {
      registerContainerSize(containerSize);
    }
  }, [containerSize, registerContainerSize]);

  const { isGrabbing, listeners } = useGrabTime({
    container: canvasRef.current,
    time,
    setTime,
    onDragEnd: onTimeDragEnd,
  });

  return (
    <div className="max-w-full relative">
      <canvas
        {...listeners}
        className={classNames('max-w-full select-none touch-pan-y touch-pinch-zoom', {
          'cursor-grabbing': isGrabbing,
          'cursor-grab': !isGrabbing,
        })}
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
      {isLoadingImages ? (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-neutral-900 flex items-center justify-center">
          <CircularProgress></CircularProgress>
        </div>
      ) : null}
      {hasRenderedOnce
        ? cityDisplayItems.map((displayItem) => {
            if (!displayItem) return null;

            const { rowId, displayProps } = displayItem;

            return (
              <CityDisplay
                {...displayProps}
                key={rowId}
                time={time}
                labelPosition={displayItemById[rowId]?.labelPosition ?? null}
              ></CityDisplay>
            );
          })
        : null}
    </div>
  );
}
