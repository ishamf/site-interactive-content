import { useEffect, useState } from 'react';
import { TimeState } from './types';
import { DateTime } from 'luxon';

export function useTimeState() {
  const [timeState, setTime] = useState<TimeState>(() => ({
    time: DateTime.now(),
    useAnimation: false,
    isRapidlyChanging: false,
  }));
  const [slowlyChangingTime, setSlowlyChangingTime] = useState<DateTime>(timeState.time);

  useEffect(() => {
    // Update the slowly changing time.
    // If it's rapidly changing, wait for a bit before updating.
    if (timeState.isRapidlyChanging) {
      const timeout = setTimeout(() => {
        setSlowlyChangingTime(timeState.time);
        setTime((state) => ({ ...state, isRapidlyChanging: false }));
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setSlowlyChangingTime(timeState.time);
    }
  }, [timeState.isRapidlyChanging, timeState.time]);

  return {
    timeState,
    setTime,
    slowlyChangingTime,
  };
}
