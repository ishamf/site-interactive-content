import { Tab, Tabs } from '@mui/material';
import { HashRouter, Route, Routes } from 'react-router';
import { HomepageAction } from './components/HomepageAction';
import { MultiTimerItem } from './components/MultiTimerItem';

export function MultiTimer() {
  return (
    <div>
      <HashRouter>
        <Tabs>
          <Tab label="Test"></Tab>
        </Tabs>
        <Routes>
          <Route path="/" element={<HomepageAction></HomepageAction>}></Route>
          <Route path="/timer/:id" element={<MultiTimerItem></MultiTimerItem>}></Route>
        </Routes>
      </HashRouter>
    </div>
  );
}
