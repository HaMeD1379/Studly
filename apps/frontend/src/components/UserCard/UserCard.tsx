import { Button, Card, Flex, Progress, Stack, Text } from "@mantine/core";
import { IconEdit, IconShare } from "@tabler/icons-react";
import { Avatar } from "~/components/";
import { profileString } from "~/constants";

export function UserCard() {
  const userName = localStorage.getItem("fullName") || "Alex Student";
  const email = localStorage.getItem("email") || "alex@example.com";

  return (
    <Card w="100%" p="lg" radius="md" shadow="sm" withBorder>
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        {/* User Info */}
        <Flex align="center" gap="md">
          <Avatar
            backgroundColor="#959595"
            name={userName}
            size={80}
            textColor="#fff"
          />
          <Stack>
            <Text fw={600} fz="lg" data-testid="name-text">
              {userName}
            </Text>
            <Text c="dimmed" data-testid="email-text">
              {email}
            </Text>
            <Text c="gray.6" fz="sm" data-testid="bio-text">
              {profileString.default}
            </Text>
          </Stack>
        </Flex>

        <Flex gap="sm">
          <Button
            leftSection={<IconEdit size={14} />}
            variant="outline"
            c="dark"
            style={{ borderColor: "black" }}
            data-testid="edit-btn"
          >
            Edit
          </Button>
          <Button
            leftSection={<IconShare size={14} />}
            variant="outline"
            c="dark"
            style={{ borderColor: "black" }}
            data-testid="share-btn"
          >
            Share
          </Button>
        </Flex>
      </Flex>

      <Stack mt="md" data-testid="xp bar">
        <Text fw={500}>Experience Points</Text>
        <Progress value={68} size="lg" transitionDuration={200} />
      </Stack>
    </Card>
  );
}
