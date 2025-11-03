import {
  Badge,
  Box,
  Card,
  Flex,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export function ProfileStatistics() {
  const tabs = ["Overview", "Detailed Stats", "Achievements"];
  const subjects = [
    { label: "Biology", hours: 120 },
    { label: "Chemistry", hours: 95 },
    { label: "Mathematics", hours: 80 },
    { label: "Physics", hours: 65 },
  ];

  return (
    <Box w="100%">
      {/* Tab Control */}
      <SegmentedControl
        fullWidth
        radius="xl"
        size="md"
        data={tabs.map((t) => ({ label: t, value: t.toLowerCase() }))}
      />

      {/* This Week & Badges */}
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        mt="lg"
        spacing="lg"
        data-testid={"this-week-card"}
      >
        {/* This Week */}
        <Card p="lg" radius="md" shadow="sm" withBorder>
          <Title order={5}>This Week</Title>
          <Text c="dimmed" fz="sm">
            Your study activity this week
          </Text>
          <Stack mt="md">
            <Text>Study Time: 12h 0m</Text>
            <Text>Sessions Completed: 12</Text>
            <Text>Subjects Studied: 3</Text>
            <Text mt="sm" fw={500}>
              Subjects This Week:
            </Text>
            <Stack>
              <Badge color="blue">Biology</Badge>
              <Badge color="green">Chemistry</Badge>
              <Badge color="orange">Mathematics</Badge>
            </Stack>
          </Stack>
        </Card>

        {/* Recent Badges */}
        <Card
          p="lg"
          radius="md"
          shadow="sm"
          withBorder
          data-testid={"recent-badges-card"}
        >
          <Title order={5}>Recent Badges</Title>
          <Text c="dimmed" fz="sm">
            Your latest achievements
          </Text>
          <Stack mt="md">
            <Badge color="orange" size="lg" variant="light">
              Study Streak Master
            </Badge>
            <Badge color="blue" size="lg" variant="light">
              Night Owl
            </Badge>
            <Badge color="grape" size="lg" variant="light">
              Social Butterfly
            </Badge>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Subject Distribution */}
      <Card
        mt="lg"
        p="lg"
        radius="md"
        shadow="sm"
        withBorder
        data-testid={"subject-distribution-card"}
      >
        <Title order={5}>Subject Distribution</Title>
        <Text c="dimmed" fz="sm">
          Time spent on different subjects
        </Text>
        <Stack mt="md">
          {subjects.map((s) => (
            <div key={s.label}>
              <Flex justify="space-between">
                <Text fw={500}>{s.label}</Text>
                <Text c="dimmed">{s.hours}h</Text>
              </Flex>
              <Progress value={(s.hours / 120) * 100} size="md" />
            </div>
          ))}
        </Stack>
      </Card>
    </Box>
  );
}
