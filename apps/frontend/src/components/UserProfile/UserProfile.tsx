import {
  Button,
  Card,
  Center,
  Container,
  Flex,
  Progress,
  rem,
  SimpleGrid,
  Tabs,
  Text,
} from '@mantine/core';
import {
  IconAward,
  IconChartBar,
  IconClock,
  IconEdit,
  IconListDetails,
  IconShare,
  IconTrendingUp,
  IconTrophy,
  IconUsers,
} from '@tabler/icons-react';
import { Avatar } from '~/components/';

export const UserProfile = () => {
  const userName = 'John Doe'; // Replace with actual user data

  return (
    <Container fluid p="xl">
      <SimpleGrid cols={1} mt="lg" spacing="xl">
        <Card p="lg" radius="md" shadow="sm">
          <Flex direction="row" gap="md">
            <Avatar
              backgroundColor="#959595ff"
              name={userName}
              size={60}
              textColor="#333"
            />
            <Flex direction="column">
              <Text>{userName}</Text>
              <Text>johndoe@gmail.com</Text>
            </Flex>

            <Button
              c="dark"
              leftSection={<IconEdit size={14} />}
              style={{ borderColor: 'black' }}
              variant="outline"
            >
              Edit
            </Button>
            <Button
              c="dark"
              leftSection={<IconShare size={14} />}
              style={{ borderColor: 'black' }}
              variant="outline"
            >
              Share
            </Button>
          </Flex>

          <Text fw={500} mb="xs">
            Experience Points
          </Text>

          <Progress size="lg" transitionDuration={200} value={70} />
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={4} mt="lg" spacing="xl">
        <Card
          fw="bold"
          p="lg"
          radius="md"
          shadow="sm"
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
          }}
        >
          <Center style={{ flexDirection: 'column', gap: '8px' }}>
            <IconTrendingUp color="green" size={32} />
            <Text fw={600}>Day Streak</Text>
          </Center>
        </Card>

        <Card fw="bold" p="lg" radius="md" shadow="sm">
          <Center style={{ flexDirection: 'column', gap: '8px' }}>
            <IconClock color="blue" size={32} />
            <Text fw={600}>Total Study</Text>
          </Center>
        </Card>

        <Card fw="bold" p="lg" radius="md" shadow="sm">
          <Center style={{ flexDirection: 'column', gap: '8px' }}>
            <IconAward color="orange" size={32} />
            <Text fw={600}>Badges</Text>
          </Center>
        </Card>

        <Card fw="bold" p="lg" radius="md" shadow="sm">
          <Center style={{ flexDirection: 'column', gap: '8px' }}>
            <IconUsers color="purple" size={32} />
            <Text fw={600}>Friends</Text>
          </Center>
        </Card>
      </SimpleGrid>
      <Tabs
        defaultValue="overview"
        radius="xl"
        styles={(theme) => ({
          root: {
            backgroundColor: theme.colors.gray[0],
            borderRadius: rem(50),
            display: 'inline-flex',
            padding: rem(4),
          },
          tab: {
            '&[data-active]': {
              backgroundColor: theme.white,
              boxShadow: theme.shadows.sm,
            },
            color: theme.black,
            fontWeight: 500,
            padding: `${rem(8)} ${rem(16)}`,
          },
        })}
        variant="outline"
      >
        <Tabs.List>
          <Tabs.Tab leftSection={<IconChartBar size={16} />} value="overview">
            Overview
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconListDetails size={16} />} value="stats">
            Detailed Stats
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconTrophy size={16} />} value="achievements">
            Achievements
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <SimpleGrid cols={2} mt="lg" spacing="lg">
        <Card fw="bold" p="lg" radius="md" shadow="sm">
          This Week
          <Text c={'gray'}>Your study activity this week</Text>
        </Card>
        <Card fw="bold" p="lg" radius="md" shadow="sm">
          Recent Badges
        </Card>
      </SimpleGrid>
      <SimpleGrid cols={1} mt="lg" spacing="lg">
        <Card fw="bold" p="lg" radius="md" shadow="sm">
          Subject Distribution
          <Text>Time spent on different subjects</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
};
