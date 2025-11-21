import { Card, Center, SimpleGrid, Text } from '@mantine/core';
import {
  IconAward,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { profileInfo } from '~/store/profileInfo';

export const ProfileCard = () => {
  const { allTimeHoursStudied } = profileInfo();
  const [totalHours, setTotalHours] = useState('');
  useEffect(() => {
    setTotalHours(allTimeHoursStudied);
  });
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
      value: '18',
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
