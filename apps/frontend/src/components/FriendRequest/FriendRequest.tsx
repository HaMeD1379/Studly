import {
  Box,
  Button,
  Card,
  Flex,
  Input,
  ScrollArea,
  SimpleGrid,
  Text,
} from '@mantine/core';
import { IconUserMinus, IconUserPlus } from '@tabler/icons-react';
import { useState } from 'react';
import {
  Form,
  type HTMLFormMethod,
  useLoaderData,
  useSubmit,
} from 'react-router';
import {
  FRIENDS_NO_REQUESTS,
  FRIENDS_PENDING,
  FRIENDS_SENT_REQUEST,
} from '~/constants';
import { userInfo } from '~/store';
import type { LoaderData, RequestProfile } from '~/types';
import { Avatar } from '../Avatar/Avatar';

export const FriendRequest = () => {
  const [selectedUser, _setSelectedUser] = useState('');
  const submit = useSubmit();
  const { userId } = userInfo();

  const loaderData = useLoaderData() as LoaderData;

  const requestProfiles = loaderData.data.requestProfile;
  const receivedRequestsProfiles = loaderData.data.receivedRequestsProfile;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    userIdToSend?: string,
  ) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append('to_user', userId);
    formData.append('from_user', userIdToSend || selectedUser);
    submit(formData, { method: form.method as HTMLFormMethod });
  };
  const dynamicScrollBarHeight = (profiles: RequestProfile[]): number => {
    const val = Math.min(profiles.length * 150, 500);
    return val;
  };
  const RequestList = ({
    title,
    profiles,
  }: {
    title: string;
    profiles: RequestProfile[];
  }) => {
    return (
      <Box>
        <Text fw={600} mb='sm'>
          {title}
        </Text>

        {profiles.length === 0 ? (
          <Text c='dimmed' py='xl' ta='center'>
            {FRIENDS_NO_REQUESTS}
          </Text>
        ) : (
          <ScrollArea
            h={dynamicScrollBarHeight(profiles)}
            type='scroll'
            w='100%'
          >
            <SimpleGrid spacing='lg'>
              {profiles.map((entry) => {
                const friend = entry.profile.data;

                return (
                  <Card
                    key={friend.user_id}
                    p='lg'
                    radius='md'
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
                            {friend.bio || 'No bio provided'}
                          </Text>
                        </Flex>
                      </Flex>

                      {/* RIGHT SIDE */}
                      <Flex align='center' gap='xs'>
                        <Flex direction='column'>
                          {title === 'RECEIVED REQUESTS' ? (
                            <Flex direction='row' gap='md'>
                              <Form
                                method='post'
                                onSubmit={(e) => {
                                  handleSubmit(e, friend.user_id);
                                }}
                              >
                                <Input
                                  name='formtype'
                                  type='hidden'
                                  value='acceptRequest'
                                />
                                <Button
                                  color='black'
                                  type='submit'
                                  variant='outline'
                                >
                                  <IconUserPlus color='green' />
                                </Button>
                              </Form>
                              <Form
                                method='post'
                                onSubmit={(e) => {
                                  handleSubmit(e, friend.user_id);
                                }}
                              >
                                <Input
                                  name='formtype'
                                  type='hidden'
                                  value='rejectRequest'
                                />
                                <Button
                                  color='black'
                                  type='submit'
                                  variant='outline'
                                >
                                  <IconUserMinus color='red' />
                                </Button>
                              </Form>
                            </Flex>
                          ) : (
                            <>
                              <Text>{FRIENDS_SENT_REQUEST}</Text>
                              <Text c='dimmed'>{FRIENDS_PENDING}</Text>
                            </>
                          )}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })}
            </SimpleGrid>
          </ScrollArea>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Flex direction='row' gap='md'>
        <Flex direction='column' gap='xl'>
          {/* RECEIVED REQUESTS */}
          <RequestList
            profiles={receivedRequestsProfiles}
            title='RECEIVED REQUESTS'
          />

          {/* SENT REQUESTS */}
          <RequestList profiles={requestProfiles} title='SENT REQUESTS' />
        </Flex>
      </Flex>
    </Box>
  );
};
