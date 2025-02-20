import { useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@mui/x-date-pickers';
import { MapDisplay } from './components/MapDisplay';

export function TimeMap() {
  const [time, setTime] = useState<DateTime>(() => DateTime.now());

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <MapDisplay time={time.valueOf()} />

      <DateTimePicker
        value={time}
        timezone="UTC"
        onChange={(value) => {
          if (value) {
            setTime(value);
          }
        }}
      />
    </div>
  );
}
