import { useNavigate } from 'react-router';
import { useTimerStore } from '../store';
import { useEffect } from 'react';

export function HomepageAction() {
  const navigate = useNavigate();

  const multiTimers = useTimerStore((s) => s.multiTimers);
  const isStorageLoaded = useTimerStore((s) => s.isStorageLoaded);
  const createMultiTimer = useTimerStore((s) => s.createMultiTimer);

  useEffect(() => {
    if (isStorageLoaded) {
      if (multiTimers.length === 0) {
        const { id } = createMultiTimer();
        navigate(`/timer/${id}`);
      } else {
        navigate(`/timer/${multiTimers[0].id}`);
      }
    }
  }, [createMultiTimer, isStorageLoaded, multiTimers, navigate]);

  return null;
}
