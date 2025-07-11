import { HashRouter, Route, Routes } from 'react-router';
import { HomepageAction } from './components/HomepageAction';
import { MultiTimerItem } from './components/MultiTimerItem';
import { NavigationTabs } from './components/NavigationTabs';

export function MultiTimer() {
  return (
    <div>
      <HashRouter>
        <NavigationTabs></NavigationTabs>
        <Routes>
          <Route path="/" element={<HomepageAction></HomepageAction>}></Route>
          <Route path="/timer/:id" element={<MultiTimerItem></MultiTimerItem>}></Route>
        </Routes>
      </HashRouter>
    </div>
  );
}
