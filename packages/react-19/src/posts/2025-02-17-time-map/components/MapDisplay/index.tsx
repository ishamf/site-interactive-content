/** @jsxImportSource @emotion/react */
import { ComponentProps, useEffect, useMemo, useRef } from 'react';
import { css } from '@emotion/react';
import { CircularProgress } from '@mui/material';
import { canvasWidth, canvasHeight } from '../../constants';
import { useMapUpdater } from './updater';
import { HiddenRowInput, useTimeMapStore } from '../../store';
import { CityDisplay } from './CityDisplay';
import { useCityDisplayStore } from './cityLayout';
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
}: {
  time: number;
  selectionDataById: Record<string, SelectionData | undefined>;
  setTime: (time: number) => void;
  onRowFocus: (rowId: string) => void;
  onTimeDragEnd?: () => void;
  renderBehavior: RenderBehavior;
  isTrackingCurrentTime?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const liveLabelRef = useRef<HTMLDivElement>(null);

  const selectedItems = useTimeMapStore((state) => state.selectedItems);

  const setHiddenRows = useTimeMapStore((state) => state.setHiddenRows);

  const {
    registerContainerSize,
    registerDisplayItem,
    displayItemById,
    setValidRowIds,
    setObstructions,
  } = useCityDisplayStore();

  const { uniqueSelectedItems, duplicatedSelectedItems } = useMemo(() => {
    const seenItems = new Set<string>();

    const duplicatedSelectedItems: typeof selectedItems = [];

    const uniqueSelectedItems = selectedItems.filter((item) => {
      if (!item.itemId) {
        return false;
      }

      if (seenItems.has(item.itemId)) {
        duplicatedSelectedItems.push(item);
        return false;
      }

      seenItems.add(item.itemId);

      return true;
    });

    return { uniqueSelectedItems, duplicatedSelectedItems };
  }, [selectedItems]);

  useEffect(() => {
    setValidRowIds(uniqueSelectedItems.map((x) => x.rowId));
  }, [setValidRowIds, uniqueSelectedItems]);

  const cityDisplayItems = useMemo(() => {
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
  }, [onRowFocus, registerDisplayItem, selectionDataById, uniqueSelectedItems]);

  const cityDisplayItemsWithPositions = useMemo(() => {
    const renderedItems: Record<string, boolean> = {};

    const result = cityDisplayItems.map((cityItem) => {
      if (!cityItem) {
        return null;
      }

      const displayItem = displayItemById[cityItem.rowId];

      const blockingItems = displayItem?.intersections.filter((id) => renderedItems[id]) || [];

      const isBlocked = blockingItems.length > 0;

      renderedItems[cityItem.rowId] = !!(displayItem && !isBlocked);

      return {
        ...cityItem,
        labelPosition: displayItem?.labelPosition || null,
        labelIntersectsOthers: isBlocked,
        intersectingLabels: blockingItems.map((rowId) => displayItemById[rowId]?.city.label || ''),
      };
    });

    // Render the items in reverse order to ensure that the first item is on top
    result.reverse();

    return result;
  }, [cityDisplayItems, displayItemById]);

  useEffect(() => {
    const intersectionRows = cityDisplayItemsWithPositions
      .filter(
        (item): item is Exclude<(typeof cityDisplayItemsWithPositions)[number], null> =>
          !!item && item.labelIntersectsOthers
      )
      .map(
        (item): HiddenRowInput => ({
          rowId: item.rowId,
          data: { reason: 'intersect', intersectingLabels: item.intersectingLabels },
        })
      );

    const duplicateRowIds = duplicatedSelectedItems.map((item) => item.rowId);

    setHiddenRows([
      ...intersectionRows,
      ...duplicateRowIds.map((rowId): HiddenRowInput => ({ rowId, data: { reason: 'duplicate' } })),
    ]);
  }, [cityDisplayItemsWithPositions, duplicatedSelectedItems, setHiddenRows]);

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
        className={classNames('absolute top-1 right-1 text-red-500 text-xs font-bold', {
          invisible: !isTrackingCurrentTime,
        })}
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
        ? cityDisplayItemsWithPositions.map((displayItem) => {
            if (!displayItem) return null;

            const { rowId, displayProps, labelPosition, labelIntersectsOthers } = displayItem;

            return (
              <CityDisplay
                {...displayProps}
                disabled={isGrabbing || labelIntersectsOthers}
                labelHidden={labelIntersectsOthers}
                key={rowId}
                time={time}
                labelPosition={labelPosition}
              ></CityDisplay>
            );
          })
        : null}
    </div>
  );
}
