import { Container, Stack } from '@mantine/core';
import { Navbar, ProfileCard, ProfileStatistics, UserCard } from '~/components';

export const UserProfile = () => {
  return (
    <Navbar>
      <Container fluid p='xl'>
        <Stack>
          <UserCard />
          <ProfileCard />
          <ProfileStatistics />
        </Stack>
      </Container>
    </Navbar>
  );
};
