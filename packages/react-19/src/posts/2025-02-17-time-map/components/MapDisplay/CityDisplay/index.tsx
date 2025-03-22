/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';

import { DateTime } from 'luxon';
import { CitySelectionData } from '../../../assets';
import { dayColors, dayDarkTextColors } from '../../../constants';

export function CityDisplay({ time, city }: { time: number; city: CitySelectionData }) {
  const localTime = DateTime.fromMillis(time, { zone: city.timezone });
  const { longitude, latitude } = city;

  const colorIndex = localTime.weekday % 7;

  const dayColor = dayColors[colorIndex];

  return (
    <>
      <div
        css={css`
          width: 4px;
          height: 4px;
          box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.35);
          border-radius: 50%;
          background-color: ${dayColor};
          position: absolute;
          transform: translate(-50%, -50%);
          left: ${(longitude * 100) / 360 + 50}%;
          top: ${(latitude * -100) / 180 + 50}%;
        `}
      >
        <div
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            color: ${dayDarkTextColors[colorIndex]};
            text-shadow:
              0 0 7px #000000,
              0 0 7px #000000,
              0 0 7px #000000,
              0 0 7px #000000,
              0 0 7px #000000;
            border-radius: 0.5rem;
            padding: 0.1rem 0.5rem;
            font-size: 0.75rem;
            white-space: nowrap;
          `}
        >
          <p>{city.label}</p>
          <p>{localTime.toLocaleString(DateTime.TIME_24_SIMPLE)}</p>
        </div>
      </div>
    </>
  );
}
