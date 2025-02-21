import { useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@mui/x-date-pickers';
import { MapDisplay } from './components/MapDisplay';
import { Slider } from '@mui/material';

export function TimeMap() {
  const [needQuickUpdate, setNeedQuickUpdate] = useState<boolean>(false);
  const [time, setTime] = useState<DateTime>(() => DateTime.now());
  const [sliderValue, setSliderValue] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <MapDisplay
        time={time.valueOf() + (sliderValue * 24 * 3600 * 1000) / 100}
        needQuickUpdate={needQuickUpdate}
      />

      <DateTimePicker
        value={time}
        timezone="UTC"
        onChange={(value) => {
          if (value) {
            setTime(value);
            setNeedQuickUpdate(false);
          }
        }}
      />

      <Slider
        value={sliderValue}
        onChange={(_e, v) => {
          if (typeof v === 'number') {
            setSliderValue(v);
            setNeedQuickUpdate(true);
          }
        }}
      ></Slider>
    </div>
  );
}
