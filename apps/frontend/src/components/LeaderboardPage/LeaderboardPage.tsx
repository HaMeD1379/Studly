import { type StudyTimeLeaderboardEntry, type BadgeLeaderboardEntry, LeaderboardPageType } from '~/types';
import { Flex, Text } from '@mantine/core';
import { IconCrown, IconMilitaryAward, IconMedal2 } from '@tabler/icons-react';
import { useMemo } from 'react';
import { userInfo } from '~/store';
import { LEADERBOARD_SINGLE_BADGES_TEXT, LEADERBOARD_MULTIPLE_BADGES_TEXT, LEADERBOARD_NO_DATA, LEADERBOARD_NO_NAME, LEADERBOARD_PAGE_BADGES_HEADER, LEADERBOARD_PAGE_BADGES_SUBHEADER, LEADERBOARD_PAGE_STUDY_HEADER, LEADERBOARD_PAGE_STUDY_SUBHEADER } from '~/constants';
import { formatMinutesToHoursAndMinutes } from '~/utilities/time';

type LeaderboardPageProps = {
  rows: StudyTimeLeaderboardEntry[] | BadgeLeaderboardEntry[],
  type: string,
};

export const LeaderboardPage = ({ rows, type }: LeaderboardPageProps) => {
  const { name } = userInfo.getState();

  const isSelf = (row: BadgeLeaderboardEntry | StudyTimeLeaderboardEntry) => row && name === row.displayName || row.displayName === 'You';
  const [header, subheader] = useMemo(() => {
    if (type === LeaderboardPageType.StudyTime) {
      return [LEADERBOARD_PAGE_STUDY_HEADER, LEADERBOARD_PAGE_STUDY_SUBHEADER];
    } else {
      return [LEADERBOARD_PAGE_BADGES_HEADER, LEADERBOARD_PAGE_BADGES_SUBHEADER];
    }
  }, [type]);

  const styleStatistic = (row: BadgeLeaderboardEntry | StudyTimeLeaderboardEntry): string => {
    if (type === LeaderboardPageType.StudyTime) {
      return formatMinutesToHoursAndMinutes((row as StudyTimeLeaderboardEntry).totalMinutes);
    }
    if (type === LeaderboardPageType.Badges) {
      const badgeCount = (row as BadgeLeaderboardEntry).badgeCount;

      return `${badgeCount} ${badgeCount > 1 ? LEADERBOARD_MULTIPLE_BADGES_TEXT : LEADERBOARD_SINGLE_BADGES_TEXT}`
    }
    return '';
  }

  return (
    <Flex direction='column'>
      <Text fw={600}>
        {header}
      </Text>
      <Text size='sm'>
        {subheader}
      </Text>
      <Flex direction='column' gap={12} pt={16}>
        {rows && rows.length > 0 && rows.map((row) => (
          <Flex align='center' bg={isSelf(row) ? '#EDEDED' : 'white'} justify='space-between' bdrs={8} bd='1px solid lightgray' p={16} key={`leaderboard-row-${row.rank}`}>
            <Flex align='center' gap={16}>
              {
                row.rank === 1 ? <IconCrown color='#F4C94E' size={30} /> :
                row.rank === 2 ? <IconMedal2 color='#D4D8DE' size={30} /> :
                row.rank === 3 ? <IconMilitaryAward color='#FCBEA4' size={30} /> :
                <Text size='sm' pl={10} pr={14}>{row.rank}</Text>
              }
              <Flex direction='column'>
                <Text size='sm'>{isSelf(row) ? 'You' : row.displayName ?? LEADERBOARD_NO_NAME}</Text>
                <Text size='sm'>{styleStatistic(row)}</Text>
              </Flex>
            </Flex>
            <Text>#{row.rank}</Text>
          </Flex>
        )) || (
        <Flex justify='center'>
          <Text pt={100}>
            {LEADERBOARD_NO_DATA}
          </Text>
        </Flex>
      )}
      </Flex>
    </Flex>
  )
};