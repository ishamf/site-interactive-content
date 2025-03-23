/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { flMod } from '../../../../utils/math';
import { useRef, useMemo } from 'react';
import classNames from 'classnames';
import { dayColors, dayDarkTextColors, dayLightTextColors, EPOCH_START_DAY } from '../../constants';
import { DateTime } from 'luxon';
import { useGrabTime } from '../../utils';

const DAY_LENGTH = 24 * 3600 * 1000;

export function DayDisplayBar({
  time,
  setTime,
}: {
  time: number;
  setTime: (time: number) => void;
}) {
  const currentDaysSinceEpoch = Math.floor(time / DAY_LENGTH);
  const dayPercentage = (flMod(time, DAY_LENGTH) / DAY_LENGTH) * 100;

  const offset2X = dayPercentage / 2;

  const currentWeekDay = flMod(currentDaysSinceEpoch + EPOCH_START_DAY, 7);

  const currentDayColorIndex = currentWeekDay;
  const prevDayColorIndex = flMod(currentDayColorIndex - 1, 7);
  const nextDayColorIndex = flMod(currentDayColorIndex + 1, 7);

  const prevDayColor = dayColors[prevDayColorIndex];
  const currentDayColor = dayColors[currentDayColorIndex];
  const nextDayColor = dayColors[nextDayColorIndex];

  const containerRef = useRef<HTMLDivElement | null>(null);

  const isTextShowingNextDay = dayPercentage >= 50;

  const { listeners, isGrabbing } = useGrabTime({ container: containerRef.current, time, setTime });

  const leftTextColorIndex = isTextShowingNextDay ? currentDayColorIndex : prevDayColorIndex;
  const rightTextColorIndex =
    dayPercentage == 50
      ? leftTextColorIndex
      : isTextShowingNextDay
        ? nextDayColorIndex
        : currentDayColorIndex;
  const { leftText, rightText } = useMemo(() => {
    const currentDateTime = DateTime.fromMillis(currentDaysSinceEpoch * DAY_LENGTH).setZone('utc');

    if (isTextShowingNextDay) {
      const leftText = currentDateTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
      const rightText = currentDateTime
        .plus({ days: 1 })
        .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

      if (dayPercentage == 50) {
        return { leftText, rightText: leftText };
      }

      return { leftText, rightText };
    } else {
      const leftText = currentDateTime
        .minus({ days: 1 })
        .toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
      const rightText = currentDateTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

      return { leftText, rightText };
    }
  }, [currentDaysSinceEpoch, isTextShowingNextDay, dayPercentage]);

  return (
    <div
      className={classNames('w-full overflow-hidden select-none touch-pan-y', {
        'cursor-grab': !isGrabbing,
        'cursor-grabbing': isGrabbing,
      })}
      ref={containerRef}
      {...listeners}
    >
      <div className="pointer-events-none w-full relative">
        <div
          className="relative flex"
          css={css`
            width: 200%;
          `}
          style={{
            transform: `translateX(-${offset2X}%)`,
          }}
        >
          <div className="flex-1 h-2" style={{ backgroundColor: prevDayColor }}></div>
          <div className="flex-2 h-2" style={{ backgroundColor: currentDayColor }}></div>
          <div className="flex-1 h-2" style={{ backgroundColor: nextDayColor }}></div>
        </div>
        <div className="flex justify-between">
          <div
            css={css`
              color: ${dayLightTextColors[leftTextColorIndex]};

              @media (prefers-color-scheme: dark) {
                color: ${dayDarkTextColors[leftTextColorIndex]};
              }
            `}
          >
            {leftText}
          </div>
          <div
            css={css`
              color: ${dayLightTextColors[rightTextColorIndex]};

              @media (prefers-color-scheme: dark) {
                color: ${dayDarkTextColors[rightTextColorIndex]};
              }
            `}
          >
            {rightText}
          </div>
        </div>
      </div>
    </div>
  );
}
