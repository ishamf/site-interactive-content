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

  const labelCommonStyles = css`
    position: absolute;
    white-space: nowrap;
    font-size: 0.75rem;
  `;

  const labelContents = (
    <>
      <span>{city.label}</span>
      <br></br>
      <span>{localTime.toLocaleString(DateTime.TIME_SIMPLE)}</span>
    </>
  );

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
            filter: drop-shadow(0 0 2px rgba(0, 0, 0, 1));
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

        {/* Label's background */}
        <div
          style={{
            ...styleByLabelPosition[labelPosition ?? 'bottomright'],
            visibility: labelHidden ? 'hidden' : 'visible',
          }}
          css={css`
            ${labelCommonStyles}
            z-index: 19;
            opacity: 0.6;

            pointer-events: none;
            user-select: none;
            color: rgba(0, 0, 0, 0);

            filter: blur(3px);

            & span {
              display: inline-block;
              background-color: #000;
              padding: 0.05rem 0.2rem;
              margin: -0.05rem -0.2rem;
            }
          `}
        >
          {labelContents}
        </div>

        <button
          ref={labelRef}
          onClick={onLabelClick}
          style={{
            ...styleByLabelPosition[labelPosition ?? 'bottomright'],
            visibility: labelHidden ? 'hidden' : 'visible',
          }}
          css={css`
            ${labelCommonStyles}
            z-index: 20;

            color: ${dayTextColor};
            /* Set a min-width here so that the label size doesn't change based on time */
            min-width: 4rem;
            border-radius: 0.5rem;
            cursor: pointer;

            &:hover {
              color: oklch(from ${dayTextColor} calc(l + 0.2) c h);
            }
          `}
        >
          {labelContents}
        </button>
      </div>
    </>
  );
}
