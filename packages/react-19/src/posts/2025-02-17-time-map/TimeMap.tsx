import { useState } from 'react';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@mui/x-date-pickers';
import { MapDisplay } from './components/MapDisplay';
import { TextField } from '@mui/material';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { TimeBar } from './components/TimeBar';

interface Selection {
  itemId: string | null;
  rowId: number;
}

let rowIds = 0;

export function TimeMap() {
  const [time, setTime] = useState<DateTime>(() => DateTime.now());

  const [selectedItems, setSelectedItems] = useState<Selection[]>([]);

  const selectionDataQuery = useQuery({
    queryKey: ['selectionData'],
    queryFn: async () => {
      return loadSelectionData();
    },
  });

  return (
    <div className="flex max-w-full flex-col p-4 gap-4 items-stretch justify-center md:flex-row md:items-start">
      <div className="max-w-[120vh] flex flex-1 self-center items-stretch flex-col gap-4">
        <MapDisplay time={time.valueOf()} />
        <TimeBar
          time={time.valueOf()}
          setTime={(ms) => {
            setTime(DateTime.fromMillis(ms));
          }}
        ></TimeBar>
      </div>
      <div className="flex-1 min-h-0 md:max-w-[28rem] gap-4 grid items-center grid-cols-[45%_1fr_auto]">
        <TextField disabled label="Time Zone" value={'UTC'}></TextField>
        <DateTimePicker
          value={time}
          className="col-span-2"
          timezone="UTC"
          ampm={false}
          onChange={(value) => {
            if (value) {
              setTime(value);
            }
          }}
        />
        {selectionDataQuery.isSuccess ? (
          <>
            {selectedItems.map(({ itemId, rowId }, idx) => {
              return (
                <TimezoneSelection
                  key={rowId}
                  selectionData={selectionDataQuery.data.selectionData}
                  currentSelection={
                    itemId ? selectionDataQuery.data.selectionDataById[itemId] : null
                  }
                  time={time}
                  onChangeId={(newId, isDeleting) => {
                    setSelectedItems((p) => {
                      const newItems = [...p];

                      if (!isDeleting) {
                        const current = newItems[idx];
                        newItems.splice(idx, 1, { ...current, itemId: newId });
                      } else {
                        newItems.splice(idx, 1);
                      }

                      return newItems;
                    });
                  }}
                  onChangeTime={(time) => {
                    setTime(time);
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
                setSelectedItems((p) => (newId ? [...p, { itemId: newId, rowId: rowIds++ }] : p));
              }}
              onChangeTime={(time) => {
                setTime(time);
              }}
              isNew
            ></TimezoneSelection>
          </>
        ) : null}
      </div>
    </div>
  );
}
