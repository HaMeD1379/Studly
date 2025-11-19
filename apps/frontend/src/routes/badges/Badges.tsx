import { Container, Text } from '@mantine/core';
import { useLoaderData } from 'react-router';
import {
  BadgeCollection,
  BadgeStatistics,
  ErrorBoundary,
} from '~/components';

export const Badges = () => {
  const loaderData = useLoaderData();
  const { unlockedBadges, allBadges } = loaderData.data;

  return (
    <Container fluid p='xl'>
      {loaderData?.error ? (
        <ErrorBoundary />
      ) : (
        <>
          <Text fw={700} size='xl'>
            Badge Collection
          </Text>
          <Text fw={300} mb={32} size='md'>
            Earn badges by completing and hitting milestones
          </Text>
          <BadgeStatistics
            badgesUnlocked={unlockedBadges.length}
            totalBadges={allBadges.length}
          />
          <BadgeCollection
            allBadges={allBadges}
            unlockedBadges={unlockedBadges}
          />
        </>
      )}
    </Container>
  );
};
