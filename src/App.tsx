import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layouts/MainLayout';

import routes from './routes';

// 包装组件，用于判断是否需要 MainLayout
const LayoutWrapper: React.FC = () => {
  const location = useLocation();
  const noLayoutPaths: string[] = [];
  const needsLayout = !noLayoutPaths.includes(location.pathname);

  return (
    <>
      {needsLayout ? (
        <MainLayout>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      ) : (
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <IntersectObserver />
      <LayoutWrapper />
      <Toaster />
    </Router>
  );
};

export default App;
