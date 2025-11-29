import { Container } from '@mantine/core';
import { useState } from 'react';
import { DisplayUnlockedBadges, HomeHeader } from '~/components';

export const Home = () => {
  const [viewMore, setViewMore] = useState(false);
  const action = () => {
    setViewMore(true);
  };
  return (
    <Container fluid>
      {viewMore ? <DisplayUnlockedBadges /> : <HomeHeader action={action} />}
    </Container>
  );
};
