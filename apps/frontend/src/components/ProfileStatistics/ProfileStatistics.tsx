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
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  PROFILE_LATEST_ACHIEVEMENT_TEXT,
  PROFILE_RECENT_BADGES,
  PROFILE_SUBJECT_DISTRIBUTION_TEXT,
  PROFILE_SUBJECTS_THIS_WEEK_TEXT,
  PROFILE_THIS_WEEK_HEADER,
  PROFILE_THIS_WEEKS_STATS_HEADER,
  PROFILE_TIME_SPENT_ON_DIFFERENT_SUBJECTS_TEXT,
} from '~/constants';
import { tabs } from '~/constants/profile';
import { profileInfo } from '~/store';
import type { subjectSummaries, UnlockedBadge } from '~/types';
import {
  calculateHistoryStatistics,
  randomColour,
  sortBadgesByEarnedDate,
} from '~/utilities/profileStatistics';
import { hoursAndMinutes } from '~/utilities/time';

export const ProfileStatistics = () => {
  const { setAllTimeHoursStudied } = profileInfo();

  const [badges, setBadges] = useState<UnlockedBadge[]>([]);
  const loaderdata = useLoaderData();
  const summary = loaderdata.data.sessionSummary;
  const unlockedBadges = loaderdata.data.badges.unlockedBadges;

  const subjectsStudiedThisWeek: Set<subjectSummaries> = new Set(
    summary.subjectSummaries,
  );
  const allTimeStats = useMemo(
    () => calculateHistoryStatistics(loaderdata.data.sessions),
    [loaderdata.data.sessions],
  );
  useEffect(() => {
    if (!loaderdata?.data?.sessions) return;

    const [, totalHours] = allTimeStats;
    setAllTimeHoursStudied(totalHours);
  }, [loaderdata, setAllTimeHoursStudied, allTimeStats]);

  useEffect(() => {
    if (!unlockedBadges) return;
    setBadges(sortBadgesByEarnedDate(unlockedBadges));
  }, [unlockedBadges]);

  const mapped = Object.fromEntries(
    Object.entries(allTimeStats[0]).map(([key, value]) => [key, value]),
  );
  return (
    <Box w='100%'>
      {/* Tab Control */}
      <SegmentedControl
        data={tabs.map((t) => ({ label: t, value: t.toLowerCase() }))}
        fullWidth
        radius='xl'
        size='md'
      />

      {/* This Week & Badges */}
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        data-testid={'this-week-card'}
        mt='lg'
        spacing='lg'
      >
        {/* This Week */}
        <Card p='lg' radius='md' shadow='sm' withBorder>
          <Title order={5}>{PROFILE_THIS_WEEK_HEADER}</Title>
          <Text c='dimmed' fz='sm'>
            {PROFILE_THIS_WEEKS_STATS_HEADER}
          </Text>
          <Stack mt='md'>
            <Text
              data-testid={'totalMinStudied'}
            >{`Study Time: ${hoursAndMinutes(
              summary.totalMinutesStudied,
            )}`}</Text>
            <Text
              data-testid={'SessionCompleted'}
            >{`Sessions Completed: ${summary.sessionsLogged}`}</Text>
            <Text>{`Subjects Studied: ${subjectsStudiedThisWeek.size}`}</Text>
            <Text fw={500} mt='sm'>
              {PROFILE_SUBJECTS_THIS_WEEK_TEXT}
            </Text>
            <Stack>
              <SimpleGrid cols={2} spacing='md'>
                {[...subjectsStudiedThisWeek].map((summary) => (
                  <Badge color={randomColour()} key={summary.subject}>
                    {summary.subject}
                  </Badge>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Card>

        {/* Recent Badges */}
        <Card
          data-testid={'recent-badges-card'}
          p='lg'
          radius='md'
          shadow='sm'
          withBorder
        >
          <Title order={5}>{PROFILE_RECENT_BADGES}</Title>
          <Text c='dimmed' fz='sm'>
            {PROFILE_LATEST_ACHIEVEMENT_TEXT}
          </Text>
          <Stack mt='md'>
            {badges.map((badge) => (
              <Badge color={randomColour()} key={badge.name} size='lg'>
                {badge.name}
              </Badge>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Subject Distribution */}
      <Card
        data-testid={'subject-distribution-card'}
        mt='lg'
        p='lg'
        radius='md'
        shadow='sm'
        withBorder
      >
        <Title order={5}>{PROFILE_SUBJECT_DISTRIBUTION_TEXT}</Title>
        <Text c='dimmed' fz='sm'>
          {PROFILE_TIME_SPENT_ON_DIFFERENT_SUBJECTS_TEXT}
        </Text>
        <Stack mt='md'>
          <ScrollArea h={300} px='sm'>
            <Stack>
              {Object.entries(mapped).map(([key, value]) => (
                <div key={key}>
                  <Flex justify='space-between'>
                    <Text fw={500}>{key}</Text>
                    <Text c='dimmed'>{hoursAndMinutes(value)}</Text>
                  </Flex>
                  <Progress size='md' value={(value / 120) * 100} />
                </div>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Card>
    </Box>
  );
};
