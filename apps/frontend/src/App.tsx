import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import {
  Badges,
  Forgot,
  Home,
  Login,
  SignUp,
  Study,
  UserProfile,
  UpdatePassword,
} from "~/routes";

import { loginAction, SignUpAction, logoutAction } from "~/actions";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

const router = createBrowserRouter([
  { path: "/", element: <Login />, action: loginAction },
  { path: "/home", element: <Home /> },
  { path: "/study", element: <Study /> },
  { path: "/signup", element: <SignUp />, action: SignUpAction },
  { path: "/forgot-password", element: <Forgot /> },
  { path: "/badges", element: <Badges /> },
  { path: "/user", element: <UserProfile /> },
  { path: "/change-password", element: <UpdatePassword /> },
  { path: "/logout", element: <Login />, action: logoutAction },
]);

export const App = () => {
  return (
    <MantineProvider>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  );
};
