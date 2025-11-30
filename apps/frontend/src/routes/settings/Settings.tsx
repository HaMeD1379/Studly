import { Container, Text } from '@mantine/core';
import { AccountActions, ProfileInformationCard } from '~/components';
import { SETTINGS_DESCRIPTION, SETTINGS_HEADER } from '~/constants';

export const Settings = () => {
  return (
    <Container fluid p='xl'>
      <Text fw={700} size='xl'>
        {SETTINGS_HEADER}
      </Text>
      <Text fw={300}>{SETTINGS_DESCRIPTION}</Text>
      <ProfileInformationCard />
      <AccountActions />
    </Container>
  );
};
