import { useCallback, useEffect, useRef, useState } from 'react';
import { TimeState } from './types';
import { DateTime } from 'luxon';
import { useEventListener } from 'usehooks-ts';
import { useTimeMapStore } from './store';

export function useTimeState() {
  const [timeState, setTimeInternal] = useState<TimeState>(() => ({
    time: DateTime.now(),
    renderBehavior: 'instant',
    isRapidlyChanging: false,
  }));
  const [slowlyChangingTime, setSlowlyChangingTime] = useState<DateTime>(timeState.time);
  const [isTrackingCurrentTime, setIsTrackingCurrentTime] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  const isAnyTimeSelectorOpen = useTimeMapStore((state) => state.rowWithOpenTimeSelector !== null);

  const documentRef = useRef(document);

  useEventListener(
    'visibilitychange',
    () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    },
    documentRef
  );

  useEffect(() => {
    // Update the slowly changing time.
    // If it's rapidly changing, wait for a bit before updating.
    if (timeState.isRapidlyChanging) {
      const timeout = setTimeout(() => {
        setSlowlyChangingTime(timeState.time);
        setTimeInternal((state) => ({ ...state, isRapidlyChanging: false }));
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setSlowlyChangingTime(timeState.time);
    }
  }, [timeState.isRapidlyChanging, timeState.time]);

  const updateTimeToCurrentMinute = useCallback((animate: boolean = false) => {
    const currentTime = DateTime.now();

    // Only set time if the minute number has changed, since we don't show seconds
    setTimeInternal((state) => {
      const prevTime = state.time;

      if (!(+prevTime.startOf('minute') === +currentTime.startOf('minute'))) {
        const deltaMs = Math.abs(currentTime.diff(prevTime, 'milliseconds').milliseconds);

        return {
          time: currentTime,
          renderBehavior: animate ? 'animated' : deltaMs > 5 * 60 * 1000 ? 'instant' : 'deferred',
          isRapidlyChanging: false,
        };
      } else {
        return state;
      }
    });
  }, []);

  // Track the current time
  useEffect(() => {
    if (isTrackingCurrentTime && isDocumentVisible && !isAnyTimeSelectorOpen) {
      let timeout: ReturnType<typeof setTimeout> | undefined;

      function updateTimeTimeout() {
        updateTimeToCurrentMinute();

        const currentTime = DateTime.now();

        const remainingTimeInCurrentMinute = currentTime
          .endOf('minute')
          .diff(currentTime, 'milliseconds').milliseconds;

        timeout = setTimeout(updateTimeTimeout, remainingTimeInCurrentMinute + 10);
      }

      updateTimeTimeout();

      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [isTrackingCurrentTime, isDocumentVisible, isAnyTimeSelectorOpen, updateTimeToCurrentMinute]);

  const setTime = useCallback((newTime: TimeState) => {
    setTimeInternal(newTime);
    setIsTrackingCurrentTime(false);
  }, []);

  const trackCurrentTime = useCallback(() => {
    updateTimeToCurrentMinute(true);
    setIsTrackingCurrentTime(true);
  }, [updateTimeToCurrentMinute]);

  const setTimeNoLongerRapidlyChanging = useCallback(() => {
    setTimeInternal((state) => ({ ...state, isRapidlyChanging: false }));
  }, []);

  return {
    timeState,
    setTime,
    slowlyChangingTime,
    isTrackingCurrentTime,
    trackCurrentTime,
    setTimeNoLongerRapidlyChanging,
  };
}
