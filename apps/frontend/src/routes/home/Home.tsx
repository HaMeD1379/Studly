import { Container } from '@mantine/core';
import { useState } from 'react';
import { InProgressBadges, HomeHeader } from '~/components';

export const Home = () => {
  const [viewMore, setViewMore] = useState(false);
  const action = () => {
    setViewMore(true);
  };
  return (
    <Container fluid>
      {viewMore ? <InProgressBadges /> : <HomeHeader action={action} />}
    </Container>
  );
};
