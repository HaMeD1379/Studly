import { Flex, Text } from '@mantine/core';
import { IconClock, IconTarget } from '@tabler/icons-react';
import {
  TODAYS_STUDY_HEADER,
  TODAYS_STUDY_SESSIONS,
  TODAYS_STUDY_TIME,
} from '~/constants';
import type { TodaysStudyStatistics as TodaysStudyStatisticsProps } from '~/types';

export const TodaysStudyStatistics = ({
  totalMinutesStudied,
  sessionsLogged,
}: TodaysStudyStatisticsProps) => {
  const minutes = Math.floor(totalMinutesStudied % 60);
  const hours = Math.floor((totalMinutesStudied / 60) % 60);

  return (
    <Flex bd='1px solid lightgray' bdrs={8} direction='column' h={193} p={24}>
      <Text>{TODAYS_STUDY_HEADER}</Text>
      <Flex align='center' h='100%' justify='space-evenly'>
        <Flex align='center' direction='column'>
          <IconClock color='#5598FF' size={48} />
          <Text fw={900} size='lg'>
            {hours > 0 ? `${hours}h` : ''} {minutes}m
          </Text>
          <Text fw={300} size='xs'>
            {TODAYS_STUDY_TIME}
          </Text>
        </Flex>
        <Flex align='center' direction='column'>
          <IconTarget color='#00C951' size={48} />
          <Text fw={900} size='lg'>
            {sessionsLogged}
          </Text>
          <Text fw={300} size='xs'>
            {TODAYS_STUDY_SESSIONS}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
