import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '光影',
    path: '/',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    name: '画廊',
    path: '/gallery',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <GalleryPage />
      </Suspense>
    ),
  },
  {
    name: '自白',
    path: '/profile',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ProfilePage />
      </Suspense>
    ),
  },
  {
    name: '回声',
    path: '/about',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    name: '登录',
    path: '/login',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    name: '管理',
    path: '/admin',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <AdminPage />
      </Suspense>
    ),
  },
  {
    name: 'Not Found',
    path: '*',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <NotFound />
      </Suspense>
    ),
  }
];

export default routes;

