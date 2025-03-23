import { Button } from '@mui/material';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { DAY_LENGTH } from '../../constants';

const TEN_MINUTES = 10 * 60 * 1000;

export function TimeBar({ time, setTime }: { time: DateTime; setTime: (time: DateTime) => void }) {
  const utcTime = time.toUTC();

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 w-full items-center contain-inline-size">
      <p className="text-neutral-700 dark:text-neutral-300 min-w-40 text-center">
        <span className="inline-block">{utcTime.toLocaleString(DateTime.DATETIME_FULL)}</span>
        <span className="inline-block">
          (<RelativeTime time={utcTime} />)
        </span>
      </p>

      <div className="flex gap-2 max-w-full overflow-x-auto">
        <Button
          variant="outlined"
          onClick={() => {
            setTime(utcTime.minus({ month: 1 }));
          }}
        >
          -1M
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setTime(utcTime.minus({ hour: 1 }));
          }}
        >
          -1H
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setTime(DateTime.now());
          }}
        >
          Now
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setTime(utcTime.plus({ hour: 1 }));
          }}
        >
          +1H
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setTime(utcTime.plus({ month: 1 }));
          }}
        >
          +1M
        </Button>
      </div>
    </div>
  );
}

function RelativeTime({ time }: { time: DateTime }) {
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    const currentTime = Date.now();

    if (Math.abs(currentTime - time.toMillis()) < DAY_LENGTH) {
      const interval = setInterval(() => {
        forceUpdate((prev) => prev + 1);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [time]);

  const deltaWhenRendering = Math.abs(Date.now() - time.toMillis());

  return (
    <span>
      {time.toRelative({ padding: deltaWhenRendering > 2 * TEN_MINUTES ? TEN_MINUTES : 0 })}
    </span>
  );
}
