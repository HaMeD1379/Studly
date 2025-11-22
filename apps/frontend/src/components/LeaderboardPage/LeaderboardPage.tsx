import { Flex, Text } from '@mantine/core';
import { IconCrown, IconMedal2, IconMilitaryAward } from '@tabler/icons-react';
import { useMemo } from 'react';
import {
  LEADERBOARD_MULTIPLE_BADGES_TEXT,
  LEADERBOARD_NO_DATA,
  LEADERBOARD_NO_NAME,
  LEADERBOARD_PAGE_BADGES_HEADER,
  LEADERBOARD_PAGE_BADGES_SUBHEADER,
  LEADERBOARD_PAGE_STUDY_HEADER,
  LEADERBOARD_PAGE_STUDY_SUBHEADER,
  LEADERBOARD_SINGLE_BADGES_TEXT,
} from '~/constants';
import { userInfo } from '~/store';
import {
  type BadgeLeaderboardEntry,
  LeaderboardPageType,
  type StudyTimeLeaderboardEntry,
} from '~/types';
import { formatMinutesToHoursAndMinutes } from '~/utilities/time';

type LeaderboardPageProps = {
  rows: StudyTimeLeaderboardEntry[] | BadgeLeaderboardEntry[];
  type: string;
};

export const LeaderboardPage = ({ rows, type }: LeaderboardPageProps) => {
  const { name } = userInfo.getState();

  const isSelf = (row: BadgeLeaderboardEntry | StudyTimeLeaderboardEntry) =>
    (row && name === row.displayName) || row.displayName === 'You';
  const [header, subheader] = useMemo(() => {
    if (type === LeaderboardPageType.StudyTime) {
      return [LEADERBOARD_PAGE_STUDY_HEADER, LEADERBOARD_PAGE_STUDY_SUBHEADER];
    } else {
      return [
        LEADERBOARD_PAGE_BADGES_HEADER,
        LEADERBOARD_PAGE_BADGES_SUBHEADER,
      ];
    }
  }, [type]);

  const styleStatistic = (
    row: BadgeLeaderboardEntry | StudyTimeLeaderboardEntry,
  ): string => {
    if (type === LeaderboardPageType.StudyTime) {
      return formatMinutesToHoursAndMinutes(
        (row as StudyTimeLeaderboardEntry).totalMinutes,
      );
    }
    if (type === LeaderboardPageType.Badges) {
      const badgeCount = (row as BadgeLeaderboardEntry).badgeCount;

      return `${badgeCount} ${badgeCount > 1 ? LEADERBOARD_MULTIPLE_BADGES_TEXT : LEADERBOARD_SINGLE_BADGES_TEXT}`;
    }
    return '';
  };

  return (
    <Flex direction='column'>
      <Text fw={600}>{header}</Text>
      <Text size='sm'>{subheader}</Text>
      <Flex direction='column' gap={10} pt={14}>
        {(rows &&
          rows.length > 0 &&
          rows.map((row) => (
            <Flex
              align='center'
              bd='1px solid lightgray'
              bdrs={8}
              bg={isSelf(row) ? '#EDEDED' : 'white'}
              justify='space-between'
              key={`leaderboard-row-${row.rank}`}
              p={14}
            >
              <Flex align='center' gap={16}>
                {row.rank === 1 ? (
                  <IconCrown color='#F4C94E' size={30} />
                ) : row.rank === 2 ? (
                  <IconMedal2 color='#D4D8DE' size={30} />
                ) : row.rank === 3 ? (
                  <IconMilitaryAward color='#FCBEA4' size={30} />
                ) : (
                  <Text pl={10} pr={14} size='sm'>
                    {row.rank}
                  </Text>
                )}
                <Flex direction='column'>
                  <Text size='sm'>
                    {isSelf(row)
                      ? 'You'
                      : (row.displayName ?? LEADERBOARD_NO_NAME)}
                  </Text>
                  <Text size='sm'>{styleStatistic(row)}</Text>
                </Flex>
              </Flex>
              <Text>#{row.rank}</Text>
            </Flex>
          ))) || (
          <Flex justify='center'>
            <Text pt={100}>{LEADERBOARD_NO_DATA}</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
