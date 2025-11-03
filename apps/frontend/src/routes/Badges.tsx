import { Box, Text } from '@mantine/core';
import { BadgeCollection, BadgeStatistics, Navbar } from '~/components';
import { mockAllBadges, mockAllUnlockedBadges } from '~/mocks';

export const Badges = () => {
  return (
    <Navbar>
      <Box mx={48} w={1150}>
        <Text fw={700} size='xl'>
          Badge Collection
        </Text>
        <Text fw={300} mb={32} size='md'>
          Earn badges by completing and hitting milestones
        </Text>
        <BadgeStatistics badgesUnlocked={2} totalBadges={3} />
        <BadgeCollection
          allBadges={mockAllBadges}
          unlockedBadges={mockAllUnlockedBadges}
        />
      </Box>
    </Navbar>
  );
};
