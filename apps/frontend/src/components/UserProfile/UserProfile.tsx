import Avatar from "~/utilities/testing/Avatar"; // Adjust the path as needed
import {
  SimpleGrid,
  Card,
  Text,
  Flex,
  Progress,
  Button,
  Container,
  Tabs,
  rem,
  Center,
} from "@mantine/core";
import {
  IconEdit,
  IconShare,
  IconChartBar,
  IconListDetails,
  IconTrophy,
  IconUsers,
  IconClock,
  IconTrendingUp,
  IconAward,
} from "@tabler/icons-react";

export function UserProfile() {
  const userName = "John Doe"; // Replace with actual user data

  return (
    <Container fluid p="xl">
      <SimpleGrid cols={1} spacing="xl" mt="lg">
        <Card shadow="sm" p="lg" radius="md">
          <Flex direction="row" gap="md">
            <Avatar
              name={userName}
              size={60}
              backgroundColor="#959595ff"
              textColor="#333"
            />
            <Flex direction="column">
              <Text>{userName}</Text>
              <Text>johndoe@gmail.com</Text>
            </Flex>

            <Button
              variant="outline"
              c="dark"
              style={{ borderColor: "black" }}
              leftSection={<IconEdit size={14} />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              c="dark"
              style={{ borderColor: "black" }}
              leftSection={<IconShare size={14} />}
            >
              Share
            </Button>
          </Flex>

          <Text fw={500} mb="xs">
            Experience Points
          </Text>

          <Progress value={70} size="lg" transitionDuration={200} />
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={4} spacing="xl" mt="lg">
        <Card
          fw="bold"
          shadow="sm"
          p="lg"
          radius="md"
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
          }}
        >
          <Center style={{ flexDirection: "column", gap: "8px" }}>
            <IconTrendingUp size={32} color="green" />
            <Text fw={600}>Day Streak</Text>
          </Center>
        </Card>

        <Card fw="bold" shadow="sm" p="lg" radius="md">
          <Center style={{ flexDirection: "column", gap: "8px" }}>
            <IconClock size={32} color="blue" />
            <Text fw={600}>Total Study</Text>
          </Center>
        </Card>

        <Card fw="bold" shadow="sm" p="lg" radius="md">
          <Center style={{ flexDirection: "column", gap: "8px" }}>
            <IconAward size={32} color="orange" />
            <Text fw={600}>Badges</Text>
          </Center>
        </Card>

        <Card fw="bold" shadow="sm" p="lg" radius="md">
          <Center style={{ flexDirection: "column", gap: "8px" }}>
            <IconUsers size={32} color="purple" />
            <Text fw={600}>Friends</Text>
          </Center>
        </Card>
      </SimpleGrid>
      <Tabs
        defaultValue="overview"
        radius="xl"
        variant="outline"
        styles={(theme) => ({
          root: {
            backgroundColor: theme.colors.gray[0],
            padding: rem(4),
            borderRadius: rem(50),
            display: "inline-flex",
          },
          tab: {
            fontWeight: 500,
            color: theme.black,
            padding: `${rem(8)} ${rem(16)}`,
            "&[data-active]": {
              backgroundColor: theme.white,
              boxShadow: theme.shadows.sm,
            },
          },
        })}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<IconListDetails size={16} />}>
            Detailed Stats
          </Tabs.Tab>
          <Tabs.Tab value="achievements" leftSection={<IconTrophy size={16} />}>
            Achievements
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <SimpleGrid cols={2} spacing="lg" mt="lg">
        <Card fw="bold" shadow="sm" p="lg" radius="md">
          This Week
          <Text c={"gray"}>Your study activity this week</Text>
        </Card>
        <Card fw="bold" shadow="sm" p="lg" radius="md">
          Recent Badges
        </Card>
      </SimpleGrid>
      <SimpleGrid cols={1} spacing="lg" mt="lg">
        <Card fw="bold" shadow="sm" p="lg" radius="md">
          Subject Distribution
          <Text>Time spent on different subjects</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
