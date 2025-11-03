// Using fetchers and actions from: https://reactrouter.com/how-to/fetchers
import { Box, Flex, Grid, Text } from '@mantine/core';
import { useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';
import {
  ErrorBoundary,
  Navbar,
  RecentStudySessions,
  SetupStudySession,
  StudySession,
  StudyTips,
  TodaysStudyStatistics,
} from '~/components';

export const Study = () => {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const actionData = fetcher.data;

  const [startStudyTimestamp, setStartStudyTimestamp] = useState<number>(0);
  const [endStudyTimestamp, setEndStudyTimestamp] = useState<number>(0);
  const [subject, setSubject] = useState<string | null>('');
  const [sessionLength, setSessionLength] = useState<number>(0);

  const summaryData = loaderData.data?.summary;
  const sessionListData = loaderData.data?.sessionsList;

  const startStudySession = () => {
    const startTimestamp = Date.now();
    const endTimestamp = startTimestamp + sessionLength;
    setStartStudyTimestamp(startTimestamp);
    setEndStudyTimestamp(endTimestamp);

    fetcher.submit({
      endTime: endTimestamp,
      startTime: startTimestamp,
      subject,
      type: 'start',
    });
  };

  const stopStudySession = () => {
    setStartStudyTimestamp(0);
    setEndStudyTimestamp(0);

    fetcher.submit({ type: 'stop' });
  };

  return (
    <Navbar>
      {loaderData?.error || actionData?.error ? (
        <ErrorBoundary />
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
                  isSessionSetup={!!subject && !!sessionLength}
                  onStartStudy={startStudySession}
                  onStopStudy={stopStudySession}
                  startStudyTimestamp={startStudyTimestamp}
                />
                <SetupStudySession
                  onUpdateLength={setSessionLength}
                  onUpdateSubject={setSubject}
                />
              </Flex>
            </Grid.Col>
            <Grid.Col span='auto'>
              <Flex direction='column' gap='lg'>
                <TodaysStudyStatistics
                  sessionsLogged={summaryData?.sessionsLogged ?? 0}
                  totalMinutesStudied={summaryData?.totalMinutesStudied ?? 0}
                />
                <RecentStudySessions
                  recentStudySessions={sessionListData ?? []}
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
