import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  ScrollArea,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { useLoaderData } from 'react-router';
import {
  FRIENDS_SEARCH_TO_FIND_A_FRIENDS,
  FRIENDS_VIEW_PROFILE,
} from '~/constants';
import type { Result } from '~/types';
import { Avatar } from '../Avatar/Avatar';

export const FriendsStatus = () => {
  const loaderdata = useLoaderData() as LoaderData;

  const friendsProfile = loaderdata.data.friendsProfile;

  type RequestProfile = {
    profile: {
      data: Result;
    };
  };

  type LoaderData = {
    data: {
      friendsList: {
        friends: Result[];
      };
      friendsProfile: RequestProfile[];
      receivedRequestsProfile: RequestProfile[];
    };
  };

  return (
    <Box>
      <Flex direction='row' gap='md' p='lg'>
        <ScrollArea h={500} type='scroll' w='100%'>
          <SimpleGrid spacing='lg' w='100%'>
            {friendsProfile.length === 0 ? (
              <Center>
                <Text>{FRIENDS_SEARCH_TO_FIND_A_FRIENDS}</Text>
              </Center>
            ) : (
              friendsProfile.map((entry) => {
                const friend = entry.profile.data;

                return (
                  <Card
                    key={friend.user_id}
                    p='lg'
                    radius='md'
                    shadow='sm'
                    style={{ borderRadius: 12 }}
                    withBorder
                  >
                    <Flex align='center' justify='space-between'>
                      {/* LEFT SIDE */}
                      <Flex direction='row'>
                        <Avatar
                          backgroundColor='grey'
                          name={friend.full_name}
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
                        </Flex>
                      </Flex>

                      {/* RIGHT SIDE BUTTONS */}
                      <Flex align='center' gap='xs'>
                        <Button variant='transparent'>
                          <IconMessageCircle color='black' />
                        </Button>

                        <Button color='black' variant='outline'>
                          {FRIENDS_VIEW_PROFILE}
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })
            )}
          </SimpleGrid>
        </ScrollArea>
      </Flex>
    </Box>
  );
};
