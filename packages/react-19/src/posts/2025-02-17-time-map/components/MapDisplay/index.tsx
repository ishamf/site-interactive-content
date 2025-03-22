import { useRef } from 'react';
import { canvasWidth, canvasHeight } from '../../constants';
import { useMapUpdater } from './updater';
import { useSelectionStore } from '../../store';
import { CityDisplay } from './CityDisplay';
import { selectionDataById } from '../../assets/selectionData';

export function MapDisplay({ time }: { time: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedItems = useSelectionStore((state) => state.selectedItems);

  const { hasRenderedOnce } = useMapUpdater(canvasRef, time);

  return (
    <div className="max-w-full relative">
      <canvas className="max-w-full" ref={canvasRef} width={canvasWidth} height={canvasHeight} />
      {hasRenderedOnce
        ? selectedItems.map((selectionItem) => {
            if (!selectionItem.itemId) {
              return null;
            }

            const item = selectionDataById[selectionItem.itemId];

            const city = item.type === 'city' ? item : item.representativeCity;

            if (!city) {
              return null;
            }

            return <CityDisplay key={selectionItem.rowId} city={city} time={time}></CityDisplay>;
          })
        : null}
    </div>
  );
}
