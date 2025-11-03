import { Flex, Table, Text } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import type { StudySession } from '~/types';

type RecentStudySessionsProps = {
  recentStudySessions: StudySession[];
};

export const RecentStudySessions = ({
  recentStudySessions,
}: RecentStudySessionsProps) => {
  const formatTimestampToDate = (date: Date) => {
    // For padding - https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const days = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${days} - ${hours % 11}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
  };

  const formatStudySessionLength = (minutesTotal: number) => {
    const minutes = Math.floor(minutesTotal % 60);
    const hours = Math.floor((minutesTotal / 60) % 60);

    const hourString = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : '';
    const minuteString = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : '';

    return `${hourString}${hours > 0 && minutes > 0 ? ' and ' : ''}${minuteString}`;
  };

  return (
    <Flex bd='1px solid lightgray' bdrs={8} direction='column' p={24}>
      <Text pb={8}>Recent Sessions</Text>
      {recentStudySessions && recentStudySessions.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Session Ended</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Length</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recentStudySessions.map((studySession) => (
              <Table.Tr key={studySession.endTime}>
                <Table.Td>
                  {formatTimestampToDate(
                    new Date(studySession.endTime),
                  )}
                </Table.Td>
                <Table.Td>{studySession.subject}</Table.Td>
                <Table.Td>
                  {formatStudySessionLength(studySession.totalMinutes)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Flex align='center' direction='column' h={144} justify='center'>
          <IconBook color='lightGray' size={64} />
          <Text c='gray' pt={16} size='lg'>
            No sessions completed yet.
          </Text>
          <Text c='gray' size='lg'>
            Start your first session!
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
