// Using fetchers and actions from: https://reactrouter.com/how-to/fetchers
import { Box, Flex, Grid, Text } from '@mantine/core';
import { useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';
import {
  Navbar,
  RecentStudySessions,
  SetupStudySession,
  StudySession,
  StudyTips,
  TodaysStudyStatistics,
} from '~/components';
import {
  mockRecentStudySessions,
  mockTimesStudied,
  mockTotalTimeStudied,
} from '~/mocks';
import type { StudyRoute } from '~/types';

const TEMP_STUDY_TIMEFRAME = 1 * 10 * 1000; // 10 mins for now until user input is allowed

export const Study = () => {
  const loaderData: StudyRoute = useLoaderData();
  const fetcher = useFetcher();

  const [startStudyTimestamp, setStartStudyTimestamp] = useState<number>(0);
  const [endStudyTimestamp, setEndStudyTimestamp] = useState<number>(0);

  const startStudySession = () => {
    const studyTimestamp = Date.now();
    setStartStudyTimestamp(studyTimestamp);
    setEndStudyTimestamp(studyTimestamp + TEMP_STUDY_TIMEFRAME);

    fetcher.submit(
      {
        length: '1000',
        type: 'start',
      },
      {
        method: 'post',
      },
    );
  };

  const stopStudySession = () => {
    setStartStudyTimestamp(0);
    setEndStudyTimestamp(0);

    fetcher.submit(
      {
        type: 'stop',
      },
      {
        method: 'post',
      },
    );
  };

  return (
    <Navbar>
      {!loaderData.error ? (
        <Text>Error!</Text>
      ) : (
        <Box mx={48} w={1150}>
          <Text fw={700} size='xl'>
            Study Session
          </Text>
          <Text fw={300} mb={32} size='md'>
            Focus and track your study time
          </Text>
          <Grid grow gutter='lg'>
            <Grid.Col span='auto'>
              <Flex direction='column' gap='lg'>
                <StudySession
                  endStudyTimestamp={endStudyTimestamp}
                  onStartStudy={startStudySession}
                  onStopStudy={stopStudySession}
                  startStudyTimestamp={startStudyTimestamp}
                />
                <SetupStudySession
                  onUpdateLength={() => {}}
                  onUpdateSubject={() => {}}
                />
              </Flex>
            </Grid.Col>
            <Grid.Col span='auto'>
              <Flex direction='column' gap='lg'>
                <TodaysStudyStatistics
                  timesStudied={mockTimesStudied}
                  totalTimeStudied={mockTotalTimeStudied}
                />
                <RecentStudySessions
                  recentStudySessions={mockRecentStudySessions}
                />
                <StudyTips />
              </Flex>
            </Grid.Col>
          </Grid>
        </Box>
      )}
    </Navbar>
  );
};
