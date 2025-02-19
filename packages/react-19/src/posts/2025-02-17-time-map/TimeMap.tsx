import { useRef, useState } from 'react';
import { DatePicker } from 'antd';
import { MapDisplay } from './components/MapDisplay';
import dayjs from 'dayjs';

export function TimeMap() {
  const [time, setTime] = useState(1739782800000);

  const timeInst = dayjs(time);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <MapDisplay time={time} />

      <DatePicker
        showTime
        value={timeInst}
        getPopupContainer={() => containerRef.current!}
        onChange={(value) => {
          setTime(value.valueOf());
        }}
      ></DatePicker>
    </div>
  );
}
