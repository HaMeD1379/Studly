import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter, Routes, Route } from 'react-router';
import { Study } from '~/routes'

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Navbar } from './components';

export const App = () => {
  // TODO: Change routing once login page and home page is implemented

  return (
    <MantineProvider>
      <Navbar>
        <Notifications/>
        <BrowserRouter>
          <Routes>
              <Route path='/' element={<Study/>}/>
              <Route path='/study' element={<Study/>}/>
          </Routes>
        </BrowserRouter>
      </Navbar>
    </MantineProvider>
  )
};
