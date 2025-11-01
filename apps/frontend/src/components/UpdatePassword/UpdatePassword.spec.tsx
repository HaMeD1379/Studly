const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '~/utilities/testing';
import { vi } from 'vitest';
import { notifications } from '@mantine/notifications';
import { UpdatePassword } from './UpdatePassword';

describe('Update Password tests', () => {
  it('Shows email and password fields and update password buttons', () => {
    render(<UpdatePassword />);
    expect(screen.getByLabelText(/Enter new Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
  });
  it('navigates to study if change is successful', async () => {
    render(<UpdatePassword />);
    const password = screen.getByLabelText(/Enter New Password/i);
    const password_2 = screen.getByLabelText(/Confirm New Password/i);
    const updatePassButton = screen.getByRole('button', {
      name: /Update password/i,
    });

    fireEvent.change(password, { target: { value: '0106Abcd*' } });
    fireEvent.change(password_2, { target: { value: '0106Abcd*' } });
    fireEvent.click(updatePassButton);
    expect(mockNavigate).toHaveBeenCalledWith('/study');
  });
  it('Shows an error if new password is not valid', async () => {
    render(<UpdatePassword />);
    const password = screen.getByLabelText(/enter New Password/i);
    const password_2 = screen.getByLabelText(/Confirm New Password/i);
    const updatePassButton = screen.getByRole('button', {
      name: /Update password/i,
    });

    fireEvent.change(password, { target: { value: '0106Abcd' } });
    fireEvent.change(password_2, { target: { value: '0106Abcd' } });
    fireEvent.click(updatePassButton);
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Weak Password',
      message: 'Password must contain a special character',
      color: 'red',
    });
  });
  it('Shows an error if new passwords do not match (edge case testing one of the passwords is valid)', async () => {
    render(<UpdatePassword />);
    const password = screen.getByLabelText(/enter New Password/i);
    const password_2 = screen.getByLabelText(/Confirm New Password/i);
    const updatePassButton = screen.getByRole('button', {
      name: /Update password/i,
    });

    fireEvent.change(password, { target: { value: '0106Abcd' } });
    fireEvent.change(password_2, { target: { value: '0106Abcd*' } });
    fireEvent.click(updatePassButton);
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Mismatch',
      message: 'Passwords do not match',
      color: 'red',
    });
  });
});
