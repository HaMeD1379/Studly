import { Flex, Progress, Text } from '@mantine/core';
import { IconMedal2, IconTarget, IconTimeline } from '@tabler/icons-react';
import {
  BADGES_COMPLETE,
  BADGES_PROGRESS,
  BADGES_TOTAL,
  BADGES_UNLOCKED,
  BADGES_UNLOCKED_SUFFIX,
} from '~/constants';

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
    <Flex direction='column' gap='lg'>
      <Flex gap='lg'>
        <Flex
          align='center'
          bd='1px solid lightgray'
          bdrs={8}
          direction='column'
          p={24}
          w='33.3%'
        >
          <IconMedal2 color='#F0B100' size={50} />
          <Text fw={800} size='xl'>
            {badgesUnlocked}
          </Text>
          <Text fw={300} size='sm'>
            {BADGES_UNLOCKED}
          </Text>
        </Flex>
        <Flex
          align='center'
          bd='1px solid lightgray'
          bdrs={8}
          direction='column'
          p={24}
          w='33.3%'
        >
          <IconTarget color='#2B7FFF' size={50} />
          <Text fw={800} size='xl'>
            {totalBadges}
          </Text>
          <Text fw={300} size='sm'>
            {BADGES_TOTAL}
          </Text>
        </Flex>
        <Flex
          align='center'
          bd='1px solid lightgray'
          bdrs={8}
          direction='column'
          p={24}
          w='33.3%'
        >
          <IconTimeline color='#00C951' size={50} />
          <Text fw={800} size='xl'>
            {badgesProgress}%
          </Text>
          <Text fw={300} size='sm'>
            {BADGES_COMPLETE}
          </Text>
        </Flex>
      </Flex>
      <Flex bd='1px solid lightgray' bdrs={8} direction='column' p={24}>
        <Text fw={700} size='xs'>
          {BADGES_PROGRESS}
        </Text>
        <Text fw={300} size='xs'>
          {badgesUnlocked} of {totalBadges} {BADGES_UNLOCKED_SUFFIX}
        </Text>
        <Progress color='blue' mt={16} value={badgesProgress} />
      </Flex>
    </Flex>
  );
};
