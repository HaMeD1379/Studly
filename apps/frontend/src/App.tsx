import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, PageSpinner, Navbar } from '~/components';
import {
  Badges,
  badgesLoader,
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
import { BADGES, CHANGE_PASSWORD, FORGOT_PASSWORD, HOME, LOGIN, LOGOUT, PROFILE, SETTINGS, SIGNUP, STUDY } from './constants';

const router = createBrowserRouter([
  { element: <Navbar />, children: [
    {
      element: <Badges />,
      errorElement: <ErrorBoundary />,
      hydrateFallbackElement: <PageSpinner />,
      loader: badgesLoader,
      path: BADGES,
    },
    {
      action: studyAction,
      element: <Study />,
      errorElement: <ErrorBoundary />,
      hydrateFallbackElement: <PageSpinner />,
      loader: studyLoader,
      path: STUDY,
    },
    {
      element: <UserProfile />,
      errorElement: <ErrorBoundary />,
      hydrateFallbackElement: <PageSpinner />,
      loader: ProfileLoader,
      path: PROFILE,
    },
    { element: <Home />, path: HOME },
    { action: profileChangeAction, element: <Settings />, path: SETTINGS },
  ],
  },
  { action: loginAction, element: <Login />, path: LOGIN },
  { element: <UpdatePassword />, path: CHANGE_PASSWORD },
  { element: <Forgot />, path: FORGOT_PASSWORD },
  { action: logoutAction, element: <Login />, path: LOGOUT },
  { action: signUpAction, element: <SignUp />, path: SIGNUP },
]);

export const App = () => {
  return (
    <MantineProvider>
      <RouterProvider router={router} />
      <Notifications />
    </MantineProvider>
  );
};
