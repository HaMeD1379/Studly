import { MantineThemeColors } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export function displayNotifications(title: String, message: String, color: string) {
    notifications.show({
      title: title,
      message: message,
      color: color,
    });
}