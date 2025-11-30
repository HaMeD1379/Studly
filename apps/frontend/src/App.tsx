import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, Navbar, PageSpinner } from '~/components';
import {
  Badges,
  badgesLoader,
  Forgot,
  Friends,
  friendsAction,
  friendsLoader,
  Home,
  homeLoader,
  Leaderboard,
  Login,
  leaderboardLoader,
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
import {
  BADGES,
  CHANGE_PASSWORD,
  FORGOT_PASSWORD,
  FRIENDS,
  HOME,
  LEADERBOARD,
  LOGIN,
  LOGOUT,
  PROFILE,
  SETTINGS,
  SIGNUP,
  STUDY,
} from './constants';
import { NavbarProvider } from './context/navbarContext';

const router = createBrowserRouter([
  {
    children: [
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
      {
        action: profileChangeAction,
        element: <Settings />,
        errorElement: <ErrorBoundary />,
        hydrateFallbackElement: <PageSpinner />,
        path: SETTINGS,
      },
      {
        action: friendsAction,
        element: <Friends />,
        errorElement: <ErrorBoundary />,
        hydrateFallbackElement: <PageSpinner />,
        loader: friendsLoader,
        path: FRIENDS,
      },
      {
        element: <Home />,
        errorElement: <ErrorBoundary />,
        hydrateFallbackElement: <PageSpinner />,
        loader: homeLoader,
        path: HOME,
      },
      {
        element: <Leaderboard />,
        errorElement: <ErrorBoundary />,
        hydrateFallbackElement: <PageSpinner />,
        loader: leaderboardLoader,
        path: LEADERBOARD,
      },
    ],
    element: <Navbar />,
  },
  {
    action: loginAction,
    element: <Login />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    path: LOGIN,
  },
  {
    element: <UpdatePassword />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    path: CHANGE_PASSWORD,
  },
  {
    element: <Forgot />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    path: FORGOT_PASSWORD,
  },
  {
    action: logoutAction,
    element: <Login />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    path: LOGOUT,
  },
  {
    action: signUpAction,
    element: <SignUp />,
    errorElement: <ErrorBoundary />,
    hydrateFallbackElement: <PageSpinner />,
    path: SIGNUP,
  },
]);

export const App = () => {
  return (
    <MantineProvider>
      <NavbarProvider>
        <RouterProvider router={router} />
        <Notifications />
      </NavbarProvider>
    </MantineProvider>
  );
};
