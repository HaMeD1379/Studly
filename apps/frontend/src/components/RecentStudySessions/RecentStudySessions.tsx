import { StudySessionType } from '~/types'
import { Flex, Text, Table } from '@mantine/core'
import { IconBook } from '@tabler/icons-react'

type RecentStudySessionsProps = {
  recentStudySessions: StudySessionType[]
}

export const RecentStudySessions = ({ recentStudySessions }: RecentStudySessionsProps) => {

  const formatTimestampToDate = (date: Date) => {
    // For padding - https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
  
    const year = date.getFullYear();
    const month = String(date.getMonth()).padStart(2, '0');
    const days = String(date.getDay()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}/${month}/${days} - ${hours % 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`
  }
  
  const formatStudySessionLength = (millis: number) => {
    const totalMinutes = millis / 1000 / 60;
  
    const minutes = Math.floor(totalMinutes % 60);
    const hours = Math.floor(totalMinutes / 60 % 60);
  
    const hourString = `${hours} hour${hours > 1 ? 's' : ''}`;
    const minuteString = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  
    return `${hours > 0 ? `${hourString} and` : ''} ${minuteString}`
  }

  return (
    <Flex p={24} direction='column' bd='1px solid lightgray' bdrs={8}>
      <Text pb={8}>Recent Sessions</Text>
      {(recentStudySessions && recentStudySessions.length > 0) ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Session Ended</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Length</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recentStudySessions.map(studySession => (
              <Table.Tr key={studySession.endStudyTimestamp}>
                <Table.Td>{formatTimestampToDate(new Date(studySession.endStudyTimestamp))}</Table.Td>
                <Table.Td>{studySession.subject}</Table.Td>
                <Table.Td>{formatStudySessionLength(studySession.sessionLength)}</Table.Td>
              </Table.Tr>
            ))}
            </Table.Tbody>
        </Table>
      ) : (
        <Flex h={200} justify='center' align='center' direction='column'>
          <IconBook color='lightGray' size={72} />
          <Text size='lg' c='gray' pt={16}>No sessions completed yet.</Text>
          <Text size='lg' c='gray'>Start your first session!</Text>
        </Flex>
      )}
    </Flex>
  )
}