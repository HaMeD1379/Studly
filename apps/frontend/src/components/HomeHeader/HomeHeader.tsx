import { userInfo } from "~/store";
import { Text, Box, Flex, Pill, Card, Button, Stack } from "@mantine/core";
import {
  HOME_WELCOME_DESCRIPTION,
  HOME_WELCOME_MESSAGE,
  STUDY,
  BADGES,
} from "~/constants";
import { useLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";
import { IconClock, IconTrendingUp, IconTrophy, IconTarget } from "@tabler/icons-react";
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
  }, [profileData, setName, setBio, name, bio]);

  return (
    <Box>
      <Flex direction="column" p="md">
        {/* Header with stats pills */}
        <Flex direction="row" justify="space-between" align="center">
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
            <Flex direction="column" align="center" justify="center" style={{ minHeight: 120 }}>
              <IconTarget size={40} color="gray" style={{ marginBottom: 8 }} />
              <Text fw={500} size="md" c="dimmed" ta="center">
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
            <Text fw={500} size="xl" mb="md">
              Quick Actions
            </Text>
            <Stack gap="sm">
              <Button
                leftSection={<IconClock />}
                variant="filled"
                color="black"
                fullWidth
                onClick={() => navigate(STUDY)}
              >
                Start Study Session
              </Button>
              <Button
                leftSection={<IconTrophy />}
                variant="outline"
                color="black"
                fullWidth
                onClick={() => navigate(BADGES)}
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
            <Flex direction="column" align="center" justify="center" style={{ minHeight: 120 }}>
              <Text fw={500} size="sm" c="dimmed" mb="xs">
                Total Time Studied Today
              </Text>
              <Text fw={700} size="2rem" c="black">
                {hoursAndMinutes(hoursToday)}
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Box>
  );
};
