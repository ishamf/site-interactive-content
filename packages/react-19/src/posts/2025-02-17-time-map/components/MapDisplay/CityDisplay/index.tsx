/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';

import { DateTime } from 'luxon';
import { CitySelectionData } from '../../../assets';
import { dayColors, dayDarkTextColors } from '../../../constants';
import { CSSProperties, useEffect, useRef } from 'react';
import { useElementSize } from '../../../../../utils/hooks';
import { LabelPosition } from '../cityLayout';
import classNames from 'classnames';

const indicatorRotationBasedOnLabelPosition = {
  topleft: -150,
  topright: -30,
  bottomleft: 150,
  bottomright: 30,
  top: -90,
  left: -180,
  right: 0,
  bottom: 90,
};

const leftPosStyle: CSSProperties = {
  right: 0,
  textAlign: 'right',
  paddingRight: '0.5rem',
};

const rightPosStyle: CSSProperties = {
  left: 0,
  textAlign: 'left',
  paddingLeft: '0.5rem',
};

const centerPosStyle: CSSProperties = {
  left: 0,
  transform: 'translateX(-50%)',
  textAlign: 'center',
  paddingLeft: '0.25rem',
  paddingRight: '0.25rem',
};

const verticalCenterAlignStyle: CSSProperties = {
  top: 0,
  transform: 'translateY(-50%)',
  paddingTop: '0.125rem',
  paddingBottom: '0.125rem',
};

// The padding on these two are intentionally in the wrong direction
// to reserve space for the top and bottom positions
const topPosStyle: CSSProperties = {
  bottom: 0,
  paddingTop: '0.125rem',
  paddingBottom: '0.125rem',
};

const bottomPosStyle: CSSProperties = {
  top: 0,
  paddingTop: '0.125rem',
  paddingBottom: '0.125rem',
};

const styleByLabelPosition: Record<LabelPosition, CSSProperties> = {
  topleft: {
    ...topPosStyle,
    ...leftPosStyle,
  },
  topright: {
    ...topPosStyle,
    ...rightPosStyle,
  },
  bottomleft: {
    ...bottomPosStyle,
    ...leftPosStyle,
  },
  bottomright: {
    ...bottomPosStyle,
    ...rightPosStyle,
  },
  left: {
    ...verticalCenterAlignStyle,
    ...leftPosStyle,
  },
  right: {
    ...verticalCenterAlignStyle,
    ...rightPosStyle,
  },
  top: {
    ...topPosStyle,
    ...centerPosStyle,
    paddingTop: '0',
    paddingBottom: '0.25rem',
  },
  bottom: {
    ...bottomPosStyle,
    ...centerPosStyle,
    paddingBottom: '0',
    paddingTop: '0.25rem',
  },
};

export function CityDisplay({
  time,
  city,
  labelPosition,
  onLabelSizeChange,
  onLabelClick,
  className,
  disabled,
  labelHidden,
}: {
  time: number;
  city: CitySelectionData;
  labelPosition: LabelPosition | null;
  onLabelSizeChange: (size: { width: number; height: number } | null) => void;
  onLabelClick: () => void;
  className?: string;
  disabled?: boolean;
  labelHidden?: boolean;
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

          ${!labelPosition ? 'visibility: hidden;' : ''}
        `}
        style={{
          left: `${(longitude * 100) / 360 + 50}%`,
          top: `${(latitude * -100) / 180 + 50}%`,
        }}
        className={classNames(
          {
            'pointer-events-none': disabled,
            'opacity-50': labelHidden,
          },
          className
        )}
      >
        <svg
          css={css`
            width: 12.5px;
            height: 5px;
            z-index: 10;
            transform-origin: 2.5px 2.5px;
            transform: translate(-2.5px, -2.5px)
              rotate(${indicatorRotationBasedOnLabelPosition[labelPosition ?? 'bottomright']}deg);
            filter: ${Array(1).fill('drop-shadow(0 0 2px rgba(0, 0, 0, 1))').join(' ')};
          `}
          viewBox="0 0 50 20"
        >
          {labelHidden ? null : (
            <path
              style={{
                stroke: dayTextColor,
                strokeWidth: 8,
                strokeLinecap: 'round',
              }}
              d="M 10 10 h 30"
            />
          )}
          <circle style={{ fill: dayColor }} cx="10" cy="10" r="10" />
        </svg>

        <button
          ref={labelRef}
          onClick={onLabelClick}
          style={{
            ...styleByLabelPosition[labelPosition ?? 'bottomright'],
            visibility: labelHidden ? 'hidden' : 'visible',
          }}
          css={css`
            position: absolute;
            z-index: 20;

            color: ${dayTextColor};
            text-shadow: ${Array(5).fill('0 0 7px #000000').join(',')};
            border-radius: 0.5rem;
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
