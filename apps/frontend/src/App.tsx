import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  Badges,
  Forgot,
  Home,
  Login,
  SignUp,
  Study,
  UpdatePassword,
  UserProfile,
} from '~/routes';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

export const App = () => {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Notifications />
        <Routes>
          <Route element={<Home />} path="/home" />
          <Route element={<Study />} path="/study" />
          <Route element={<Login />} path="/" />
          <Route element={<SignUp />} path="/signup" />
          <Route element={<Forgot />} path="/forgot-password" />
          <Route element={<Badges />} path="/badges" />
          <Route element={<UserProfile />} path="/user" />
          <Route element={<UpdatePassword />} path="/change-password" />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};
