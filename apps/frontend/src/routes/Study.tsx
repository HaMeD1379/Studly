import { StudySession, SetupStudySession, RecentStudySessions } from '~/components'
import { useState } from 'react'
import { Box, Grid, Text, Flex } from '@mantine/core';
import { StudyTips } from '~/components/StudyTips';
import { mockRecentStudySessions } from '~/mocks';

const TEMP_STUDY_TIMEFRAME = 1 * 10 * 1000 // 10 mins for now until user input is allowed

export const Study = () => {
  const [startStudyTimestamp, setStartStudyTimestamp] = useState<number>(0);
  const [endStudyTimestamp, setEndStudyTimestamp] = useState<number>(0);
  
  const startStudySession = () => {
    const studyTimestamp = Date.now();
    setStartStudyTimestamp(studyTimestamp);
    setEndStudyTimestamp(studyTimestamp + TEMP_STUDY_TIMEFRAME);
  }
  
  const stopStudySession = () => {
    setStartStudyTimestamp(0);
    setEndStudyTimestamp(0);
    // TODO: upload results to supabase and trigger badge
  }
  
  return (
    <Box mx={48}>
      <Text size='xl' fw={700}>Study Session</Text>
      <Text size='md' fw={300} mb={32}>Focus and track your study time</Text>
      <Grid grow gutter='lg'>
        <Grid.Col span='auto'>
          <Flex direction='column' gap='lg'>
            <StudySession
              startStudyTimestamp={startStudyTimestamp}
              endStudyTimestamp={endStudyTimestamp}
              onStartStudy={startStudySession}
              onStopStudy={stopStudySession}
            />
            <SetupStudySession
              onUpdateSubject={() => {}}
              onUpdateLength={() => {}}
            />
          </Flex>
        </Grid.Col>
        <Grid.Col span='auto'>
          <Flex direction='column' gap='lg'>
            <RecentStudySessions recentStudySessions={mockRecentStudySessions} />
            <StudyTips/>
          </Flex>
        </Grid.Col>
      </Grid>
    </Box>
  )
}