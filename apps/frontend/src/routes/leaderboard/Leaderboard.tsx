import { Container, Text } from '@mantine/core';
import { useLoaderData } from 'react-router';
import { ErrorBoundary } from '~/components';
import { LEADERBOARD_ROUTE_HEADER, LEADERBOARD_ROUTE_SUBHEADER } from '~/constants';

export const Leaderboard = () => {
  const loaderData = useLoaderData();

  return (
    <Container fluid p='xl'>
      {loaderData?.error ? (
        <ErrorBoundary />
      ) : (
        <>
          <Text fw={700} size='xl'>
            {LEADERBOARD_ROUTE_HEADER}
          </Text>
          <Text fw={300} mb={32} size='md'>
            {LEADERBOARD_ROUTE_SUBHEADER}
          </Text>
        </>
      )}
    </Container>
  )
};