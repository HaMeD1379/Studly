import { Button, Card, Flex, Progress, Stack, Text } from '@mantine/core';
import { IconEdit, IconShare } from '@tabler/icons-react';
import { Avatar } from '~/components/';
import { profileString } from '~/constants';

export function UserCard() {
  const userName = localStorage.getItem('fullName') || 'Alex Student';
  const email = localStorage.getItem('email') || 'alex@example.com';

  return (
    <Card p='lg' radius='md' shadow='sm' w='100%' withBorder>
      <Flex align='center' gap='md' justify='space-between' wrap='wrap'>
        {/* User Info */}
        <Flex align='center' gap='md'>
          <Avatar
            backgroundColor='#959595'
            name={userName}
            size={80}
            textColor='#fff'
          />
          <Stack>
            <Text data-testid='name-text' fw={600} fz='lg'>
              {userName}
            </Text>
            <Text c='dimmed' data-testid='email-text'>
              {email}
            </Text>
            <Text c='gray.6' data-testid='bio-text' fz='sm'>
              {profileString.default}
            </Text>
          </Stack>
        </Flex>

        <Flex gap='sm'>
          <Button
            c='dark'
            data-testid='edit-btn'
            leftSection={<IconEdit size={14} />}
            style={{ borderColor: 'black' }}
            variant='outline'
          >
            Edit
          </Button>
          <Button
            c='dark'
            data-testid='share-btn'
            leftSection={<IconShare size={14} />}
            style={{ borderColor: 'black' }}
            variant='outline'
          >
            Share
          </Button>
        </Flex>
      </Flex>

      <Stack data-testid='xp bar' mt='md'>
        <Text fw={500}>Experience Points</Text>
        <Progress size='lg' transitionDuration={200} value={68} />
      </Stack>
    </Card>
  );
}
