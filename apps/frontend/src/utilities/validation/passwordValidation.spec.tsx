import { describe, it, expect } from 'vitest';
import { equalPasswords } from './passwordValidation';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { notifications } from '@mantine/notifications';
import { SignUpForm } from '~/components';

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('Password Validation Tests', () => {
  it('returns true for equal passwords (boundary testing length = 8)', () => {
    expect(equalPasswords('Pass123*', 'Pass123*')).toBe(true);
  });

  it('returns false for different passwords', () => {
    expect(equalPasswords('Pass123*', 'Pass1234*')).toBe(false);
    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Mismatch',
      message: 'Passwords do not match',
      color: 'red',
    });
  });
  it('returns weak password for no lowercase letters', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>,
    );
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i,
    );
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'PASSWORD123*' } }); // all uppercase
    fireEvent.change(password_2, { target: { value: 'PASSWORD123*' } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Weak Password',
      message: 'Password must contain a lowercase letter',
      color: 'red',
    });
  });

  it('returns weak password for no uppercase letters', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>,
    );
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i,
    );
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password12*' } }); // all uppercase
    fireEvent.change(password_2, { target: { value: 'password12*' } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Weak Password',
      message: 'Password must contain an uppercase letter',
      color: 'red',
    });
  });
  it('returns weak password for no special characters', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>,
    );
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i,
    );
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password12' } }); // all uppercase
    fireEvent.change(password_2, { target: { value: 'Password12' } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Weak Password',
      message: 'Password must contain a special character',
      color: 'red',
    });
  });
  it('returns weak password for no digits', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>,
    );
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i,
    );
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password*' } }); // all uppercase
    fireEvent.change(password_2, { target: { value: 'Password*' } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Weak Password',
      message: 'Password must contain a number',
      color: 'red',
    });
  });
  it('returns weak password for length less than 8 (boundary testing 7)', () => {
    render(
      <MemoryRouter>
        <MantineProvider>
          <SignUpForm />
        </MantineProvider>
      </MemoryRouter>,
    );
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/create password/i);
    const password_2 = screen.getByLabelText(/confirm password/i);
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i,
    );
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Pass12*' } }); // all uppercase
    fireEvent.change(password_2, { target: { value: 'Pass12*' } });
    fireEvent.click(checkbox);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(notifications.show).toHaveBeenCalledWith({
      title: 'Weak Password',
      message: 'Password must be longer than 8 characters',
      color: 'red',
    });
  });
});
