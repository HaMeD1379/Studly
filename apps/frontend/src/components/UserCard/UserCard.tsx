import { Button, Card, Flex, Progress, Stack, Text } from '@mantine/core';
import { IconEdit, IconShare } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Avatar } from '~/components/';
import {
  BADGE_COLLECTION_PROGRESS,
  PROFILE_BIO_DEFAULT,
  PROFILE_EDIT_TEXT,
  PROFILE_SHARE_TEXT,
  SETTINGS,
} from '~/constants';
import { useNavbar } from '~/context';
import { userInfo } from '~/store';

export const UserCard = () => {
  const { name, email, setBio, avatarState } = userInfo.getState();
  const userName = name || 'Alex Student';
  const userEmail = email || 'alex@example.com';
  const navigate = useNavigate();
  const { setGlobalPath } = useNavbar();
  const loaderdata = useLoaderData();
  const [badgesProgress, setBadgesProgress] = useState(0);

  const bio = loaderdata.data.profileBio.data.bio;
  const unlockedBadges = loaderdata.data.badges.unlockedBadges;
  const allBadges = loaderdata.data.badges.allBadges;

  const updatePath = (path: string) => {
    setGlobalPath(path);
    navigate(path);
  };

  useEffect(() => {
    setBio(bio);
  }, [setBio, bio]);

  useEffect(() => {
    if (!unlockedBadges) return;
    setBadgesProgress(
      Math.round((unlockedBadges.length / allBadges.length) * 100),
    );
  }, [unlockedBadges, allBadges]);

  return (
    <Card p='lg' radius='md' w='100%' withBorder>
      <Flex align='center' gap='md' justify='space-between' wrap='wrap'>
        {/* User Info */}
        <Flex align='center' gap='md'>
          <Avatar
            backgroundColor='#959595'
            name={userName}
            size={80}
            status={avatarState}
            textColor='#fff'
          />
          <Stack>
            <Text data-testid='name-text' fw={600} fz='lg'>
              {userName}
            </Text>
            <Text c='dimmed' data-testid='email-text'>
              {userEmail}
            </Text>
            <Text c='gray.6' data-testid='bio-text' fz='sm'>
              {bio || PROFILE_BIO_DEFAULT}
            </Text>
          </Stack>
        </Flex>

        <Flex gap='sm'>
          <Button
            c='dark'
            data-testid='edit-btn'
            leftSection={<IconEdit size={14} />}
            onClick={() => updatePath(SETTINGS)}
            style={{ borderColor: 'black' }}
            variant='outline'
          >
            {PROFILE_EDIT_TEXT}
          </Button>
          <Button
            c='dark'
            data-testid='share-btn'
            disabled
            leftSection={<IconShare size={14} />}
            style={{ borderColor: 'black' }}
            variant='outline'
          >
            {PROFILE_SHARE_TEXT}
          </Button>
        </Flex>
      </Flex>

      <Stack data-testid='xp bar' mt='md'>
        <Text fw={500}>{BADGE_COLLECTION_PROGRESS}</Text>
        <Progress size='lg' transitionDuration={200} value={badgesProgress} />
      </Stack>
    </Card>
  );
};
