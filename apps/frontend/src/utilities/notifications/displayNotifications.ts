import { notifications } from '@mantine/notifications';

export const displayNotifications = (
  title: string,
  message: string,
  color: string,
) => {
  notifications.show({
    color: color,
    message: message,
    title: title,
  });
};
