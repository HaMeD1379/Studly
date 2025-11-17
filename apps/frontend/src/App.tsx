import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, PageSpinner } from '~/components';
import {
  Badges,
  Forgot,
  Home,
  Login,
  loginAction,
  logoutAction,
  ProfileLoader,
  profileChangeAction,
  Settings,
  SignUp,
  Study,
  signUpAction,
  studyAction,
  studyLoader,
  UpdatePassword,
  UserProfile,
} from '~/routes';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

const router = createBrowserRouter([
  { action: loginAction, element: <Login />, path: '/' },
  { element: <Badges />, path: '/badges' },
  { element: <UpdatePassword />, path: '/change-password' },
  { element: <Forgot />, path: '/forgot-password' },
  { element: <Home />, path: '/home' },
  { action: logoutAction, element: <Login />, path: '/logout' },
  { action: signUpAction, element: <SignUp />, path: '/signup' },
  { action: profileChangeAction, element: <Settings />, path: '/settings' },
  {
    action: studyAction,
    element: <Study />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    loader: studyLoader,
    path: '/study',
  },
  {
    element: <UserProfile />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    loader: ProfileLoader,
    path: '/user-profile',
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
