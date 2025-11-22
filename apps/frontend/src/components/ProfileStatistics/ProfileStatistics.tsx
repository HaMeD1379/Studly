import {
  Badge,
  Box,
  Card,
  Flex,
  Progress,
  ScrollArea,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { profileInfo, badgesStore } from "~/store";
import { hoursAndMinutes } from "~/utilities/time";
import {
  calculateHistoryStatistics,
  sortBadgesByEarnedDate,
  randomColour,
} from "~/utilities/profileStatistics";
import { tabs } from "~/constants/profile";
import { subjectSummaries, UnlockedBadge } from "~/types";

export const ProfileStatistics = () => {
  const { setAllTimeHoursStudied } = profileInfo();
  const { userBadges } = badgesStore();

  const [badges, setBadges] = useState<UnlockedBadge[]>([]);
  const loaderdata = useLoaderData();
  const summary = loaderdata.data.sessionSummary;
  const subjectsStudiedThisWeek: Set<subjectSummaries> = new Set(
    summary.subjectSummaries
  );
  console.log(subjectsStudiedThisWeek);
  const allTimeStats = useMemo(
    () => calculateHistoryStatistics(loaderdata.data.sessions),
    [loaderdata.data.sessions]
  );
  useEffect(() => {
    if (!loaderdata?.data?.sessions) return;

    const [, totalHours] = allTimeStats;
    setAllTimeHoursStudied(totalHours);
  }, [loaderdata, setAllTimeHoursStudied, allTimeStats]);

  useEffect(() => {
    if (!userBadges) return;
    setBadges(sortBadgesByEarnedDate(userBadges));
  }, [userBadges]);

  const mapped = Object.fromEntries(
    Object.entries(allTimeStats[0]).map(([key, value]) => [key, value])
  );
  return (
    <Box w="100%">
      {/* Tab Control */}
      <SegmentedControl
        data={tabs.map((t) => ({ label: t, value: t.toLowerCase() }))}
        fullWidth
        radius="xl"
        size="md"
      />

      {/* This Week & Badges */}
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        data-testid={"this-week-card"}
        mt="lg"
        spacing="lg"
      >
        {/* This Week */}
        <Card p="lg" radius="md" shadow="sm" withBorder>
          <Title order={5}>This Week</Title>
          <Text c="dimmed" fz="sm">
            Your study activity this week
          </Text>
          <Stack mt="md">
            <Text
              data-testid={"totalMinStudied"}
            >{`Study Time: ${hoursAndMinutes(
              summary.totalMinutesStudied
            )}`}</Text>
            <Text
              data-testid={"SessionCompleted"}
            >{`Sessions Completed: ${summary.sessionsLogged}`}</Text>
            <Text>{`Subjects Studied: ${subjectsStudiedThisWeek.size}`}</Text>
            <Text fw={500} mt="sm">
              Subjects This Week:
            </Text>
            <Stack>
              <SimpleGrid cols={2} spacing="md">
                {[...subjectsStudiedThisWeek].map((summary) => (
                  <Badge key={summary.subject} color={randomColour()}>
                    {summary.subject}
                  </Badge>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Card>

        {/* Recent Badges */}
        <Card
          data-testid={"recent-badges-card"}
          p="lg"
          radius="md"
          shadow="sm"
          withBorder
        >
          <Title order={5}>Recent Badges</Title>
          <Text c="dimmed" fz="sm">
            Your latest achievements
          </Text>
          <Stack mt="md">
            {badges.map((badge) => (
              <Badge key={badge.name} color={randomColour()} size="xl">
                {badge.name}
              </Badge>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Subject Distribution */}
      <Card
        data-testid={"subject-distribution-card"}
        mt="lg"
        p="lg"
        radius="md"
        shadow="sm"
        withBorder
      >
        <Title order={5}>Subject Distribution</Title>
        <Text c="dimmed" fz="sm">
          Time spent on different subjects
        </Text>
        <Stack mt="md">
          <ScrollArea h={300} px="sm">
            <Stack>
              {Object.entries(mapped).map(([key, value]) => (
                <div key={key}>
                  <Flex justify="space-between">
                    <Text fw={500}>{key}</Text>
                    <Text c="dimmed">{hoursAndMinutes(value)}</Text>
                  </Flex>
                  <Progress size="md" value={(value / 120) * 100} />
                </div>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Card>
    </Box>
  );
};
