/** @jsxImportSource @emotion/react */
import {
  ComponentProps,
  ComponentPropsWithRef,
  ComponentRef,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { css } from '@emotion/react';
import { DateTime } from 'luxon';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { MapDisplay } from './components/MapDisplay';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { DayDisplayBar } from './components/DayDisplayBar';
import { INITIAL_DISPLAY_LENGTH, useSelectionStore, useUIStateStore } from './store';
import { TimeBar } from './components/TimeBar';
import { useElementSize } from '../../utils/hooks';
import { canvasWidth } from './constants';
import { TimezoneSelectionSkeleton } from './components/TimezoneSelectionSkeleton';

interface TimeState {
  time: DateTime;
  useAnimation: boolean;
  isRapidlyChanging: boolean;
}

export function TimeMap() {
  const [timeState, setTime] = useState<TimeState>(() => ({
    time: DateTime.now(),
    useAnimation: false,
    isRapidlyChanging: false,
  }));
  const [slowlyChangingTime, setSlowlyChangingTime] = useState<DateTime>(timeState.time);

  useEffect(() => {
    // Update the slowly changing time.
    // If it's rapidly changing, wait for a bit before updating.
    if (timeState.isRapidlyChanging) {
      const timeout = setTimeout(() => {
        setSlowlyChangingTime(timeState.time);
        setTime((state) => ({ ...state, isRapidlyChanging: false }));
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setSlowlyChangingTime(timeState.time);
    }
  }, [timeState.isRapidlyChanging, timeState.time]);

  const selectionStore = useSelectionStore();
  const addInitialCitiesIfEmpty = selectionStore.addInitialCitiesIfEmpty;

  const { selectedItems } = selectionStore;

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

  const refsByRowId: RefObject<Record<string, ComponentRef<typeof TimezoneSelection>>> = useRef({});

  const timeBarNode = (
    <TimeBar
      time={timeState.time}
      setTime={(time) => {
        setTime({ time, useAnimation: true, isRapidlyChanging: false });
      }}
    ></TimeBar>
  );

  const timeBarContainerRef = useRef<HTMLDivElement>(null);

  const timeBarSize = useElementSize({
    ref: timeBarContainerRef,
  });
  const timeBarHeight = timeBarSize?.height ?? 36.5;

  const selectedItemsRenderElements = useMemo(() => {
    function createFunctionProps(
      rowId: string
    ): Pick<
      ComponentPropsWithRef<typeof TimezoneSelection>,
      'ref' | 'onChangeId' | 'onChangeTime'
    > {
      return {
        ref: (e) => {
          if (e) {
            refsByRowId.current[rowId] = e;
          } else {
            delete refsByRowId.current[rowId];
          }
        },
        onChangeId: (newId, isDeleting) => {
          if (isDeleting) {
            selectionStore.removeSelection(rowId);
          } else {
            selectionStore.updateSelection(rowId, newId);
          }
        },
        onChangeTime: (time) => {
          setTime({ time, useAnimation: true, isRapidlyChanging: false });
        },
      };
    }

    const renderElements = selectedItems.map((item) => {
      const functionProps: Pick<
        ComponentPropsWithRef<typeof TimezoneSelection>,
        'ref' | 'onChangeId' | 'onChangeTime'
      > = createFunctionProps(item.rowId);
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
            selectionStore.addNewSelection(newId);
          }
        },
      },
      isNew: true,
    });

    return renderElements;
  }, [selectedItems, selectionStore]);

  const dndContextProps = useMemo(() => {
    const props: ComponentProps<typeof DndContext> = {
      onDragEnd: ({ active, over }) => {
        if (over && over.id !== active.id) {
          selectionStore.reorderSelection(active.id.toString(), over.id.toString());
        }
      },
    };

    return props;
  }, [selectionStore]);

  const sortableContextItems = useMemo(
    () => selectedItems.map((item) => item.rowId),
    [selectedItems]
  );

  const isAnyCitySelectorOpen = useUIStateStore((state) => state.rowWithOpenCitySelector !== null);

  const onRowFocus = useCallback((rowId: string) => {
    const selector = refsByRowId.current[rowId];
    if (selector) {
      selector.scrollIntoView();
      selector.focusSelector();
    }
  }, []);

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
              useAnimation: false,
              isRapidlyChanging: true,
            });
          }}
          onTimeDragEnd={() => {
            setTime((state) => ({ ...state, isRapidlyChanging: false }));
          }}
          animateTime={timeState.useAnimation}
          onRowFocus={onRowFocus}
        />
        <DayDisplayBar
          time={timeState.time.valueOf()}
          setTime={(ms) => {
            setTime({
              time: DateTime.fromMillis(ms),
              useAnimation: false,
              isRapidlyChanging: true,
            });
          }}
          onTimeDragEnd={() => {
            setTime((state) => ({ ...state, isRapidlyChanging: false }));
          }}
        ></DayDisplayBar>
        <div className="mt-4 hidden md:block" ref={timeBarContainerRef}>
          {timeBarNode}
        </div>
      </div>
      <div className="flex-1 md:pt-4 pb-4 min-h-0 md:max-w-[30rem] flex flex-col gap-4">
        <div className="mt-4 md:hidden">{timeBarNode}</div>
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
            .map((_, index) => <TimezoneSelectionSkeleton key={index}></TimezoneSelectionSkeleton>)
        )}
      </div>
    </div>
  );
}
