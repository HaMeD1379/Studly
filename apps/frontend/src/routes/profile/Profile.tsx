import { Container, Stack } from '@mantine/core';
import { ProfileCard, ProfileStatistics, UserCard } from '~/components';

export const UserProfile = () => {
  return (
    <Container fluid p='xl'>
      <Stack>
        <UserCard />
        <ProfileCard />
        <ProfileStatistics />
      </Stack>
    </Container>
  );
};
