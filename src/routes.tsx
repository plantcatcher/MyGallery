import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { PageSkeleton } from '@/components/common/PageSkeleton';

const HomePage = lazy(() => import('./pages/HomePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

export interface RouteConfig {
  nameKey: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routeFallback = <PageSkeleton />;

const routes: RouteConfig[] = [
  {
    nameKey: 'nav.home',
    path: '/',
    element: (
      <Suspense fallback={routeFallback}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    nameKey: 'nav.gallery',
    path: '/gallery',
    element: (
      <Suspense fallback={routeFallback}>
        <GalleryPage />
      </Suspense>
    ),
  },
  {
    nameKey: 'nav.profile',
    path: '/profile',
    element: (
      <Suspense fallback={routeFallback}>
        <ProfilePage />
      </Suspense>
    ),
  },
  {
    nameKey: 'nav.about',
    path: '/about',
    element: (
      <Suspense fallback={routeFallback}>
        <AboutPage />
      </Suspense>
    ),
  },
  {
    nameKey: 'nav.changelog',
    path: '/changelog',
    element: (
      <Suspense fallback={routeFallback}>
        <ChangelogPage />
      </Suspense>
    ),
  },
  {
    nameKey: 'nav.admin',
    path: '/admin',
    element: (
      <Suspense fallback={routeFallback}>
        <AdminPage />
      </Suspense>
    ),
  },
  {
    nameKey: 'notFound.title',
    path: '*',
    element: (
      <Suspense fallback={routeFallback}>
        <NotFound />
      </Suspense>
    ),
  }
];

export default routes;
