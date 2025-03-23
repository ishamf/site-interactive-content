import { useState } from 'react';
import { DateTime } from 'luxon';
import { MapDisplay } from './components/MapDisplay';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { DayDisplayBar } from './components/DayDisplayBar';
import { useSelectionStore } from './store';
import { TimeBar } from './components/TimeBar';

export function TimeMap() {
  const [time, setTime] = useState<DateTime>(() => DateTime.now());

  const selectionStore = useSelectionStore();

  const { selectedItems } = selectionStore;

  const selectionDataQuery = useQuery({
    queryKey: ['selectionData'],
    queryFn: async () => {
      return loadSelectionData();
    },
    staleTime: Infinity,
  });

  return (
    <div className="flex max-w-full flex-col p-4 gap-4 items-stretch justify-center md:flex-row md:items-start bg-neutral-50 dark:bg-neutral-900">
      <div
        style={{ maxWidth: 'calc(200vh - 16rem)' }}
        className="flex-1 z-10 self-center md:self-start sticky top-0 py-4 flex items-stretch flex-col bg-neutral-50 dark:bg-neutral-900"
      >
        <MapDisplay
          time={time.valueOf()}
          selectionDataById={selectionDataQuery.data?.selectionDataById ?? {}}
          setTime={(ms) => {
            setTime(DateTime.fromMillis(ms));
          }}
        />
        <DayDisplayBar
          time={time.valueOf()}
          setTime={(ms) => {
            setTime(DateTime.fromMillis(ms));
          }}
        ></DayDisplayBar>
        <TimeBar
          time={time}
          setTime={(time) => {
            setTime(time);
          }}
        ></TimeBar>
      </div>
      <div className="flex-1 min-h-0 md:max-w-[28rem] flex flex-col gap-4">
        {selectionDataQuery.isSuccess ? (
          <>
            {selectedItems.map(({ itemId, rowId }) => {
              return (
                <TimezoneSelection
                  key={rowId}
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
            <TimezoneSelection
              key={selectedItems.length}
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
