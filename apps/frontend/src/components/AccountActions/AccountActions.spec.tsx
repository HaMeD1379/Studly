vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { notifications } from '@mantine/notifications';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '~/utilities/testing';
import { AccountActions } from './AccountActions';

describe('Account Actions Test', () => {
  it('renders all the components', () => {
    render(<AccountActions />);
    expect(screen.getByTestId(/account-actions-text/i)).toBeInTheDocument();
    expect(screen.getByTestId(/change-password-text/i)).toBeInTheDocument();
    expect(screen.getByTestId(/change-password-subtext/i)).toBeInTheDocument();
    expect(screen.getByTestId(/change-password-btn/i)).toBeInTheDocument();
    expect(screen.getByTestId(/delete-account-text/i)).toBeInTheDocument();
    expect(screen.getByTestId(/delete-account-subtext/i)).toBeInTheDocument();
    expect(screen.getByTestId(/delete-account-btn/i)).toBeInTheDocument();
  });
  it('displays a notification when delete account button is clicked', () => {
    render(<AccountActions />);
    const delete_btn = screen.getByTestId(/delete-account-btn/i);
    fireEvent.click(delete_btn);
    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message:
        "Where do you think you're going. Jk this functionality isn't available yet",
      title: 'Failed Action',
    });
  });
});
