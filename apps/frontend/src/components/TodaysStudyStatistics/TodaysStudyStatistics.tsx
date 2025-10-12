import { Flex, Text } from '@mantine/core';
import { IconClock, IconTarget } from '@tabler/icons-react';

type TodaysStudyStatisticsProps = {
  totalTimeStudied: number,
  timesStudied: number
}

export const TodaysStudyStatistics = ({ totalTimeStudied, timesStudied }: TodaysStudyStatisticsProps) => {
  const totalMinutes = totalTimeStudied / 1000 / 60;
  const minutes = Math.floor(totalMinutes % 60);
  const hours = Math.floor(totalMinutes / 60 % 60);

  return (
    <Flex p={24} direction='column' bdrs={8} bd='1px solid lightgray' h={193}>
      <Text>Today's Progress</Text>
      <Flex h='100%' align='center' justify='space-evenly'>
        <Flex align='center' direction='column'>
          <IconClock size={48} color='#5598FF' />
          <Text fw={900} size='lg'>{hours > 0 ? `${hours}h` : ''} {minutes}m</Text>
          <Text fw={300} size='xs' >Study Time</Text>
        </Flex>
        <Flex align='center' direction='column'>
          <IconTarget size={48} color='#00C951' />
          <Text fw={900} size='lg'>{timesStudied}</Text>
          <Text fw={300} size='xs'>Sessions</Text>
        </Flex>
      </Flex>
    </Flex>
  )
};