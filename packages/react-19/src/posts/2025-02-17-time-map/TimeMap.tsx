import { ComponentRef, RefObject, useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { MapDisplay } from './components/MapDisplay';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { DayDisplayBar } from './components/DayDisplayBar';
import { useSelectionStore } from './store';
import { TimeBar } from './components/TimeBar';
import { useMediaQuery } from 'usehooks-ts';

export function TimeMap() {
  const [time, setTime] = useState<DateTime>(() => DateTime.now());

  const selectionStore = useSelectionStore();
  const preloadSelection = selectionStore.preloadSelection;

  const { selectedItems } = selectionStore;

  const selectionDataQuery = useQuery({
    queryKey: ['selectionData'],
    queryFn: async () => {
      return loadSelectionData();
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (selectionDataQuery.isSuccess) {
      preloadSelection(selectionDataQuery.data);
    }
  }, [selectionDataQuery.data, selectionDataQuery.isSuccess, preloadSelection]);

  const refsByRowId: RefObject<Record<string, ComponentRef<typeof TimezoneSelection>>> = useRef({});

  const isWidescreen = useMediaQuery('(width >= 48rem)');

  const timeBarNode = (
    <TimeBar
      time={time}
      setTime={(time) => {
        setTime(time);
      }}
    ></TimeBar>
  );

  return (
    <div className="flex max-w-full flex-col px-4 gap-x-4 items-stretch justify-center md:flex-row md:items-start bg-neutral-50 dark:bg-neutral-900">
      <div
        style={{ maxWidth: 'calc(200vh - 16rem)' }}
        className="flex-1 z-10 self-center md:self-start sticky top-0 pt-4 pb-2 md:pb-4 flex items-stretch flex-col bg-neutral-50 dark:bg-neutral-900"
      >
        <MapDisplay
          time={time.valueOf()}
          selectionDataById={selectionDataQuery.data?.selectionDataById ?? {}}
          setTime={(ms) => {
            setTime(DateTime.fromMillis(ms));
          }}
          onRowFocus={(rowId) => {
            const selector = refsByRowId.current[rowId];
            if (selector) {
              selector.scrollIntoView();
              selector.focusSelector();
            }
          }}
        />
        <DayDisplayBar
          time={time.valueOf()}
          setTime={(ms) => {
            setTime(DateTime.fromMillis(ms));
          }}
        ></DayDisplayBar>
        {isWidescreen ? <div className="mt-4">{timeBarNode}</div> : null}
      </div>
      <div className="flex-1 md:pt-4 pb-4 min-h-0 md:max-w-[28rem] flex flex-col gap-4">
        {!isWidescreen ? timeBarNode : null}
        {selectionDataQuery.isSuccess ? (
          <>
            <DndContext
              onDragEnd={({ active, over }) => {
                if (over && over.id !== active.id) {
                  selectionStore.reorderSelection(active.id.toString(), over.id.toString());
                }
              }}
            >
              <SortableContext items={selectedItems.map((item) => item.rowId)}>
                {selectedItems.map(({ itemId, rowId }) => {
                  return (
                    <TimezoneSelection
                      ref={(e) => {
                        if (e) {
                          refsByRowId.current[rowId] = e;
                        } else {
                          delete refsByRowId.current[rowId];
                        }
                      }}
                      key={rowId}
                      rowId={rowId}
                      selectionData={selectionDataQuery.data.selectionData}
                      currentSelection={
                        itemId ? selectionDataQuery.data.selectionDataById[itemId] : null
                      }
                      time={time}
                      onChangeId={(newId, isDeleting) => {
                        if (isDeleting) {
                          selectionStore.removeSelection(rowId);
                        } else {
                          selectionStore.updateSelection(rowId, newId);
                        }
                      }}
                      onChangeTime={(t) => {
                        setTime(t);
                      }}
                    ></TimezoneSelection>
                  );
                })}
              </SortableContext>
            </DndContext>
            <TimezoneSelection
              key={selectedItems.length}
              rowId={'newItem'}
              selectionData={selectionDataQuery.data.selectionData}
              currentSelection={null}
              time={time}
              onChangeId={(newId) => {
                if (newId) {
                  selectionStore.addNewSelection(newId);
                }
              }}
              onChangeTime={(t) => {
                setTime(t);
              }}
              isNew
            ></TimezoneSelection>
          </>
        ) : null}
      </div>
    </div>
  );
}
