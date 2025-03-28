/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';

import { DateTime } from 'luxon';
import { CitySelectionData } from '../../../assets';
import { dayColors, dayDarkTextColors } from '../../../constants';
import { useEffect, useRef } from 'react';
import { useElementSize } from '../../../../../utils/hooks';
import { LabelPosition } from '../cityLayout';

const indicatorRotationBasedOnLabelPosition = {
  topleft: -150,
  topright: -30,
  bottomleft: 150,
  bottomright: 30,
};

export function CityDisplay({
  time,
  city,
  labelPosition,
  onLabelSizeChange,
  onLabelClick,
}: {
  time: number;
  city: CitySelectionData;
  labelPosition: LabelPosition | null;
  onLabelSizeChange: (size: { width: number; height: number } | null) => void;
  onLabelClick: () => void;
}) {
  const labelRef = useRef<HTMLButtonElement>(null);

  const labelSize = useElementSize({ ref: labelRef });

  useEffect(() => {
    onLabelSizeChange(labelSize);
  }, [labelSize, onLabelSizeChange]);

  const localTime = DateTime.fromMillis(time, { zone: city.timezone });
  const { longitude, latitude } = city;

  const colorIndex = localTime.weekday;

  const dayColor = dayColors[colorIndex];
  const dayTextColor = dayDarkTextColors[colorIndex];

  return (
    <>
      <div
        css={css`
          width: 0px;
          height: 0px;
          position: absolute;
          transform: translate(-50%, -50%);

          ${!labelPosition ? 'visibility: hidden;' : ''}
        `}
        style={{
          left: `${(longitude * 100) / 360 + 50}%`,
          top: `${(latitude * -100) / 180 + 50}%`,
        }}
      >
        <svg
          css={css`
            width: 12.5px;
            height: 5px;
            transform-origin: 2.5px 2.5px;
            transform: translate(-2.5px, -2.5px)
              rotate(${indicatorRotationBasedOnLabelPosition[labelPosition ?? 'bottomright']}deg);
            filter: ${Array(1).fill('drop-shadow(0 0 2px rgba(0, 0, 0, 1))').join(' ')};
          `}
          viewBox="0 0 50 20"
        >
          <path
            style={{
              stroke: dayTextColor,
              strokeWidth: 8,
              strokeLinecap: 'round',
            }}
            d="M 10 10 h 30"
          />
          <circle style={{ fill: dayColor }} cx="10" cy="10" r="10" />
        </svg>

        <button
          ref={labelRef}
          onClick={onLabelClick}
          css={css`
            position: absolute;
            ${labelPosition === 'topleft' || labelPosition == 'topright' ? `bottom: 0;` : `top: 0;`}
            ${labelPosition === 'topleft' || labelPosition == 'bottomleft'
              ? `right: 0; text-align: right;`
              : `left: 0; text-align: left;`}
            color: ${dayTextColor};
            text-shadow: ${Array(5).fill('0 0 7px #000000').join(',')};
            border-radius: 0.5rem;
            padding: 0.1rem 0.5rem;
            font-size: 0.75rem;
            white-space: nowrap;
            cursor: pointer;

            &:hover {
              color: oklch(from ${dayTextColor} calc(l + 0.2) c h);
            }
          `}
        >
          <p>{city.label}</p>
          {/* Set a min-width here so that the label size doesn't change based on time */}
          <p className="min-w-14">{localTime.toLocaleString(DateTime.TIME_SIMPLE)}</p>
        </button>
      </div>
    </>
  );
}
