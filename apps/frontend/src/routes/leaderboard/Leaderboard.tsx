import { Button, Container, Flex, SegmentedControl, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router';
import { ErrorBoundary, LeaderboardPage } from '~/components';
import { LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT, LEADERBOARD_ROUTE_HEADER, LEADERBOARD_ROUTE_SUBHEADER } from '~/constants';
import { BadgeLeaderboardEntry, LeaderboardPageType, StudyTimeLeaderboardEntry } from '~/types';

export const Leaderboard = () => {
  const loaderData = useLoaderData();

  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [leaderboardPageType, setLeaderboardPageType] = useState<string>(LeaderboardPageType.StudyTime);

  const rows = useMemo((): BadgeLeaderboardEntry[] | StudyTimeLeaderboardEntry[] => {
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
                w='25%'
                data={[
                  { label: 'Study Time', value: LeaderboardPageType.StudyTime },
                  { label: 'Badges', value: LeaderboardPageType.Badges },
                ]}
                value={leaderboardPageType}
                onChange={setLeaderboardPageType}
                bdrs={8}
              />
              <Button w='15%' c={friendsOnly ? 'white' :'gray'} bdrs={8} bd='1px solid lightgray' bg={friendsOnly ? 'blue' : 'white'} onClick={() => setFriendsOnly(!friendsOnly)}>
                <Flex>
                  <IconUsers/>
                  <Text>
                    {LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT}
                  </Text>
                </Flex>
              </Button>
            </Flex>
            <LeaderboardPage
              rows={rows}
              type={leaderboardPageType}
            />
          </Flex>
        </>
      )}
    </Container>
  )
};