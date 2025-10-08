import { StudySession } from '~/components'
import { useState } from 'react'
import { Box, Grid, Text } from '@mantine/core';
import { StudyTips } from '~/components/StudyTips';

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
    <Box mt={32} mx={64}>
      <Text size='xl' fw={700}>Study Session</Text>
      <Text size='md' fw={300} mb={32}>Focus and track your study time</Text>
      <Grid grow>
        <Grid.Col span='auto'>
          <StudySession
            startStudyTimestamp={startStudyTimestamp}
            endStudyTimestamp={endStudyTimestamp}
            onStartStudy={startStudySession}
            onStopStudy={stopStudySession}
          />
        </Grid.Col>
        <Grid.Col span='auto'>
          <StudyTips/>
        </Grid.Col>
      </Grid>
    </Box>
  )
}