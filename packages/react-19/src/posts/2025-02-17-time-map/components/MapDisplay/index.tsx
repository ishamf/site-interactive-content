/** @jsxImportSource @emotion/react */
import { ComponentProps, useEffect, useMemo, useRef } from 'react';
import { css } from '@emotion/react';
import { CircularProgress } from '@mui/material';
import { canvasWidth, canvasHeight } from '../../constants';
import { useMapUpdater } from './updater';
import { useTimeMapStore } from '../../store';
import { CityDisplay } from './CityDisplay';
import { useElementSize } from '../../../../utils/hooks';
import { SelectionData } from '../../assets';
import { useGrabTime } from '../../utils';
import classNames from 'classnames';
import { RenderBehavior } from '../../types';

export function MapDisplay({
  time,
  selectionDataById,
  setTime,
  onRowFocus,
  onTimeDragEnd,
  renderBehavior,
  isTrackingCurrentTime,
  trackCurrentTime,
}: {
  time: number;
  selectionDataById: Record<string, SelectionData | undefined>;
  setTime: (time: number) => void;
  onRowFocus: (rowId: string) => void;
  onTimeDragEnd?: () => void;
  renderBehavior: RenderBehavior;
  isTrackingCurrentTime: boolean;
  trackCurrentTime: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const liveLabelRef = useRef<HTMLDivElement>(null);

  const selectedItems = useTimeMapStore((state) => state.selectedItems);

  const registerContainerSize = useTimeMapStore((state) => state.registerContainerSize);
  const registerDisplayItem = useTimeMapStore((state) => state.registerDisplayItem);
  const displayItemById = useTimeMapStore((state) => state.displayItemById);

  const setObstructions = useTimeMapStore((state) => state.setObstructions);

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

  // This is separated from the above to prevent recreating onLabelSizeChange when displayItemById changes
  // which would cause an infinite loop
  const cityDisplayItems = useMemo(() => {
    const result = cityDisplayItemsWithoutPosition.map((item) => {
      if (!item) return null;

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

  const { hasRenderedOnce, isLoadingImages } = useMapUpdater(canvasRef, time, renderBehavior);

  const containerSize = useElementSize({
    ref: canvasRef,
  });

  const liveLabelSize = useElementSize({
    ref: liveLabelRef,
  });

  useEffect(() => {
    if (containerSize) {
      registerContainerSize(containerSize);
    }
    if (liveLabelRef.current && liveLabelSize) {
      const liveLabel = liveLabelRef.current;
      setObstructions([
        {
          top: liveLabel.offsetTop,
          left: liveLabel.offsetLeft,
          width: liveLabelSize.width,
          height: liveLabelSize.height,
        },
      ]);
    }
  }, [containerSize, liveLabelSize, registerContainerSize, setObstructions]);

  const { isGrabbing, listeners } = useGrabTime({
    container: canvasRef.current,
    time,
    setTime,
    onDragEnd: onTimeDragEnd,
    isTrackingCurrentTime,
    trackCurrentTime,
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

      <div
        ref={liveLabelRef}
        className={classNames(
          'absolute top-1 right-1 text-red-500 text-xs font-bold contain-content',
          {
            invisible: !isTrackingCurrentTime,
          }
        )}
        css={css`
          z-index: 10;

          &::before {
            content: '';
            position: absolute;
            z-index: -1;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #000;
            opacity: 0.6;
            filter: blur(3px);
            padding: 0.05rem 0.2rem;
            margin: -0.05rem -0.2rem;
          }
        `}
      >
        <span>LIVE</span>
      </div>

      {hasRenderedOnce
        ? cityDisplayItems.map((displayItem) => {
            if (!displayItem) return null;

            const { rowId, displayProps, labelPosition, labelHidden } = displayItem;

            return (
              <CityDisplay
                {...displayProps}
                labelPosition={labelPosition ?? null}
                labelHidden={labelHidden}
                disabled={isGrabbing || labelHidden}
                key={rowId}
                time={time}
              ></CityDisplay>
            );
          })
        : null}
    </div>
  );
}
