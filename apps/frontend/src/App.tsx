import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, PageSpinner } from '~/components';
import {
  Badges,
  Forgot,
  Home,
  Login,
  SignUp,
  Study,
  studyAction,
  studyLoader,
  UpdatePassword,
  UserProfile,
} from '~/routes';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

const router = createBrowserRouter([
  {
    element: <Home />,
    path: '/home',
  },
  {
    action: studyAction,
    element: <Study />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    loader: studyLoader,
    path: '/study',
  },
  {
    element: <Login />,
    path: '/',
  },
  {
    element: <SignUp />,
    path: '/signup',
  },
  {
    element: <Forgot />,
    path: '/forgot-password',
  },
  {
    element: <Badges />,
    path: '/badges',
  },
  {
    element: <UserProfile />,
    path: '/user',
  },
  {
    element: <UpdatePassword />,
    path: '/change-password',
  },
]);

export const App = () => {
  return (
    <MantineProvider>
      <RouterProvider router={router} />
      <Notifications />
    </MantineProvider>
  );
};
