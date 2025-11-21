import { Container } from '@mantine/core';
import { FriendsHeader, FriendsStatus } from '~/components';

export const Friends = () => {
  return (
    <Container fluid>
      <FriendsHeader />
      <FriendsStatus />
    </Container>
  );
};
