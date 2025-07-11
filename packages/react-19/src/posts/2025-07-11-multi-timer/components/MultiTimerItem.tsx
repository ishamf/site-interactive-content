import { useNavigate, useParams } from 'react-router';
import { useTimerStore } from '../store';
import { Button, TextField } from '@mui/material';

export function MultiTimerItem() {
  const { id } = useParams<{ id: string }>();

  const multiTimers = useTimerStore((s) => s.multiTimers);
  const updateTitle = useTimerStore((s) => s.updateTitle);
  const deleteMultiTimer = useTimerStore((s) => s.deleteMultiTimer);
  const navigate = useNavigate();

  const timer = multiTimers.find((t) => t.id === id);

  if (!timer) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField
        title="Title"
        value={timer.title}
        onChange={(e) => updateTitle(timer.id, e.target.value)}
      />

      {/* Delete button */}
      <Button
        variant="outlined"
        color="error"
        onClick={() => {
          // Find the index of the current timer
          const index = multiTimers.findIndex((t) => t.id === timer.id);
          let nextId = '';

          if (index === 0) {
            // If it's the first timer, navigate to the next one if available
            nextId = multiTimers[index + 1]?.id || '';
          } else {
            // Otherwise, navigate to the previous one
            nextId = multiTimers[index - 1]?.id || '';
          }

          deleteMultiTimer(timer.id);

          if (nextId) {
            navigate(`/timer/${nextId}`);
          } else {
            navigate('/');
          }
        }}
      >
        Delete Timer
      </Button>
    </div>
  );
}
