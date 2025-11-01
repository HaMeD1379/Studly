import { displayNotifications } from './displayNotifications';
import { describe, it, expect } from 'vitest';
import { notifications } from '@mantine/notifications';
import { vi } from 'vitest';

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
      title: 'Weak Password',
      message: 'Password must be longer than 8 characters',
      color: 'red',
    });
  });
});
