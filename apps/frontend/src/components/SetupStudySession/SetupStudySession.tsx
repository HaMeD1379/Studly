import { Box, Button, Flex, Group, Select, Text } from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import { useEffect, useState } from 'react';
import {
  SETUP_STUDY_SESSION_OPTIONS,
  STUDY_HEADER,
  STUDY_QUICK_1_HOUR,
  STUDY_QUICK_15_MINS,
  STUDY_QUICK_30_MINS,
  STUDY_QUICK_45_MINS,
  STUDY_QUICK_SESSION_HEADER,
} from '~/constants';

type SetupStudySessionProps = {
  onUpdateSubject: (subject: string | null) => void;
  onUpdateLength: (millis: number) => void;
};

export const SetupStudySession = ({
  onUpdateSubject,
  onUpdateLength,
}: SetupStudySessionProps) => {
  const [subject, setSubject] = useState<string | null>('');
  const [sessionLengthMins, setSessionLengthMins] = useState<number>(0);
  const [customTime, setCustomTime] = useState<string>('');

  useEffect(() => {
    onUpdateLength(sessionLengthMins * 60 * 1000);
  }, [onUpdateLength, sessionLengthMins]);

  useEffect(() => {
    onUpdateSubject(subject);
  }, [onUpdateSubject, subject]);

  const updateCustomTime = (time: string) => {
    const timeSplit = time.split(':');

    const parsedSessionLengthHours = Number(timeSplit[0]);
    const parsedSessionLengthMinutes = Number(timeSplit[1]);

    if (
      typeof parsedSessionLengthHours === 'number' &&
      typeof parsedSessionLengthMinutes === 'number'
    ) {
      setSessionLengthMins(
        parsedSessionLengthHours * 60 + parsedSessionLengthMinutes,
      );
      setCustomTime(time);
    }
  };

  const updateQuickSession = (time: number) => {
    setCustomTime('');
    setSessionLengthMins(time);
  };

  return (
    <Flex bd='1px solid lightgray' bdrs={8} direction='column' gap='lg' p={24}>
      <Text>{STUDY_HEADER}</Text>
      <Select
        clearable
        data={SETUP_STUDY_SESSION_OPTIONS}
        label='Subject'
        onChange={setSubject}
        placeholder='Select a subject'
        searchable
        value={subject}
      />
      <Box>
        <Text fw={500} size='sm'>
          {STUDY_QUICK_SESSION_HEADER}
        </Text>
        <Flex direction='column' gap='sm'>
          <Group grow>
            <Button
              onClick={() => updateQuickSession(15)}
              radius='md'
              variant={
                !customTime && sessionLengthMins === 15 ? 'filled' : 'outline'
              }
            >
              {STUDY_QUICK_15_MINS}
            </Button>
            <Button
              onClick={() => updateQuickSession(30)}
              radius='md'
              variant={
                !customTime && sessionLengthMins === 30 ? 'filled' : 'outline'
              }
            >
              {STUDY_QUICK_30_MINS}
            </Button>
          </Group>
          <Group grow>
            <Button
              onClick={() => updateQuickSession(45)}
              radius='md'
              variant={
                !customTime && sessionLengthMins === 45 ? 'filled' : 'outline'
              }
            >
              {STUDY_QUICK_45_MINS}
            </Button>
            <Button
              onClick={() => updateQuickSession(60)}
              radius='md'
              variant={
                !customTime && sessionLengthMins === 60 ? 'filled' : 'outline'
              }
            >
              {STUDY_QUICK_1_HOUR}
            </Button>
          </Group>
          <TimePicker
            clearable
            description='Custom time is in format hh:mm'
            inputContainer={(children) => (
              <Flex
                bd='1px solid blue'
                bdrs={8}
                bg={customTime ? 'blue' : 'white'}
                justify='center'
                pb={4}
              >
                {children}
              </Flex>
            )}
            label='Custom Session Length'
            minutesStep={5}
            onChange={updateCustomTime}
            radius='md'
            styles={{
              field: {
                color: customTime ? 'white' : 'black',
              },
              input: {
                color: customTime ? 'white' : 'black',
              },
            }}
            value={customTime}
            variant='unstyled'
            withDropdown
          />
        </Flex>
      </Box>
    </Flex>
  );
};
