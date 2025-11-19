import { Container } from '@mantine/core';
import {
  AccountActions,
  profileInformationCard as ProfileInformationCard,
  SettingsTabBar,
} from '~/components';

export const Settings = () => {
  return (
    <Container fluid p='xl'>
      <SettingsTabBar />
      <ProfileInformationCard />
      <AccountActions />
    </Container>
  );
};
