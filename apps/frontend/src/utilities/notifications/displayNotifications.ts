import { notifications } from '@mantine/notifications';

export function displayNotifications(
	title: string,
	message: string,
	color: string,
) {
	notifications.show({
		title: title,
		message: message,
		color: color,
	});
}
