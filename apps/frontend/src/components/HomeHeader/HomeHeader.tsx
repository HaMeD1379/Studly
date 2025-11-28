import { userInfo } from "~/store";
import { Text, Box, Flex, Pill, Card, Button } from "@mantine/core";
import {
  HOME_WELCOME_DESCRIPTION,
  HOME_WELCOME_MESSAGE,
  HOME_QUICK_ACTIONS_TEXT,
  HOME_NEXT_BADGE_PROGRESS_TEXT,
  HOME_TODAYS_GOAL_TEXT,
  HOME_START_STUDY_SESSION_TEXT,
  STUDY,
} from "~/constants";
import { useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { IconClock, IconTrendingUp, IconTrophy } from "@tabler/icons-react";
import { hoursAndMinutes } from "~/utilities/time";
import { useNavigate } from "react-router-dom";
export const HomeHeader = () => {
  const loaderData = useLoaderData();
  const profileData = loaderData.data?.userProfileInfo;
  const sessionData = loaderData.data?.todaySession;
  const badgesData = loaderData.data.unlockedBadges;

  const name = profileData.data.full_name;
  const bio = profileData.data.bio;
  const hoursToday = sessionData.totalMinutesStudied;
  const numBadges = badgesData.length;
  const { setName, setBio } = userInfo();
  useEffect(() => {
    setName(name);
    setBio(bio);
  }, [profileData, setName, setBio]);
  const navigate = useNavigate();
  const [startBtnStyle, setStartBtnStyle] = useState("outline");
  const [findBtnStyle, setFindBtnStyle] = useState("outline");
  const [challengesBtnStyle, setChallengesBtnStyle] = useState("outline");
  return (
    <Box>
      <Flex direction="column" p="md">
        <Flex direction="row" justify="space-between" align="center">
          <Flex direction="column">
            <Text fw={700} fs="lg">
              {`${HOME_WELCOME_MESSAGE} ${name}! 👋`}
            </Text>
            <Text c="dimmed">{HOME_WELCOME_DESCRIPTION}</Text>
          </Flex>
          <Flex gap="sm">
            <Pill size="xl">
              <Flex align="center">
                <IconClock size={20} style={{ marginRight: 6 }} />
                {`${hoursAndMinutes(hoursToday)} today`}
              </Flex>
            </Pill>

            <Pill size="xl">
              <Flex align="center">
                <IconTrendingUp size={20} style={{ marginRight: 6 }} />
                {`${hoursAndMinutes(hoursToday)} streak`}
              </Flex>
            </Pill>

            <Pill size="xl">
              <Flex align="center">
                <IconTrophy size={20} style={{ marginRight: 6 }} />
                {`${numBadges} badges`}
              </Flex>
            </Pill>
          </Flex>
        </Flex>
        <Flex direction="row" gap="sm" py="xl">
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            <Text>{HOME_NEXT_BADGE_PROGRESS_TEXT}</Text>
          </Card>
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            <Text fw={500} fz="xl">
              {HOME_QUICK_ACTIONS_TEXT}
            </Text>
            <Button
              leftSection={<IconClock />}
              variant={startBtnStyle}
              color="black"
              onClick={() => {
                setChallengesBtnStyle("outline");
                setFindBtnStyle("outline");
                setStartBtnStyle("filled");
                navigate(STUDY);
              }}
            >
              {HOME_START_STUDY_SESSION_TEXT}
            </Button>
            <Button
              leftSection={<IconClock />}
              variant={findBtnStyle}
              color="black"
              onClick={() => {
                setChallengesBtnStyle("outline");
                setFindBtnStyle("filled");
                setStartBtnStyle("outline");
              }}
            >
              {HOME_START_STUDY_SESSION_TEXT}
            </Button>
            <Button
              leftSection={<IconClock />}
              variant={challengesBtnStyle}
              color="black"
              onClick={() => {
                setChallengesBtnStyle("filled");
                setFindBtnStyle("outline");
                setStartBtnStyle("outline");
              }}
            >
              {HOME_START_STUDY_SESSION_TEXT}
            </Button>
          </Card>
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            <Text>{HOME_TODAYS_GOAL_TEXT}</Text>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
};
