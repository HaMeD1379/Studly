import { notifications } from '@mantine/notifications';
import { describe, expect, it, vi } from 'vitest';
import { displayNotifications } from './displayNotifications';

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('Display Notifications Tests', () => {
  it('diplays a notification', () => {
    displayNotifications(
      'Weak Password',
      'Password must be longer than 8 characters',
      'red',
    );
    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message: 'Password must be longer than 8 characters',
      title: 'Weak Password',
    });
  });
});
