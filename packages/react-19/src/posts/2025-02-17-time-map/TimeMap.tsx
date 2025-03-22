import { useState } from 'react';
import { DateTime } from 'luxon';
import { MapDisplay } from './components/MapDisplay';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { TimeBar } from './components/TimeBar';
import { useSelectionStore } from './store';

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
    <div className="flex max-w-full flex-col p-4 gap-4 items-stretch justify-center md:flex-row md:items-start">
      <div className="max-w-[170vh] flex-1 z-10 self-center md:self-start md:sticky md:top-0 py-4 flex items-stretch flex-col">
        <MapDisplay time={time.valueOf()} />
        <TimeBar
          time={time.valueOf()}
          setTime={(ms) => {
            setTime(DateTime.fromMillis(ms));
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
