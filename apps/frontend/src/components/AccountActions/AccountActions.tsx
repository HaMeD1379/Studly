import { Box, Button, Card, Flex, Text } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { displayNotifications } from "~/utilities/notifications";
export const AccountActions = () => {
  return (
    <Box py="md" w="100%">
      <Card p="lg" radius="md" shadow="sm" w="100%" withBorder>
        <Text data-testid="account-actions-text">Account actions</Text>
        <Box py="md" w="100%">
          <Card p="lg" radius="lg" shadow="sm" w="100%" withBorder>
            <Flex align="center" justify="space-between">
              <div>
                <Text data-testid="change-password-text" fw={600}>
                  Change Password
                </Text>
                <Text
                  c="dimmed"
                  data-testid="change-password-subtext"
                  size="sm"
                >
                  Update your password
                </Text>
              </div>
              <Button
                color="black"
                data-testid="change-password-btn"
                onClick={() => {
                  displayNotifications(
                    "Not Supported",
                    "The action you have requested is not available at this time",
                    "red"
                  );
                }}
                variant="default"
              >
                Change
              </Button>
            </Flex>
          </Card>
        </Box>
        <Box py="md" w="100%">
          <Card
            p="lg"
            radius="lg"
            shadow="sm"
            style={{ borderColor: "red" }}
            w="100%"
            withBorder
          >
            <Flex align="center" justify="space-between">
              <div>
                <Text c="red" data-testid="delete-account-text" fw={600}>
                  Delete Account
                </Text>
                <Text c="dimmed" data-testid="delete-account-subtext" size="sm">
                  Permanently delete your account and all data
                </Text>
              </div>
              <Button
                color="red"
                data-testid="delete-account-btn"
                onClick={() => {
                  displayNotifications(
                    "Failed Action",
                    "Where do you think you're going. Jk this functionality isn't available yet",
                    "red"
                  );
                }}
                variant="filled"
              >
                Delete
              </Button>
            </Flex>
          </Card>
        </Box>
        <Flex gap="sm" justify="flex-end">
          <Button
            form="profile-form"
            leftSection={<IconDeviceFloppy size={24} />}
            type="submit"
          >
            Save Changes
          </Button>
        </Flex>
      </Card>
    </Box>
  );
};
