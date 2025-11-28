import { Box, Button, Card, Flex, Pill, Text } from '@mantine/core';
import { IconClock, IconTrendingUp, IconTrophy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router';
import { useNavigate } from 'react-router-dom';
import {
  HOME_NEXT_BADGE_PROGRESS_TEXT,
  HOME_QUICK_ACTIONS_TEXT,
  HOME_START_STUDY_SESSION_TEXT,
  HOME_TODAYS_GOAL_TEXT,
  HOME_WELCOME_DESCRIPTION,
  HOME_WELCOME_MESSAGE,
  STUDY,
} from '~/constants';
import { userInfo } from '~/store';
import { hoursAndMinutes } from '~/utilities/time';
export const HomeHeader = () => {
  const loaderData = useLoaderData() as
    | {
        data?: {
          userProfileInfo?: { data?: { full_name?: string; bio?: string } };
          todaySession?: { totalMinutesStudied?: number | string };
          unlockedBadges?: unknown[];
        };
      }
    | undefined;

  const profileData = loaderData?.data?.userProfileInfo?.data ?? {};
  const sessionData = loaderData?.data?.todaySession ?? {};
  const badgesData = loaderData?.data?.unlockedBadges ?? [];

  // Safely read and fall back to defaults
  const name =
    typeof profileData.full_name === 'string' && profileData.full_name.trim()
      ? profileData.full_name
      : 'John Doe';

  const bio =
    typeof profileData.bio === 'string' && profileData.bio.trim()
      ? profileData.bio
      : 'No bio provided';

  const hoursToday =
    typeof sessionData.totalMinutesStudied === 'number'
      ? sessionData.totalMinutesStudied
      : 0;

  const numBadges = Array.isArray(badgesData) ? badgesData.length : 0;
  const { setName, setBio } = userInfo();
  useEffect(() => {
    setName(name);
    setBio(bio);
  }, [setName, setBio, bio, name]);

  const navigate = useNavigate();
  const [startBtnStyle, setStartBtnStyle] = useState('outline');
  const [findBtnStyle, setFindBtnStyle] = useState('outline');
  const [challengesBtnStyle, setChallengesBtnStyle] = useState('outline');
  return (
    <Box>
      <Flex direction='column' p='md'>
        <Flex align='center' direction='row' justify='space-between'>
          <Flex direction='column'>
            <Text fs='lg' fw={700}>
              {`${HOME_WELCOME_MESSAGE} ${name}! 👋`}
            </Text>
            <Text c='dimmed'>{HOME_WELCOME_DESCRIPTION}</Text>
          </Flex>
          <Flex gap='sm'>
            <Pill size='xl'>
              <Flex align='center'>
                <IconClock size={20} style={{ marginRight: 6 }} />
                {`${hoursAndMinutes(hoursToday)} today`}
              </Flex>
            </Pill>

            <Pill size='xl'>
              <Flex align='center'>
                <IconTrendingUp size={20} style={{ marginRight: 6 }} />
                {`${hoursAndMinutes(hoursToday)} streak`}
              </Flex>
            </Pill>

            <Pill size='xl'>
              <Flex align='center'>
                <IconTrophy size={20} style={{ marginRight: 6 }} />
                {`${numBadges} badges`}
              </Flex>
            </Pill>
          </Flex>
        </Flex>
        <Flex direction='row' gap='sm' py='xl'>
          <Card
            p='lg'
            radius='md'
            shadow='sm'
            style={{ borderRadius: '12px' }}
            w='100%'
            withBorder
          >
            <Text>{HOME_NEXT_BADGE_PROGRESS_TEXT}</Text>
          </Card>
          <Card
            p='lg'
            radius='md'
            shadow='sm'
            style={{ borderRadius: '12px' }}
            w='100%'
            withBorder
          >
            <Text fw={500} fz='xl'>
              {HOME_QUICK_ACTIONS_TEXT}
            </Text>
            <Button
              color='black'
              leftSection={<IconClock />}
              onClick={() => {
                setChallengesBtnStyle('outline');
                setFindBtnStyle('outline');
                setStartBtnStyle('filled');
                navigate(STUDY);
              }}
              variant={startBtnStyle}
            >
              {HOME_START_STUDY_SESSION_TEXT}
            </Button>
            <Button
              color='black'
              leftSection={<IconClock />}
              onClick={() => {
                setChallengesBtnStyle('outline');
                setFindBtnStyle('filled');
                setStartBtnStyle('outline');
              }}
              variant={findBtnStyle}
            >
              {HOME_START_STUDY_SESSION_TEXT}
            </Button>
            <Button
              color='black'
              leftSection={<IconClock />}
              onClick={() => {
                setChallengesBtnStyle('filled');
                setFindBtnStyle('outline');
                setStartBtnStyle('outline');
              }}
              variant={challengesBtnStyle}
            >
              {HOME_START_STUDY_SESSION_TEXT}
            </Button>
          </Card>
          <Card
            p='lg'
            radius='md'
            shadow='sm'
            style={{ borderRadius: '12px' }}
            w='100%'
            withBorder
          >
            <Text>{HOME_TODAYS_GOAL_TEXT}</Text>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
};
