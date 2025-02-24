import { useState } from 'react';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@mui/x-date-pickers';
import { MapDisplay } from './components/MapDisplay';
import { Slider, TextField } from '@mui/material';

export function TimeMap() {
  const [time, setTime] = useState<DateTime>(() => DateTime.now());

  const utcTime = time.setZone('utc');

  return (
    <div className="flex max-w-full flex-row flex-wrap p-4 gap-4 items-start">
      <div className="flex-[999] max-w-[120vh] flex items-stretch flex-col gap-4 ">
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
      <div className="flex-1 gap-4 grid grid-cols-2 min-h-0">
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
      </div>
    </div>
  );
}
