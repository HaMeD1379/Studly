import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, Study, SignUp, Forgot } from "~/routes";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export const App = () => {
  // TODO: Change routing once login page and home page is implemented
  return (
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/study" element={<Study />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};
