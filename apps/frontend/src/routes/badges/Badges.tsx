import { Container, Text } from '@mantine/core';
import { useLoaderData } from 'react-router';
import { BadgeCollection, BadgeStatistics, ErrorBoundary } from '~/components';
import { BADGE_COLLECTION_HEADER, BADGE_EARN_BADGES_TEXT } from '~/constants';

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
            {BADGE_COLLECTION_HEADER}
          </Text>
          <Text fw={300} mb={32} size='md'>
            {BADGE_EARN_BADGES_TEXT}
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
