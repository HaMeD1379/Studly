import { Card, Flex, Text } from '@mantine/core';
import { FRIENDS_FRIENDS_SINCE } from '~/constants';
import type { Result } from '~/types';
import { formatDateString } from '~/utilities/time';
import { Avatar } from '../Avatar/Avatar';

type Props = {
  friend: Result;
  friendshipStartDate: string;
};

export const ViewUserProfile = ({ friend, friendshipStartDate }: Props) => {
  return (
    <Card
      key={friend.user_id}
      p='lg'
      radius='md'
      style={{ borderRadius: '12px' }}
      w='100%'
      withBorder
    >
      <Flex align='center' justify='space-between'>
        {/* LEFT SIDE */}
        <Flex direction='row'>
          <Avatar
            backgroundColor='grey'
            name={friend.full_name || 'User'}
            size={64}
            status='online'
          />

          <Flex direction='column' px='md'>
            <Text fw={700} fz='xl'>
              {friend.full_name}
            </Text>
            <Text c='dimmed' fz='sm'>
              {friend.bio ?? 'No bio provided'}
            </Text>
            <Flex dir='row' gap='sm'>
              <Text>{FRIENDS_FRIENDS_SINCE}</Text>
              <Text fw={700}>{formatDateString(friendshipStartDate)}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};
