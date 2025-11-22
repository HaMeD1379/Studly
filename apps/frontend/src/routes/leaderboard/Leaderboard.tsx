import { Button, Container, Flex, SegmentedControl, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useLoaderData } from 'react-router';
import { ErrorBoundary, LeaderboardPage } from '~/components';
import {
  LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT,
  LEADERBOARD_ROUTE_HEADER,
  LEADERBOARD_ROUTE_SUBHEADER,
} from '~/constants';
import {
  type BadgeLeaderboardEntry,
  LeaderboardPageType,
  type StudyTimeLeaderboardEntry,
} from '~/types';

export const Leaderboard = () => {
  const loaderData = useLoaderData();

  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [leaderboardPageType, setLeaderboardPageType] = useState<string>(
    LeaderboardPageType.StudyTime,
  );

  const rows = useMemo(():
    | BadgeLeaderboardEntry[]
    | StudyTimeLeaderboardEntry[] => {
    const data = loaderData?.data;

    if (!data) {
      return [];
    }

    if (leaderboardPageType === LeaderboardPageType.Badges) {
      return friendsOnly ? data.friends.badges : data.global.badges;
    }
    if (leaderboardPageType === LeaderboardPageType.StudyTime) {
      return friendsOnly ? data.friends.studyTime : data.global.studyTime;
    }
    return [];
  }, [loaderData, friendsOnly, leaderboardPageType]);

  return (
    <Container fluid p='xl'>
      {loaderData?.error ? (
        <ErrorBoundary />
      ) : (
        <>
          <Text fw={700} size='xl'>
            {LEADERBOARD_ROUTE_HEADER}
          </Text>
          <Text fw={300} mb={32} size='md'>
            {LEADERBOARD_ROUTE_SUBHEADER}
          </Text>
          <Flex direction='column' gap={12}>
            <Flex justify='space-between'>
              <SegmentedControl
                bdrs={8}
                data={[
                  { label: 'Study Time', value: LeaderboardPageType.StudyTime },
                  { label: 'Badges', value: LeaderboardPageType.Badges },
                ]}
                onChange={setLeaderboardPageType}
                value={leaderboardPageType}
                w='25%'
              />
              <Button
                bd='1px solid lightgray'
                bdrs={8}
                bg={friendsOnly ? 'blue' : 'white'}
                c={friendsOnly ? 'white' : 'gray'}
                onClick={() => setFriendsOnly(!friendsOnly)}
                w='15%'
              >
                <Flex>
                  <IconUsers />
                  <Text>{LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT}</Text>
                </Flex>
              </Button>
            </Flex>
            <LeaderboardPage rows={rows} type={leaderboardPageType} />
          </Flex>
        </>
      )}
    </Container>
  );
};
