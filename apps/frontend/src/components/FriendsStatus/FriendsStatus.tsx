import {
  Box,
  Button,
  Card,
  Flex,
  ScrollArea,
  SimpleGrid,
  Text,
} from '@mantine/core';

import { IconClock, IconMessageCircle, IconTrophy } from '@tabler/icons-react';
import { Avatar } from '../Avatar/Avatar';
export const FriendsStatus = () => {
  interface Friend {
    name: string;
    subject: string;
    status: string;
    streak: string;
    studyLength: number;
    numBadges: number;
    activity: 'online' | 'studying' | 'offline';
  }
  const friends: Friend[] = [
    {
      activity: 'online',
      name: 'Sarah Chen',
      numBadges: 24,
      status: '2 hours ago',
      streak: '15 day streak',
      studyLength: 206,
      subject: 'Physics',
    },
    {
      activity: 'studying',
      name: 'Mike Johnson',
      numBadges: 16,
      status: 'Currently Studying',
      streak: '8 day streak',
      studyLength: 148,
      subject: 'Mathematics',
    },
    {
      activity: 'offline',
      name: 'Emma Wilson',
      numBadges: 35,
      status: '6 hours ago',
      streak: '22 day streak',
      studyLength: 311,
      subject: 'Chemistry',
    },
    {
      activity: 'online',
      name: 'Alex Rodriguez',
      numBadges: 12,
      status: '1 hours ago',
      streak: '3 day streak',
      studyLength: 93,
      subject: 'History',
    },
  ];

  return (
    <Box>
      <Flex direction='row' gap='md' p='lg'>
        <ScrollArea h={500} type='scroll' w='100%'>
          <SimpleGrid spacing='lg' w='100%'>
            {friends.map((friend) => (
              <Card
                key={friend.name}
                p='lg'
                radius='md'
                shadow='sm'
                style={{ borderRadius: '12px' }}
                w='100%'
                withBorder
              >
                <Flex align='center' justify='space-between'>
                  {/* LEFT SIDE: Avatar + Info */}
                  <Flex direction='row'>
                    <Avatar
                      backgroundColor='grey'
                      name={friend.name || 'John Doe'}
                      size={64}
                      status={friend.activity}
                    />

                    <Flex direction='column' px='md'>
                      <Text fw={700} fz='xl'>
                        {friend.name}
                      </Text>

                      <Text c='dimmed' fz='sm'>
                        {`${friend.subject} - ${friend.status}`}
                      </Text>

                      {/* Stats */}
                      <Flex direction='row'>
                        <Text
                          c='dimmed'
                          fz='sm'
                          style={{
                            alignItems: 'center',
                            display: 'flex',
                            gap: 6,
                          }}
                        >
                          <IconTrophy color='grey' />
                          {friend.streak}
                        </Text>

                        <Text
                          c='dimmed'
                          fz='sm'
                          p='xs'
                          style={{
                            alignItems: 'center',
                            display: 'flex',
                            gap: 6,
                          }}
                        >
                          <IconClock color='grey' />
                          {`${friend.studyLength}h`}
                        </Text>

                        <Text
                          c='dimmed'
                          fz='sm'
                          p='xs'
                          style={{
                            alignItems: 'center',
                            display: 'flex',
                            gap: 6,
                          }}
                        >
                          {`${friend.numBadges} badges`}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  {/* RIGHT SIDE: Buttons */}
                  <Flex align='center' gap='xs'>
                    <Button variant='transparent'>
                      <IconMessageCircle color='black' />
                    </Button>

                    <Button color='black' variant='outline'>
                      View Profile
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </SimpleGrid>
        </ScrollArea>
      </Flex>
    </Box>
  );
};
