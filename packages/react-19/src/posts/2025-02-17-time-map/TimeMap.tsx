/** @jsxImportSource @emotion/react */
import { ComponentProps, useEffect, useMemo, useRef, useCallback } from 'react';
import { css } from '@emotion/react';
import { DateTime } from 'luxon';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { MapDisplay } from './components/MapDisplay';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { DayDisplayBar } from './components/DayDisplayBar';
import { INITIAL_DISPLAY_LENGTH, useTimeMapStore } from './store';
import { TimeBar } from './components/TimeBar';
import { useElementSize } from '../../utils/hooks';
import { canvasWidth } from './constants';
import { TimezoneSelectionSkeleton } from './components/TimezoneSelectionSkeleton';
import { useTimeState } from './hooks';

export function TimeMap() {
  const {
    timeState,
    setTime,
    slowlyChangingTime,
    trackCurrentTime,
    isTrackingCurrentTime,
    setTimeNoLongerRapidlyChanging,
  } = useTimeState();

  const selectedItems = useTimeMapStore((s) => s.selectedItems);
  const addInitialCitiesIfEmpty = useTimeMapStore((s) => s.addInitialCitiesIfEmpty);
  const removeSelection = useTimeMapStore((s) => s.removeSelection);
  const updateSelection = useTimeMapStore((s) => s.updateSelection);
  const addNewSelection = useTimeMapStore((s) => s.addNewSelection);
  const reorderSelection = useTimeMapStore((s) => s.reorderSelection);

  const isAnyCitySelectorOpen = useTimeMapStore((state) => state.rowWithOpenCitySelector !== null);
  const openTimeSelector = useTimeMapStore((state) => state.openTimeSelector);

  const selectionDataQuery = useQuery({
    queryKey: ['selectionData'],
    queryFn: async () => {
      return loadSelectionData();
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    // Add initial cities to the store if it's empty.
    // This requires the selectionData to be loaded.
    if (selectionDataQuery.isSuccess) {
      addInitialCitiesIfEmpty(selectionDataQuery.data);
    }
  }, [selectionDataQuery.data, selectionDataQuery.isSuccess, addInitialCitiesIfEmpty]);

  const timeBarContainerRef = useRef<HTMLDivElement>(null);

  const timeBarSize = useElementSize({
    ref: timeBarContainerRef,
  });
  const timeBarHeight = timeBarSize?.height ?? 36.5;

  const selectedItemsRenderElements = useMemo(() => {
    function createFunctionProps(
      rowId: string
    ): Pick<ComponentProps<typeof TimezoneSelection>, 'onChangeId' | 'onChangeTime'> {
      return {
        onChangeId: (newId, isDeleting) => {
          if (isDeleting) {
            removeSelection(rowId);
          } else {
            updateSelection(rowId, newId);
          }
        },
        onChangeTime: (time) => {
          setTime({ time, renderBehavior: 'animated', isRapidlyChanging: false });
        },
      };
    }

    const renderElements = selectedItems.map((item) => {
      const functionProps = createFunctionProps(item.rowId);
      return {
        item,
        functionProps,
        isNew: false,
      };
    });

    const newRowId = `newItem-${selectedItems.length}`;

    renderElements.push({
      item: { itemId: null, rowId: newRowId },
      functionProps: {
        ...createFunctionProps(newRowId),
        onChangeId: (newId) => {
          if (newId) {
            addNewSelection(newId);
          }
        },
      },
      isNew: true,
    });

    return renderElements;
  }, [addNewSelection, removeSelection, selectedItems, setTime, updateSelection]);

  const dndContextProps = useMemo(() => {
    const props: ComponentProps<typeof DndContext> = {
      onDragEnd: ({ active, over }) => {
        if (over && over.id !== active.id) {
          reorderSelection(active.id.toString(), over.id.toString());
        }
      },
    };

    return props;
  }, [reorderSelection]);

  const sortableContextItems = useMemo(
    () => selectedItems.map((item) => item.rowId),
    [selectedItems]
  );

  const onRowFocus = useCallback(
    (rowId: string) => {
      openTimeSelector(rowId);
    },
    [openTimeSelector]
  );

  const timeBarNode = (
    <TimeBar
      time={timeState.time}
      setTime={(time) => {
        setTime({ time, renderBehavior: 'animated', isRapidlyChanging: false });
      }}
      setToNow={() => {
        trackCurrentTime();
      }}
      isTrackingCurrentTime={isTrackingCurrentTime}
    ></TimeBar>
  );

  return (
    <div className="flex max-w-full flex-col px-4 gap-x-4 items-stretch justify-center md:flex-row md:items-start bg-neutral-50 dark:bg-neutral-900">
      <div
        className="flex-1 z-10 self-center md:self-start pt-4 pb-2 md:pb-4 flex items-stretch flex-col bg-neutral-50 dark:bg-neutral-900"
        style={{
          maxWidth: `min(max(calc(200vh - 10rem - ${timeBarHeight * 2}px), min(30rem - ${timeBarHeight * 2}px, 100%)), ${canvasWidth}px)`,
        }}
        css={css`
          @media ((width >= 48rem) and (height >= 20rem)) {
            position: sticky;
            top: 0;
          }

          ${!isAnyCitySelectorOpen
            ? css`
                @media (height >= 100vw) {
                  position: sticky;
                  top: 0;
                }
              `
            : ''}
        `}
      >
        <MapDisplay
          time={timeState.time.valueOf()}
          selectionDataById={selectionDataQuery.data?.selectionDataById ?? {}}
          setTime={(ms) => {
            setTime({
              time: DateTime.fromMillis(ms),
              renderBehavior: 'instant',
              isRapidlyChanging: true,
            });
          }}
          onTimeDragEnd={() => {
            setTimeNoLongerRapidlyChanging();
          }}
          renderBehavior={timeState.renderBehavior}
          onRowFocus={onRowFocus}
          isTrackingCurrentTime={isTrackingCurrentTime}
          trackCurrentTime={trackCurrentTime}
        />
        <DayDisplayBar
          time={timeState.time.valueOf()}
          setTime={(ms) => {
            setTime({
              time: DateTime.fromMillis(ms),
              renderBehavior: 'instant',
              isRapidlyChanging: true,
            });
          }}
          onTimeDragEnd={() => {
            setTimeNoLongerRapidlyChanging();
          }}
          isTrackingCurrentTime={isTrackingCurrentTime}
          trackCurrentTime={trackCurrentTime}
        ></DayDisplayBar>
        <div className="mt-4 hidden md:block" ref={timeBarContainerRef}>
          {timeBarNode}
        </div>
      </div>
      <div className="flex-1 md:pt-4 pb-4 min-h-0 md:max-w-[30rem] flex flex-col gap-4">
        <div className="mt-4 md:hidden">{timeBarNode}</div>
        <ul className="flex flex-col gap-4">
          {selectionDataQuery.isSuccess ? (
            <>
              <DndContext {...dndContextProps}>
                <SortableContext items={sortableContextItems}>
                  {selectedItemsRenderElements.map(
                    ({ item: { itemId, rowId }, functionProps, isNew }) => {
                      return (
                        <TimezoneSelection
                          key={rowId}
                          rowId={rowId}
                          {...functionProps}
                          selectionData={selectionDataQuery.data.selectionData}
                          currentSelection={
                            itemId ? selectionDataQuery.data.selectionDataById[itemId] : null
                          }
                          isDateTimeFrozen={timeState.isRapidlyChanging}
                          time={slowlyChangingTime}
                          isNew={isNew}
                        ></TimezoneSelection>
                      );
                    }
                  )}
                </SortableContext>
              </DndContext>
            </>
          ) : (
            Array((selectedItems.length || INITIAL_DISPLAY_LENGTH) + 1)
              .fill(null)
              .map((_, index) => (
                <TimezoneSelectionSkeleton key={index}></TimezoneSelectionSkeleton>
              ))
          )}
        </ul>
      </div>
    </div>
  );
}
