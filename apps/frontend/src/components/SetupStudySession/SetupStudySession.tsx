import { useEffect, useState } from "react";
import { Box, Button, Flex, Group, Select, Text } from "@mantine/core";
import { TimePicker } from "@mantine/dates";
import { setupStudySessionOptions } from "~/constants";

type SetupStudySessionProps = {
  onUpdateSubject: (_value: string | null) => void;
  onUpdateLength: (_value: number) => void;
};

export const SetupStudySession = ({
  onUpdateSubject,
  onUpdateLength,
}: SetupStudySessionProps) => {
  const [subject, setSubject] = useState<string | null>("");
  const [sessionLengthMins, setSessionLengthMins] = useState<number>(0);
  const [customTime, setCustomTime] = useState<string>("");

  useEffect(() => {
    onUpdateLength(sessionLengthMins * 60 * 1000);
  }, [onUpdateLength, sessionLengthMins]);

  useEffect(() => {
    onUpdateSubject(subject);
  }, [onUpdateSubject, subject]);

  const updateCustomTime = (time: string) => {
    const timeSplit = time.split(":");

    const parsedSessionLengthHours = Number(timeSplit[0]);
    const parsedSessionLengthMinutes = Number(timeSplit[1]);

    if (
      Number.isFinite(parsedSessionLengthHours) &&
      Number.isFinite(parsedSessionLengthMinutes)
    ) {
      setSessionLengthMins(
        parsedSessionLengthHours * 60 + parsedSessionLengthMinutes
      );
      setCustomTime(time);
    }
  };

  const updateQuickSession = (time: number) => {
    setCustomTime("");
    setSessionLengthMins(time);
  };

  return (
    <Flex p={24} direction="column" bd="1px solid lightgray" bdrs={8} gap="lg">
      <Text>Session Setup</Text>
      <Select
        label="Subject"
        placeholder="Select a subject"
        data={setupStudySessionOptions}
        value={subject}
        onChange={setSubject}
        searchable
        clearable
      />
      <Box>
        <Text size="sm" fw={500}>
          Quick Session Length
        </Text>
        <Flex direction="column" gap="sm">
          <Group grow>
            <Button
              radius="md"
              variant={!customTime && sessionLengthMins === 15 ? "filled" : "outline"}
              onClick={() => updateQuickSession(15)}
            >
              15 minutes
            </Button>
            <Button
              radius="md"
              variant={!customTime && sessionLengthMins === 30 ? "filled" : "outline"}
              onClick={() => updateQuickSession(30)}
            >
              30 minutes
            </Button>
          </Group>
          <Group grow>
            <Button
              radius="md"
              variant={!customTime && sessionLengthMins === 45 ? "filled" : "outline"}
              onClick={() => updateQuickSession(45)}
            >
              45 minutes
            </Button>
            <Button
              radius="md"
              variant={!customTime && sessionLengthMins === 60 ? "filled" : "outline"}
              onClick={() => updateQuickSession(60)}
            >
              1 hour
            </Button>
          </Group>
          <TimePicker
            label="Custom Session Length"
            description="Custom time is in format hh:mm"
            clearable
            variant="unstyled"
            radius="md"
            withDropdown
            minutesStep={5}
            value={customTime}
            onChange={updateCustomTime}
            styles={{
              field: {
                color: customTime ? "white" : "black",
              },
              input: {
                color: customTime ? "white" : "black",
              },
            }}
            inputContainer={(children) => (
              <Flex
                pb={4}
                bg={customTime ? "blue" : "white"}
                justify="center"
                bd="1px solid blue"
                bdrs={8}
              >
                {children}
              </Flex>
            )}
          />
        </Flex>
      </Box>
    </Flex>
  );
};
