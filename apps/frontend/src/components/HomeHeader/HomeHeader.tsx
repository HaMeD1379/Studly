import {
  Box,
  Button,
  Card,
  Flex,
  Pill,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconClock,
  IconTarget,
  IconTrendingUp,
  IconTrophy,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import {
  BADGES,
  HOME_QUICK_ACTIONS_TEXT,
  HOME_START_STUDY_SESSION_TEXT,
  HOME_TIME_STUDIED_TODAY,
  HOME_VIEW_BADGES,
  HOME_VIEW_MORE_BADGES,
  HOME_VIEW_UPCOMING_BADGES,
  HOME_WELCOME_DESCRIPTION,
  HOME_WELCOME_MESSAGE,
  STUDY,
} from "~/constants";
import { useNavbar } from "~/context";
import { userInfo } from "~/store";
import type { inProgressBadge } from "~/types";
import { hoursAndMinutes } from "~/utilities/time";

type props = {
  action: () => void;
};

export const HomeHeader = ({ action }: props) => {
  const loaderData = useLoaderData();
  const profileData = loaderData.data?.userProfileInfo;
  const sessionData = loaderData.data?.todaySession;
  const badgesData = loaderData.data?.unlockedBadges;
  const inProgressBadges = loaderData.data?.inProgressBadges;
  const DISPLAY_SIZE = 1;
  inProgressBadges.sort(
    (a: inProgressBadge, b: inProgressBadge) => b.progress - a.progress
  );

  const displayedBadges: inProgressBadge[] = inProgressBadges.slice(
    0,
    DISPLAY_SIZE
  );
  const name = profileData?.data?.full_name || "Student";
  const bio = profileData?.data?.bio;
  const hoursToday = sessionData?.totalMinutesStudied || 0;
  const numBadges = badgesData?.length || 0;
  const currentStreak = 0; // TODO: Get actual streak from backend

  const { setName, setBio } = userInfo();
  const navigate = useNavigate();
  const { setGlobalPath } = useNavbar();

  const updatePath = (path: string) => {
    console.log("navigating to path:", path);
    setGlobalPath(path);
    navigate(path);
  };

  useEffect(() => {
    if (name && bio !== undefined) {
      setName(name);
      setBio(bio);
    }
  }, [setName, setBio, name, bio]);

  return (
    <Box>
      <Flex direction="column" p="md">
        {/* Header with stats pills */}
        <Flex align="center" direction="row" justify="space-between">
          <Flex direction="column">
            <Text fw={700} size="lg">
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
                {`${currentStreak} day streak`}
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

        {/* Three cards section */}
        <Flex direction="row" gap="sm" py="xl">
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            {displayedBadges.length > 0 ? (
              <>
                <Text fw={800}>{HOME_VIEW_UPCOMING_BADGES} </Text>
                <Stack py="md">
                  {displayedBadges.map((item: inProgressBadge) => (
                    <Card
                      key={item.name}
                      p="lg"
                      radius="md"
                      shadow="sm"
                      style={{ borderRadius: "12px" }}
                      withBorder
                    >
                      <Text fw={700}>{item.name}</Text>
                      <Text c="dimmed">{item.description}</Text>

                      <Progress color="black" value={item.progress} />
                    </Card>
                  ))}
                </Stack>
              </>
            ) : (
              <Flex
                align="center"
                direction="column"
                justify="center"
                style={{ minHeight: 120 }}
              >
                <IconTarget
                  color="gray"
                  size={40}
                  style={{ marginBottom: 8 }}
                />
                <Text c="dimmed" fw={500} size="md" ta="center">
                  {HOME_VIEW_UPCOMING_BADGES}
                </Text>
              </Flex>
            )}
            <Button
              color="black"
              onClick={action}
              radius="md"
              variant="outline"
            >
              <Text c="black">{HOME_VIEW_MORE_BADGES}</Text>
            </Button>
          </Card>

          {/* Middle Card - Quick Actions */}
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            <Text fw={800}>{HOME_QUICK_ACTIONS_TEXT}</Text>
            <Stack gap="sm" py="md">
              <Button
                color="black"
                fullWidth
                leftSection={<IconClock />}
                onClick={() => updatePath(STUDY)}
                variant="filled"
              >
                {HOME_START_STUDY_SESSION_TEXT}
              </Button>
              <Button
                color="black"
                fullWidth
                leftSection={<IconTrophy />}
                onClick={() => updatePath(BADGES)}
                variant="outline"
              >
                {HOME_VIEW_BADGES}
              </Button>
            </Stack>
          </Card>

          {/* Right Card - Today's Study Time */}
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            <Flex
              align="center"
              direction="column"
              justify="center"
              style={{ minHeight: 120 }}
            >
              <Text c="dimmed" fw={500} mb="xs" size="sm">
                {HOME_TIME_STUDIED_TODAY}
              </Text>
              <Text c="black" fw={700} size="2rem">
                {hoursAndMinutes(hoursToday)}
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
};
