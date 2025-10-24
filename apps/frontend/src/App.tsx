import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Study,
  Home,
  SignUp,
  Forgot,
  Login,
  Badges,
  UserProfile,
} from "~/routes";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

export const App = () => {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Notifications />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/study" element={<Study />} />
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/user" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};
