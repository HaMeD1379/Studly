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
  { path: "/badges", element: <Badges /> },
  { path: "/change-password", element: <UpdatePassword /> },
  { path: "/forgot-password", element: <Forgot /> },
  { path: "/home", element: <Home /> },
  { path: "/logout", element: <Login />, action: logoutAction },
  { path: "/signup", element: <SignUp />, action: SignUpAction },
  { path: "/study", element: <Study /> },
  { path: "/user", element: <UserProfile /> },
]);

export const App = () => {
  return (
    <MantineProvider>
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  );
};
