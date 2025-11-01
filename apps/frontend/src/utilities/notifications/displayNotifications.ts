import { notifications } from '@mantine/notifications';

export function displayNotifications(
  title: string,
  message: string,
  color: string,
) {
  notifications.show({
    color: color,
    message: message,
    title: title,
  });
}
