import { Container, Stack } from '@mantine/core';
import { Navbar, ProfileCard, ProfileStatistics, UserCard } from '~/components';
export const UserProfile = () => {
  return (
    <Navbar>
      <Container p='xl' size='md'>
        <Stack>
          <UserCard />

          <ProfileCard />

          <ProfileStatistics />
        </Stack>
      </Container>
    </Navbar>
  );
};
