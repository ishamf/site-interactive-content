import { useNavigate, useParams } from 'react-router';
import { useTimerStore } from '../store';
import { Button, TextField } from '@mui/material';
import { useEffect } from 'react';

export function MultiTimerItem() {
  const { id } = useParams<{ id: string }>();

  const multiTimers = useTimerStore((s) => s.multiTimers);
  const updateTitle = useTimerStore((s) => s.updateTitle);
  const deleteMultiTimer = useTimerStore((s) => s.deleteMultiTimer);
  const setEditingId = useTimerStore((s) => s.setEditingId);
  const navigate = useNavigate();

  const timer = multiTimers.find((t) => t.id === id);

  const currentEditingId = useTimerStore((s) => s.editingId);
  const isEditing = currentEditingId === id;

  // Clear editing state if we moved to another timer (that is not the one being edited)
  // but don't clear it if the currentEditingId is the one being changed.
  useEffect(() => {
    if (currentEditingId !== id) {
      setEditingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setEditingId]);

  if (!timer) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {isEditing ? (
        <TextField
          title="Title"
          value={timer.title}
          onChange={(e) => updateTitle(timer.id, e.target.value)}
        />
      ) : (
        <h2 className="text-lg font-normal">{timer.title}</h2>
      )}

      {/* Delete button */}
      {isEditing ? (
        <>
          <Button variant="outlined" onClick={() => setEditingId(null)}>
            Finish Editing
          </Button>

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
        </>
      ) : (
        <Button variant="outlined" onClick={() => id && setEditingId(id)}>
          Edit
        </Button>
      )}
    </div>
  );
}
