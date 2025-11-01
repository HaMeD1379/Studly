import { Navbar, BadgeCollection, BadgeStatistics } from '~/components';
import { allBadgesMock, allUnlockedBadgesMock } from '~/mocks';
import { Box, Text } from '@mantine/core';

export const Badges = () => {
  return (
    <Navbar>
      <Box mx={48} w={1150}>
        <Text size="xl" fw={700}>
          Badge Collection
        </Text>
        <Text size="md" fw={300} mb={32}>
          Earn badges by completing and hitting milestones
        </Text>
        <BadgeStatistics badgesUnlocked={2} totalBadges={3} />
        <BadgeCollection
          allBadges={allBadgesMock}
          unlockedBadges={allUnlockedBadgesMock}
        />
      </Box>
    </Navbar>
  );
};
