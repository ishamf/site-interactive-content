import { useCallback, useEffect, useRef, useState } from 'react';
import { TimeState } from './types';
import { DateTime } from 'luxon';
import { useEventListener } from 'usehooks-ts';
import { useUIStateStore } from './store';

export function useTimeState() {
  const [timeState, setTimeInternal] = useState<TimeState>(() => ({
    time: DateTime.now(),
    renderBehavior: 'instant',
    isRapidlyChanging: false,
  }));
  const [slowlyChangingTime, setSlowlyChangingTime] = useState<DateTime>(timeState.time);
  const [isTrackingCurrentTime, setIsTrackingCurrentTime] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  const isAnyTimeSelectorOpen = useUIStateStore((state) => state.rowWithOpenTimeSelector !== null);

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
      const interval = setInterval(() => updateTimeToCurrentMinute(), 1000);

      updateTimeToCurrentMinute();

      return () => {
        clearInterval(interval);
      };
    }
  }, [isTrackingCurrentTime, isDocumentVisible, isAnyTimeSelectorOpen, updateTimeToCurrentMinute]);

  const setTime = useCallback((newTime: Parameters<typeof setTimeInternal>[0]) => {
    setTimeInternal(newTime);
    setIsTrackingCurrentTime(false);
  }, []);

  const trackCurrentTime = useCallback(() => {
    updateTimeToCurrentMinute(true);
    setIsTrackingCurrentTime(true);
  }, [updateTimeToCurrentMinute]);

  return {
    timeState,
    setTime,
    slowlyChangingTime,
    isTrackingCurrentTime,
    trackCurrentTime,
  };
}
