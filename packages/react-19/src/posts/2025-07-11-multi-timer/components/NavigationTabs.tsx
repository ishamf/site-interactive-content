import { Tab, Tabs } from '@mui/material';
import { useTimerStore } from '../store';
import { Link, useLocation, useNavigate } from 'react-router';

export function NavigationTabs() {
  const multiTimers = useTimerStore((s) => s.multiTimers);
  const createMultiTimer = useTimerStore((s) => s.createMultiTimer);

  const currentId = useLocation();

  const navigate = useNavigate();

  const currentValue = currentId.pathname;

  return (
    <Tabs value={currentValue} variant="scrollable" scrollButtons="auto">
      {multiTimers.map((timer) => (
        <Tab
          key={timer.id}
          label={timer.title}
          value={`/timer/${timer.id}`}
          component={Link}
          to={`/timer/${timer.id}`}
        />
      ))}

      <Tab
        key={`Create-${multiTimers.length}`}
        label="Create"
        onClick={() => {
          const { id } = createMultiTimer();
          navigate(`/timer/${id}`);
        }}
      ></Tab>
    </Tabs>
  );
}
