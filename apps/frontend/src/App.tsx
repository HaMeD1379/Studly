import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter, Routes, Route } from 'react-router';
import { Study, Home } from '~/routes'

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Navbar } from './components';

export const App = () => {
  // TODO: Change routing once login page and home page is implemented

  return (
    <MantineProvider>
      <BrowserRouter>
        <Navbar>
          <Notifications/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/study' element={<Study/>}/>
          </Routes>
        </Navbar>
      </BrowserRouter>
    </MantineProvider>
  )
};
