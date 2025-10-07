import { Text, Flex } from '@mantine/core'

type StudySessionProps = {
  endStudyTimestampMillis?: number
}

export const StudySession = ({ endStudyTimestampMillis = 0 }: StudySessionProps) => {
  const timeLeft = endStudyTimestampMillis > 0 ? endStudyTimestampMillis - Date.now() : 0;

  return (
    <Flex direction='column' bd='1px solid lightgray' bdrs={4} m={16}>
      <Text size='sm' fw='semibold'>Current Session</Text>
      <Text size='sm'>Configure your study session</Text>
      <Text size='lg' fw='bold'>{timeLeft}</Text>
    </Flex>
  )
}