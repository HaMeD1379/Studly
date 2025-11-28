import { Card, Flex, Text } from '@mantine/core';
import { useLoaderData } from 'react-router-dom';
import { profileInfo } from '~/store';

export const ProfileCard = () => {
  const loaderData = useLoaderData() as ProfileCardLoaderData;
  const unlockedBadges = loaderData?.data?.badges?.unlockedBadges ?? [];
  const numBadges = unlockedBadges.length;
  const numFriends = loaderData?.data?.friendCount?.data?.count ?? 24; // fallback if undefined
  const { allTimeHoursStudied } = profileInfo();

  type ProfileCardLoaderData = {
    data?: {
      badges?: { unlockedBadges: { name: string; earnedAt?: string }[] };
      friendCount?: {
        data: { count: number };
      };
    };
  };

  const stats = [
    { label: 'Day Streak', testId: 'day-streak-card', value: '12' },
    {
      label: 'Total Study',
      testId: 'total-study-card',
      value: allTimeHoursStudied,
    },
    { label: 'Badges', testId: 'badges-card', value: numBadges.toString() },
    { label: 'Friends', testId: 'friends-card', value: numFriends.toString() },
  ];

  return (
    <Flex gap='md' wrap='wrap'>
      {stats.map(({ label, value, testId }) => (
        <Card
          data-testid={testId}
          key={testId}
          p='lg'
          radius='md'
          shadow='sm'
          withBorder
        >
          <Flex align='center' direction='column'>
            <Text fw={700}>{label}</Text>
            <Text>{value}</Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
};
