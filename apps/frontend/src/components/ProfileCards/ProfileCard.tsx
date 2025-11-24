import { Card, Center, SimpleGrid, Text } from '@mantine/core';
import {
  IconAward,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { profileInfo } from '~/store';

export const ProfileCard = () => {
  const loaderdata = useLoaderData();
  const unlockedBadges = loaderdata.data.badges.unlockedBadges;
  const { allTimeHoursStudied } = profileInfo();
  const [totalHours, setTotalHours] = useState('');
  const [numBadges, setNumBadges] = useState(0);

  useEffect(() => {
    setTotalHours(allTimeHoursStudied);
  });
  useEffect(() => {
    if (!unlockedBadges) return;
    setNumBadges(unlockedBadges.length);
  }, [unlockedBadges]);

  const stats = [
    {
      icon: <IconTrendingUp color='green' size={28} />,
      label: 'Day Streak',
      value: '12',
    },
    {
      icon: <IconClock color='blue' size={28} />,
      label: 'Total Study',
      value: totalHours,
    },
    {
      icon: <IconAward color='orange' size={28} />,
      label: 'Badges',
      value: numBadges,
    },
    {
      icon: <IconUsers color='purple' size={28} />,
      label: 'Friends',
      value: '24',
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
          shadow='sm'
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
