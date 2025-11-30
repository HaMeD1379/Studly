import {
  ActionIcon,
  Box,
  Card,
  Progress,
  SimpleGrid,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useLoaderData, useNavigate } from 'react-router';
import { HOME, HOME_DISPLAYING_UPCOMING_BADGES } from '~/constants';
import type { InProgressBadge } from '~/types';

export const InProgressBadges = () => {
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const inProgressBadges = loaderData.data?.inProgressBadges;
  inProgressBadges.sort(
    (a: InProgressBadge, b: InProgressBadge) => b.progress - a.progress,
  );
  return (
    <Box w='100%'>
      <ActionIcon
        color='blue'
        onClick={() => {
          navigate(HOME);
        }}
        variant='outline'
      >
        <IconArrowLeft />
      </ActionIcon>
      <Text fs='lg' fw={700} py='md'>
        {HOME_DISPLAYING_UPCOMING_BADGES}
      </Text>
      <SimpleGrid spacing='lg' w='100%'>
        {inProgressBadges.map((item: InProgressBadge) => {
          return (
            <Card
              data-testid='badge-card'
              key={item.name}
              p='lg'
              radius='md'
              style={{ borderRadius: '12px' }}
              w='100%'
              withBorder
            >
              <Text>{item.name}</Text>
              <Text c='dimmed'>{item.description}</Text>
              <Tooltip label={`${item.name} - ${item.progress}%`}>
                <Progress color='blue' value={item.progress}></Progress>
              </Tooltip>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
