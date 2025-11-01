import { Flex, Text } from '@mantine/core';
import { IconClock, IconTarget } from '@tabler/icons-react';

type TodaysStudyStatisticsProps = {
  totalTimeStudied: number;
  timesStudied: number;
};

export const TodaysStudyStatistics = ({
  totalTimeStudied,
  timesStudied,
}: TodaysStudyStatisticsProps) => {
  const totalMinutes = totalTimeStudied / 1000 / 60;
  const minutes = Math.floor(totalMinutes % 60);
  const hours = Math.floor((totalMinutes / 60) % 60);

  return (
    <Flex bd="1px solid lightgray" bdrs={8} direction="column" h={193} p={24}>
      <Text>Today&apos;s Progress</Text>
      <Flex align="center" h="100%" justify="space-evenly">
        <Flex align="center" direction="column">
          <IconClock color="#5598FF" size={48} />
          <Text fw={900} size="lg">
            {hours > 0 ? `${hours}h` : ''} {minutes}m
          </Text>
          <Text fw={300} size="xs">
            Study Time
          </Text>
        </Flex>
        <Flex align="center" direction="column">
          <IconTarget color="#00C951" size={48} />
          <Text fw={900} size="lg">
            {timesStudied}
          </Text>
          <Text fw={300} size="xs">
            Sessions
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
