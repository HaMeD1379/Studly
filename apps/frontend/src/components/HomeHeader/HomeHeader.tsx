import { Box, Button, Card, Flex, Pill, Stack, Text } from "@mantine/core";
import { IconClock, IconTarget, IconTrendingUp, IconTrophy } from "@tabler/icons-react";
import { useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router";
import {
  BADGES,
  HOME_WELCOME_DESCRIPTION,
  HOME_WELCOME_MESSAGE,
  STUDY,
} from "~/constants";
import { userInfo } from "~/store";
import { hoursAndMinutes } from "~/utilities/time";

export const HomeHeader = () => {
  const loaderData = useLoaderData();
  const profileData = loaderData.data?.userProfileInfo;
  const sessionData = loaderData.data?.todaySession;
  const badgesData = loaderData.data?.unlockedBadges;

  const name = profileData?.data?.full_name || "Student";
  const bio = profileData?.data?.bio;
  const hoursToday = sessionData?.totalMinutesStudied || 0;
  const numBadges = badgesData?.length || 0;
  const currentStreak = 0; // TODO: Get actual streak from backend
  
  const { setName, setBio } = userInfo();
  const navigate = useNavigate();

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
          {/* Left Card - Upcoming Badge (Placeholder) */}
          <Card
            p="lg"
            radius="md"
            shadow="sm"
            style={{ borderRadius: "12px" }}
            w="100%"
            withBorder
          >
            <Flex align="center" direction="column" justify="center" style={{ minHeight: 120 }}>
              <IconTarget color="gray" size={40} style={{ marginBottom: 8 }} />
              <Text c="dimmed" fw={500} size="md" ta="center">
                View upcoming badges...
              </Text>
            </Flex>
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
            <Text fw={500} mb="md" size="xl">
              Quick Actions
            </Text>
            <Stack gap="sm">
              <Button
                color="black"
                fullWidth
                leftSection={<IconClock />}
                onClick={() => navigate(STUDY)}
                variant="filled"
              >
                Start Study Session
              </Button>
              <Button
                color="black"
                fullWidth
                leftSection={<IconTrophy />}
                onClick={() => navigate(BADGES)}
                variant="outline"
              >
                View Badges
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
            <Flex align="center" direction="column" justify="center" style={{ minHeight: 120 }}>
              <Text c="dimmed" fw={500} mb="xs" size="sm">
                Total Time Studied Today
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
