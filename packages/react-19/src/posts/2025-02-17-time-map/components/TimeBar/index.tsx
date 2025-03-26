/** @jsxImportSource @emotion/react */
import { Button } from '@mui/material';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { css } from '@emotion/react';
import { DAY_LENGTH } from '../../constants';

const TEN_MINUTES = 10 * 60 * 1000;

export function TimeBar({ time, setTime }: { time: DateTime; setTime: (time: DateTime) => void }) {
  const utcTime = time.toUTC();

  return (
    <div
      css={css`
        container-type: inline-size;
      `}
    >
      <div
        className="flex flex-col justify-between gap-4 w-full items-center"
        css={css`
          @container (min-width: 40rem) {
            flex-direction: row;
          }
        `}
      >
        <p className="text-neutral-900 dark:text-neutral-100 min-w-40 text-center">
          <span className="inline-block">{utcTime.toLocaleString(DateTime.DATETIME_FULL)}</span>{' '}
          <span className="inline-block">
            (<RelativeTime time={utcTime} />)
          </span>
        </p>

        <div className="shrink-0 flex gap-2 max-w-full overflow-x-auto">
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
