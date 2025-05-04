import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './App.tsx';
import { pages } from './pages.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        {pages.map(({ Page, slug }) => (
          <Route key={slug} path={`/${slug}`} element={<Page />} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
