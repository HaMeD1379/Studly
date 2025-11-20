import { Button, Container, Flex, SegmentedControl, Text } from '@mantine/core';
import { IconFriends } from '@tabler/icons-react';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { ErrorBoundary, LeaderboardPage } from '~/components';
import { LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT, LEADERBOARD_ROUTE_HEADER, LEADERBOARD_ROUTE_SUBHEADER } from '~/constants';
import { LeaderboardPageType } from '~/types';

export const Leaderboard = () => {
  const loaderData = useLoaderData();

  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [leaderboardPageType, setLeaderboardPageType] = useState<string>(LeaderboardPageType.StudyTime);

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
            <Button w='20%' c='gray' bg={friendsOnly ? 'blue' : 'white'} onClick={() => setFriendsOnly(!friendsOnly)}>
              <Flex>
                <IconFriends/>
                <Text>
                  {LEADERBOARD_PAGE_FRIENDS_BUTTON_TEXT}
                </Text>
              </Flex>
            </Button>
            <SegmentedControl
              data={[
                { label: 'Study Time', value: LeaderboardPageType.StudyTime },
                { label: 'Badges', value: LeaderboardPageType.Badges },
              ]}
              value={leaderboardPageType}
              onChange={setLeaderboardPageType}
            />
            <LeaderboardPage
              rows={loaderData?.data.rows}
              type={leaderboardPageType}
            />
          </Flex>
        </>
      )}
    </Container>
  )
};