import { useState } from 'react';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@mui/x-date-pickers';
import { MapDisplay } from './components/MapDisplay';
import { Slider, TextField } from '@mui/material';
import { TimezoneSelection } from './components/TimezoneSelection';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';

export function TimeMap() {
  const [time, setTime] = useState<DateTime>(() => DateTime.now());

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const selectionDataQuery = useQuery({
    queryKey: ['selectionData'],
    queryFn: async () => {
      return loadSelectionData();
    },
  });

  const utcTime = time.setZone('utc');

  return (
    <div className="flex max-w-full flex-col md:flex-row p-4 gap-4 items-start justify-center">
      <div className="max-w-[120vh] flex flex-1 items-stretch flex-col gap-4 ">
        <MapDisplay time={time.valueOf()} />
        <Slider
          min={1}
          max={287}
          value={288 - utcTime.diff(utcTime.startOf('day')).as('days') * 288}
          onChange={(_e, v) => {
            if (typeof v === 'number') {
              setTime(utcTime.startOf('day').plus({ days: 1 - v / 288 }));
            }
          }}
        ></Slider>
      </div>
      <div className="flex-1 min-h-0 md:max-w-[24rem] gap-4 grid grid-cols-2  ">
        <TextField disabled label="Time Zone" value={'UTC'}></TextField>
        <DateTimePicker
          value={time}
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
            {selectedItems.map((id, idx) => {
              return (
                <TimezoneSelection
                  key={idx}
                  selectionData={selectionDataQuery.data.selectionData}
                  currentSelection={selectionDataQuery.data.selectionDataById[id]}
                  time={time}
                  onChangeId={(newId) => {
                    setSelectedItems((p) => {
                      const newItems = [...p];

                      if (newId) {
                        newItems.splice(idx, 1, newId);
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
                setSelectedItems((p) => (newId ? [...p, newId] : p));
              }}
              onChangeTime={(time) => {
                setTime(time);
              }}
            ></TimezoneSelection>
          </>
        ) : null}
      </div>
    </div>
  );
}
