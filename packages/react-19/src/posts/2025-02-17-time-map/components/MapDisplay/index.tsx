import { useRef } from 'react';
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
  selectionDataById,
  setTime,
}: {
  time: number;
  selectionDataById: Record<string, SelectionData | undefined>;
  setTime: (time: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedItems = useSelectionStore((state) => state.selectedItems);

  const { hasRenderedOnce } = useMapUpdater(canvasRef, time);

  const store = useCityDisplayStore();

  useElementSize({
    ref: canvasRef,
    onSizeChange: (size) => {
      if (size) {
        store.registerContainerSize(size);
      }
    },
  });

  const { isGrabbing, listeners } = useGrabTime({ container: canvasRef.current, time, setTime });

  return (
    <div className="max-w-full relative">
      <canvas
        {...listeners}
        className={classNames('max-w-full select-none touch-pan-y', {
          'cursor-grabbing': isGrabbing,
          'cursor-grab': !isGrabbing,
        })}
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
      />
      {hasRenderedOnce
        ? selectedItems.map((selectionItem) => {
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

            return (
              <CityDisplay
                key={selectionItem.rowId}
                city={city}
                time={time}
                labelPosition={store.displayItemById[selectionItem.rowId]?.labelPosition ?? null}
                onLabelSizeChange={(size) => {
                  if (size) {
                    store.registerDisplayItem(selectionItem.rowId, { city, size });
                  } else {
                    store.registerDisplayItem(selectionItem.rowId, null);
                  }
                }}
              ></CityDisplay>
            );
          })
        : null}
    </div>
  );
}
