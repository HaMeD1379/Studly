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
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { profileInfo } from '~/store/profileInfo';
import { hoursAndMinutes } from '~/utilities/date';
import { calculateHistoryStatistics } from '~/utilities/profileStatistics/calculateHistoryStatistics';
export const ProfileStatistics = () => {
  const tabs = ['Overview', 'Detailed Stats', 'Achievements'];
  const { setAllTimeHoursStudied } = profileInfo();
  const loaderdata = useLoaderData();
  const summary = loaderdata.data.sessionSummary;
  const allTimeStats = useMemo(
    () => calculateHistoryStatistics(loaderdata.data.sessions),
    [loaderdata.data.sessions],
  );
  useEffect(() => {
    if (!loaderdata?.data?.sessions) return;

    const [, totalHours] = allTimeStats;
    setAllTimeHoursStudied(totalHours);
  }, [loaderdata, setAllTimeHoursStudied, allTimeStats]);

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
          <Title order={5}>This Week</Title>
          <Text c='dimmed' fz='sm'>
            Your study activity this week
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
            <Text>Subjects Studied: 3</Text>
            <Text fw={500} mt='sm'>
              Subjects This Week:
            </Text>
            <Stack>
              <Badge color='blue'>Biology</Badge>
              <Badge color='green'>Chemistry</Badge>
              <Badge color='orange'>Mathematics</Badge>
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
          <Title order={5}>Recent Badges</Title>
          <Text c='dimmed' fz='sm'>
            Your latest achievements
          </Text>
          <Stack mt='md'>
            <Badge color='orange' size='lg' variant='light'>
              Study Streak Master
            </Badge>
            <Badge color='blue' size='lg' variant='light'>
              Night Owl
            </Badge>
            <Badge color='grape' size='lg' variant='light'>
              Social Butterfly
            </Badge>
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
        <Title order={5}>Subject Distribution</Title>
        <Text c='dimmed' fz='sm'>
          Time spent on different subjects
        </Text>
        <Stack mt='md'>
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
      </Card>
    </Box>
  );
};
