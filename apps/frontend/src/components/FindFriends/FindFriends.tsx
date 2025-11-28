import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  Input,
  ScrollArea,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconMessageCircle, IconUserPlus } from '@tabler/icons-react';
import { useState } from 'react';
import type { HTMLFormMethod } from 'react-router';
import { Form, useLoaderData, useSubmit } from 'react-router';
import {
  FRIENDS_REQUESTED,
  FRIENDS_SEARCH_NO_USERS,
  FRIENDS_VIEW_PROFILE,
} from '~/constants';
import { userInfo } from '~/store';
import type { Friends, Result } from '~/types';
import { Avatar } from '../Avatar/Avatar';

type Props = {
  results?: Result[];
  onAction: (friend: Result, since: string) => void;
};

export const FindFriends = ({ results }: Props) => {
  const [_selectedUser, setSelectedUser] = useState('');
  const { userId } = userInfo();
  const submit = useSubmit();

  const loaderData = useLoaderData();
  const friends: Friends[] = loaderData?.data?.friendsList?.friends ?? [];
  const requested: Friends[] =
    loaderData?.data?.pendingFriendships?.friends ?? [];

  // IDs of people you are already friends with
  const friendIds = new Set(friends.map((f) => f.to_user));

  // IDs of people you have already requested
  const requestedIds = new Set(requested.map((f) => f.to_user));

  // Filter search results
  const notFriends = results?.filter((r) => !friendIds.has(r.user_id));
  const notRequested = results?.filter((r) => !requestedIds.has(r.user_id));

  const notFriendIds = new Set(notFriends?.map((u) => u.user_id));
  const notRequestedIds = new Set(notRequested?.map((u) => u.user_id));

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    requestUserId: string,
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append('userId', userId);
    formData.append('requestUserId', requestUserId);

    submit(formData, { method: form.method as HTMLFormMethod });
  };

  return (
    <Box>
      <Flex direction='row' gap='md' p='lg'>
        <ScrollArea h={500} type='scroll' w='100%'>
          <SimpleGrid spacing='lg' w='100%'>
            {!results || results.length === 0 ? (
              <Center>
                <Text>{FRIENDS_SEARCH_NO_USERS}</Text>
              </Center>
            ) : (
              results.map((friend: Result) => {
                const isNotFriend = notFriendIds.has(friend.user_id);
                const isNotRequested = notRequestedIds.has(friend.user_id);

                return (
                  <Card
                    key={friend.user_id}
                    p='lg'
                    radius='md'
                    shadow='sm'
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
                        </Flex>
                      </Flex>

                      {/* RIGHT SIDE */}
                      <Flex align='center' gap='xs'>
                        {/* Show Add Friend when not friend & not requested */}
                        {isNotFriend && isNotRequested && (
                          <Form
                            method='post'
                            onSubmit={(e) => handleSubmit(e, friend.user_id)}
                          >
                            <Input
                              name='formtype'
                              type='hidden'
                              value='sendFriendRequest'
                            />
                            <Button
                              color='black'
                              onClick={() => setSelectedUser(friend.user_id)}
                              type='submit'
                              variant='outline'
                            >
                              <IconUserPlus />
                            </Button>
                          </Form>
                        )}

                        {!isNotFriend && (
                          <>
                            <Button
                              onClick={() => setSelectedUser(friend.user_id)}
                              variant='transparent'
                            >
                              <IconMessageCircle color='black' />
                            </Button>

                            <Button
                              color='black'
                              onClick={() => setSelectedUser(friend.user_id)}
                              variant='outline'
                            >
                              {FRIENDS_VIEW_PROFILE}
                            </Button>
                          </>
                        )}

                        {/* If friend request already sent */}
                        {!isNotRequested && <Text>{FRIENDS_REQUESTED}</Text>}
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
