import { Card, Center, SimpleGrid, Text } from '@mantine/core';
import {
  IconAward,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { useLoaderData } from 'react-router-dom';
import { profileInfo } from '~/store';

export const ProfileCard = () => {
  const loaderData = useLoaderData() as ProfileCardLoaderData;
  const unlockedBadges = loaderData?.data?.badges?.unlockedBadges ?? [];
  const numBadges = unlockedBadges.length;
  const numFriends = loaderData?.data?.friendCount?.data?.count ?? 24;
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
    {
      icon: <IconTrendingUp color='green' size={28} />,
      label: 'Day Streak',
      testId: 'day-streak-card',
      value: '12',
    },
    {
      icon: <IconClock color='blue' size={28} />,
      label: 'Total Study',
      testId: 'total-study-card',
      value: allTimeHoursStudied,
    },
    {
      icon: <IconAward color='orange' size={28} />,
      label: 'Badges',
      testId: 'badges-card',
      value: numBadges.toString(),
    },
    {
      icon: <IconUsers color='purple' size={28} />,
      label: 'Friends',
      testId: 'friends-card',
      value: numFriends.toString(),
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing='lg' w='100%'>
      {stats.map((item) => (
        <Card
          data-testid={`${item.label.toLowerCase().replace(/\s+/g, '-')}-card`}
          key={item.label}
          p='lg'
          radius='md'
          style={{ borderRadius: '12px' }}
          withBorder
        >
          <Center style={{ flexDirection: 'column', gap: '6px' }}>
            {item.icon}
            <Text fw={700} fz='xl'>
              {item.value}
            </Text>
            <Text c='dimmed' fz='sm'>
              {item.label}
            </Text>
          </Center>
        </Card>
      ))}
    </SimpleGrid>
  );
};
