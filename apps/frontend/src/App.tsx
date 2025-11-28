import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary, Navbar, PageSpinner } from "~/components";
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
} from "~/routes";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
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
} from "./constants";

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
      { action: profileChangeAction, element: <Settings />, path: SETTINGS },
      {
        action: friendsAction,
        element: <Friends />,
        //errorElement: <ErrorBoundary />,
        hydrateFallbackElement: <PageSpinner />,
        path: FRIENDS,
        loader: friendsLoader,
      },
      {
        loader: homeLoader,
        element: <Home />,
        hydrateFallbackElement: <PageSpinner />,
        path: HOME,
      },
      {
        element: <Leaderboard />,
        errorElement: <ErrorBoundary />,
        loader: leaderboardLoader,
        path: LEADERBOARD,
      },
    ],
    element: <Navbar />,
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
