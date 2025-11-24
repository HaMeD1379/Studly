import { Button, Card, Flex, Text, TextInput } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Form, useActionData } from 'react-router-dom';
import {
  PROFILE_AVATAR_IMAGE_SPECS,
  PROFILE_BIO_TEXT,
  PROFILE_CHANGE_AVATAR,
  PROFILE_CHARACTER_LIMIT,
  PROFILE_EMAIL_ADDRESS_TEXT,
  PROFILE_FULL_NAME_TEXT,
  PROFILE_INFORMATION_TEXT,
  PROFILE_UPDATE_INFORMATION_TEXT,
} from '~/constants';
import { userInfo } from '~/store';
import { displayNotifications } from '~/utilities/notifications';
import { Avatar } from '../Avatar/Avatar';

export const profileInformationCard = () => {
  const [fullName, setFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bioText, _setBioText] = useState('');
  const [textCount, setTextCount] = useState(0);
  const actionData = useActionData();
  const { bio, name, email, avatarState, setName, setEmail } =
    userInfo.getState();
  const userName = name || 'John Doe';

  const changeName = (name: string) => {
    setFullName(name);
  };
  const changeEmail = (email: string) => {
    setUserEmail(email);
  };
  const wordCounter = (text: string) => {
    const maxLength = 200;
    setTextCount(Math.min(text.length, maxLength));
  };

  useEffect(() => {
    if (actionData && !actionData.success) {
      const message = actionData.message;
      if (message === 'Profile updated successfully') {
        displayNotifications(
          'Update Successful',
          'User Information has been updated',
          'green',
        );
      } else {
        displayNotifications('Update Failed', 'Please try again later', 'red');
      }
    }
  }, [actionData]);

  const onClick = () => {
    if (fullName) {
      setName(fullName);
    }
    if (userEmail) {
      setEmail(userEmail);
    }
    if (bioText) {
    }
  };

  return (
    <Card p='lg' radius='lg' shadow='sm' w='100%' withBorder>
      <Form id='profile-form' method='PATCH' onSubmit={onClick}>
        <Text data-testid='profile-info-text' fw={700}>
          {PROFILE_INFORMATION_TEXT}
        </Text>
        <Text c='dimmed' data-testid='profile-info-subtext'>
          {PROFILE_UPDATE_INFORMATION_TEXT}
        </Text>
        <Flex align='center' direction='row' gap='md' p='xs'>
          <Avatar
            backgroundColor='#959595'
            data-testid='avatar-user'
            name={userName}
            size={80}
            status={avatarState}
            textColor='#fff'
          />
          <Flex direction='column' p='sm'>
            <Button
              c='dark'
              data-testid='avatar-change-btn'
              fw={700}
              leftSection={<IconCamera size={14} />}
              onClick={() => {
                displayNotifications(
                  'Not Supported',
                  'The action you have requested is not available at this time',
                  'red',
                );
              }}
              style={{ borderColor: 'black' }}
              variant='outline'
            >
              {PROFILE_CHANGE_AVATAR}
            </Button>
            <Text c='dimmed' data-testid='accepted-images'>
              {PROFILE_AVATAR_IMAGE_SPECS}
            </Text>
          </Flex>
        </Flex>
        <Flex direction='row' gap='sm' w='100%'>
          <Flex direction='column' flex={1} gap='sm'>
            <Text data-testid='name-text' fw={700}>
              {PROFILE_FULL_NAME_TEXT}
            </Text>
            <TextInput
              data-testid='name-text-update'
              defaultValue={name || 'Full Name'}
              name='fullName'
              onChange={(e) => changeName(e.target.value)}
              radius='md'
              size='md'
              variant='filled'
              w='100%'
            />
          </Flex>

          <Flex direction='column' flex={1} gap='sm'>
            <Text data-testid='email-text' fw={700}>
              {PROFILE_EMAIL_ADDRESS_TEXT}
            </Text>
            <TextInput
              data-testid='email-text-update'
              defaultValue={email || 'user@gmail.com'}
              onChange={(e) => changeEmail(e.target.value)}
              radius='md'
              size='md'
              variant='filled'
              w='100%'
            />
          </Flex>
        </Flex>
        <Text data-testid='bio-text' fw={600}>
          {PROFILE_BIO_TEXT}
        </Text>
        <TextInput
          data-testid='bio-text-update'
          defaultValue={bio}
          maxLength={200}
          name='bio'
          onChange={(e) => wordCounter(e.target.value)}
          radius='md'
          size='lg'
          variant='filled'
          w='100%'
        ></TextInput>
        <Text c='dimmed' data-testid='word-counter'>
          {textCount}
          {PROFILE_CHARACTER_LIMIT}
        </Text>
      </Form>
    </Card>
  );
};
