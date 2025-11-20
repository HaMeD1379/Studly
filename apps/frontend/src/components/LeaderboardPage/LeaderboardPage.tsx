import { type StudyTimeLeaderboardEntry, type BadgeLeaderboardEntry, LeaderboardPageType } from '~/types';
import { Flex, Text } from '@mantine/core';
import { IconCrown, IconMedal, IconMedal2 } from '@tabler/icons-react';
import { useMemo } from 'react';
import { userInfo } from '~/store';
import { LEADERBOARD_NO_DATA, LEADERBOARD_PAGE_BADGES_HEADER, LEADERBOARD_PAGE_BADGES_SUBHEADER, LEADERBOARD_PAGE_STUDY_HEADER, LEADERBOARD_PAGE_STUDY_SUBHEADER } from '~/constants';

type LeaderboardPageProps = {
  rows: StudyTimeLeaderboardEntry[] | BadgeLeaderboardEntry[],
  type: string,
};

export const LeaderboardPage = ({ rows, type }: LeaderboardPageProps) => {
  const { name } = userInfo.getState();

  const isSelf = useMemo(() => (rowName: string) => name === rowName, [name]);
  const [header, subheader] = useMemo(() => {
    if (type === LeaderboardPageType.StudyTime) {
      return [LEADERBOARD_PAGE_STUDY_HEADER, LEADERBOARD_PAGE_STUDY_SUBHEADER];
    } else {
      return [LEADERBOARD_PAGE_BADGES_HEADER, LEADERBOARD_PAGE_BADGES_SUBHEADER];
    }
  }, [type]);

  return (
    <Flex direction='column'>
      <Text fw={600}>
        {header}
      </Text>
      <Text size='sm'>
        {subheader}
      </Text>
      {rows?.map((row) => (
        <Flex bg={isSelf(row.displayName) ? 'gray' : 'white'} justify='space-between' bdrs={8} bd='1px solid light-gray' key={`leaderboard-row-${row.rank}`}>
          <Flex>
            {
              row.rank === 1 ? <IconCrown color='#F4C94E' size={20} /> :
              row.rank === 2 ? <IconMedal color='#D4D8DE' size={20} /> :
              row.rank === 3 ? <IconMedal2 color='#FCBEA4' size={20} /> :
              <Text>{row.rank}</Text>
            }
            <Flex direction='column'>
              <Text>{isSelf(row.displayName) ? 'You' : row.displayName}</Text>
              {
                type === LeaderboardPageType.StudyTime ?
                <Text>{(row as StudyTimeLeaderboardEntry).totalMinutes}</Text> :
                <Text>{(row as BadgeLeaderboardEntry).badgeCount}</Text>
              }
            </Flex>
          </Flex>
          <Text>#${row.rank}</Text>
        </Flex>
      )) ?? (
      <Text>
        {LEADERBOARD_NO_DATA}
      </Text>
    )}
    </Flex>
  )
};