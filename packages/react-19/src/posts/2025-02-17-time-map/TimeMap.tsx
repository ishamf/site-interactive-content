/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useCallback } from 'react';
import { css } from '@emotion/react';
import { DateTime } from 'luxon';
import { MapDisplay } from './components/MapDisplay';
import { useQuery } from '@tanstack/react-query';
import { loadSelectionData } from './assets';
import { DayDisplayBar } from './components/DayDisplayBar';
import { useTimeMapStore } from './store';
import { TimeBar } from './components/TimeBar';
import { useElementSize } from '../../utils/hooks';
import { canvasWidth } from './constants';
import { useTimeState } from './hooks';
import { CityTimeList } from './components/CityTimeList';

export function TimeMap() {
  const {
    timeState,
    setTime,
    slowlyChangingTime,
    trackCurrentTime,
    isTrackingCurrentTime,
    setTimeNoLongerRapidlyChanging,
  } = useTimeState();

  const addInitialCitiesIfEmpty = useTimeMapStore((s) => s.addInitialCitiesIfEmpty);

  const isAnyCitySelectorOpen = useTimeMapStore((state) => state.rowWithOpenCitySelector !== null);
  const openTimeSelector = useTimeMapStore((state) => state.openTimeSelector);

  const selectionDataQuery = useQuery({
    queryKey: ['selectionData'],
    queryFn: async () => {
      return loadSelectionData();
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    // Add initial cities to the store if it's empty.
    // This requires the selectionData to be loaded.
    if (selectionDataQuery.isSuccess) {
      addInitialCitiesIfEmpty(selectionDataQuery.data);
    }
  }, [selectionDataQuery.data, selectionDataQuery.isSuccess, addInitialCitiesIfEmpty]);

  const timeBarContainerRef = useRef<HTMLDivElement>(null);

  const timeBarSize = useElementSize({
    ref: timeBarContainerRef,
  });
  const timeBarHeight = timeBarSize?.height ?? 36.5;

  const onRowFocus = useCallback(
    (rowId: string) => {
      openTimeSelector(rowId);
    },
    [openTimeSelector]
  );

  const timeBarNode = (
    <TimeBar
      time={timeState.time}
      setTime={(time) => {
        setTime({ time, renderBehavior: 'animated', isRapidlyChanging: false });
      }}
      setToNow={() => {
        trackCurrentTime();
      }}
      isTrackingCurrentTime={isTrackingCurrentTime}
    ></TimeBar>
  );

  const stickyCss = css`
    position: sticky;
    top: var(--sticky-top-margin, 0);
  `;

  return (
    <div className="flex max-w-full flex-col px-4 gap-x-4 items-stretch justify-center md:flex-row md:items-start bg-neutral-50 dark:bg-neutral-900">
      <div
        className="flex-1 z-10 self-center md:self-start pt-4 pb-2 md:pb-4 flex items-stretch flex-col bg-neutral-50 dark:bg-neutral-900"
        style={{
          maxWidth: `min(max(calc(200vh - 10rem - ${timeBarHeight * 2}px), min(30rem - ${timeBarHeight * 2}px, 100%)), ${canvasWidth}px)`,
        }}
        css={css`
          @media ((width >= 48rem) and (height >= 20rem)) {
            ${stickyCss}
          }

          ${!isAnyCitySelectorOpen
            ? css`
                @media (height >= 100vw) {
                  ${stickyCss}
                }
              `
            : ''}
        `}
      >
        <MapDisplay
          time={timeState.time.valueOf()}
          selectionDataById={selectionDataQuery.data?.selectionDataById ?? {}}
          setTime={(ms) => {
            setTime({
              time: DateTime.fromMillis(ms),
              renderBehavior: 'instant',
              isRapidlyChanging: true,
            });
          }}
          onTimeDragEnd={() => {
            setTimeNoLongerRapidlyChanging();
          }}
          renderBehavior={timeState.renderBehavior}
          onRowFocus={onRowFocus}
          isTrackingCurrentTime={isTrackingCurrentTime}
          trackCurrentTime={trackCurrentTime}
        />
        <DayDisplayBar
          time={timeState.time.valueOf()}
          setTime={(ms) => {
            setTime({
              time: DateTime.fromMillis(ms),
              renderBehavior: 'instant',
              isRapidlyChanging: true,
            });
          }}
          onTimeDragEnd={() => {
            setTimeNoLongerRapidlyChanging();
          }}
          isTrackingCurrentTime={isTrackingCurrentTime}
          trackCurrentTime={trackCurrentTime}
        ></DayDisplayBar>
        <div className="mt-4 hidden md:block" ref={timeBarContainerRef}>
          {timeBarNode}
        </div>
      </div>
      <div className="flex-1 md:pt-4 pb-4 min-h-0 md:max-w-[30rem] flex flex-col gap-4">
        <div className="mt-4 md:hidden">{timeBarNode}</div>
        <ul className="flex flex-col gap-4">
          {/* City-time list */}
          <CityTimeList
            selectionDataQuery={selectionDataQuery}
            timeState={timeState}
            setTime={setTime}
            slowlyChangingTime={slowlyChangingTime}
          ></CityTimeList>
        </ul>
      </div>
    </div>
  );
}
