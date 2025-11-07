import { Container } from '@mantine/core';
import {
  AccountActions,
  Navbar,
  profileInformationCard as ProfileInformationCard,
  SettingsTabBar,
} from '~/components';

export const Settings = () => {
  return (
    <Navbar>
      <Container fluid p='xl'>
        <SettingsTabBar />
        <ProfileInformationCard />
        <AccountActions />
      </Container>
    </Navbar>
  );
};
