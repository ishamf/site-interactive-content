import { useParams } from 'react-router';
import { useTimerStore } from '../store';

export function MultiTimerItem() {
  const { id } = useParams<{ id: string }>();

  const multiTimers = useTimerStore((s) => s.multiTimers);

  const timer = multiTimers.find((t) => t.id === id);

  if (!timer) {
    return null;
  }

  return (
    <div>
      <h2>{timer.title}</h2>
    </div>
  );
}
