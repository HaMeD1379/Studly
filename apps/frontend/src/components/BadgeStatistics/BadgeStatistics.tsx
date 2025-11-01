import { Flex, Text, Progress } from '@mantine/core';
import { IconMedal2, IconTarget, IconTimeline } from '@tabler/icons-react';

type BadgeStatisticsProps = {
  badgesUnlocked: number;
  totalBadges: number;
};

export const BadgeStatistics = ({
  badgesUnlocked,
  totalBadges,
}: BadgeStatisticsProps) => {
  const badgesProgress = Math.round((badgesUnlocked / totalBadges) * 100);

  return (
    <Flex direction="column" gap="lg">
      <Flex gap="lg">
        <Flex
          align="center"
          w="33.3%"
          p={24}
          direction="column"
          bd="1px solid lightgray"
          bdrs={8}
        >
          <IconMedal2 color="#F0B100" size={50} />
          <Text fw={800} size="xl">
            {badgesUnlocked}
          </Text>
          <Text fw={300} size="sm">
            Unlocked
          </Text>
        </Flex>
        <Flex
          align="center"
          w="33.3%"
          p={24}
          direction="column"
          bd="1px solid lightgray"
          bdrs={8}
        >
          <IconTarget color="#2B7FFF" size={50} />
          <Text fw={800} size="xl">
            {totalBadges}
          </Text>
          <Text fw={300} size="sm">
            Total
          </Text>
        </Flex>
        <Flex
          align="center"
          w="33.3%"
          p={24}
          direction="column"
          bd="1px solid lightgray"
          bdrs={8}
        >
          <IconTimeline color="#00C951" size={50} />
          <Text fw={800} size="xl">
            {badgesProgress}%
          </Text>
          <Text fw={300} size="sm">
            Complete
          </Text>
        </Flex>
      </Flex>
      <Flex p={24} direction="column" bd="1px solid lightgray" bdrs={8}>
        <Text fw={700} size="xs">
          Collection Progress
        </Text>
        <Text fw={300} size="xs">
          {badgesUnlocked} of {totalBadges} badges unlocked
        </Text>
        <Progress color="gray" mt={16} value={badgesProgress} />
      </Flex>
    </Flex>
  );
};
