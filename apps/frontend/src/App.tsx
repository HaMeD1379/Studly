import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {
  Badges,
  Forgot,
  Home,
  Login,
  SignUp,
  Study,
  UpdatePassword,
  UserProfile,
  loginAction,
  logoutAction,
  SignUpAction,
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
  { action: SignUpAction, element: <SignUp />, path: '/signup' },
  { element: <Study />, path: '/study' },
  { element: <UserProfile />, path: '/user-profile' },
]);

export const App = () => {
  return (
    <MantineProvider>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  );
};
