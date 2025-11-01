vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  ...vi.importActual('react-router'),
  useNavigate: () => mockNavigate,
}));

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForgotPassword } from './ForgotPassword';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { vi } from 'vitest';

describe('Sign up activity', () => {
  it('Shows email and password fields', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/Your email/i)).toBeInTheDocument();
  });
  it('shows a notification for an invalid email', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/Your email/i);
    const forgotButton = screen.getByRole('button', {
      name: /Reset password/i,
    });
    fireEvent.change(emailInput, { target: { value: 'invalidEmail' } });
    fireEvent.click(forgotButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Mismatch',
      message: 'Provide a valid Email',
      color: 'red',
    });
  });
  it('shows success notification and navigates on valid email', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/Your email/i);
    const forgotButton = screen.getByRole('button', {
      name: /Reset password/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(forgotButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Accepted',
      message: 'A reset link has been sent to your email',
      color: 'green',
    });
  });
  it('navigates to home when clicking the back arrow', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>,
    );

    const backArrow = screen.getByTestId('back-arrow');
    fireEvent.click(backArrow);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('Show provide a valid email notification if email field is empty', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <ForgotPassword />
        </MantineProvider>
      </MemoryRouter>,
    );

    const forgotButton = screen.getByRole('button', {
      name: /Reset password/i,
    });
    fireEvent.click(forgotButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Missing Field',
      message: 'Provide a valid Email',
      color: 'red',
    });
  });
});
