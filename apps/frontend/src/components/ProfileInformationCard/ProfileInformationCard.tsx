import { Button, Card, Flex, Text, TextInput } from '@mantine/core';
import { IconCamera } from '@tabler/icons-react';
import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
export const profileInformationCard = () => {
  const userName = localStorage.getItem('fullName') || 'John Doe';
  const [_fullName, setFullName] = useState('');
  const [_email, setEmail] = useState('');
  const [textCount, setTextCount] = useState(0);

  const changeName = (name: string) => {
    setFullName(name);
    localStorage.setItem('fullName', name);
  };
  const changeEmail = (email_input: string) => {
    setEmail(email_input);
    localStorage.setItem('email', email_input);
  };
  const wordCounter = (text: string) => {
    setTextCount(text.length);
  };
  return (
    <Card p='lg' radius='lg' shadow='sm' w='100%' withBorder>
      <Text data-testid='profile-info-text' fw={700}>
        Profile Information
      </Text>
      <Text c='dimmed' data-testid='profile-info-subtext'>
        Update your personal information and profile details
      </Text>
      <Flex align='center' direction='row' gap='md' p='xs'>
        <Avatar
          backgroundColor='#959595'
          data-testid='avatar-user'
          name={userName}
          size={80}
          textColor='#fff'
        />
        <Flex direction='column' p='sm'>
          <Button
            c='dark'
            data-testid='avatar-change-btn'
            fw={700}
            leftSection={<IconCamera size={14} />}
            style={{ borderColor: 'black' }}
            variant='outline'
          >
            Change Avatar
          </Button>
          <Text c='dimmed' data-testid='accepted-images'>
            JPG,PNG up to 5MB
          </Text>
        </Flex>
      </Flex>
      <Flex direction='row' gap='sm' w='100%'>
        <Flex direction='column' flex={1} gap='sm'>
          <Text data-testid='name-text' fw={700}>
            Full Name
          </Text>
          <TextInput
            data-testid='name-text-update'
            onChange={(e) => changeName(e.target.value)}
            placeholder='Full Name'
            radius='md'
            size='md'
            variant='filled'
            w='100%'
          />
        </Flex>

        <Flex direction='column' flex={1} gap='sm'>
          <Text data-testid='email-text' fw={700}>
            Email Address
          </Text>
          <TextInput
            data-testid='email-text-update'
            onChange={(e) => changeEmail(e.target.value)}
            placeholder='Email Address'
            radius='md'
            size='md'
            variant='filled'
            w='100%'
          />
        </Flex>
      </Flex>
      <Text data-testid='bio-text' fw={600}>
        Bio
      </Text>
      <TextInput
        data-testid='bio-text-update'
        onChange={(e) => wordCounter(e.target.value)}
        placeholder='Update your bio'
        radius='md'
        size='lg'
        variant='filled'
        w='100%'
      ></TextInput>
      <Text c='dimmed' data-testid='word-counter'>
        {textCount}/200 characters
      </Text>
    </Card>
  );
};
