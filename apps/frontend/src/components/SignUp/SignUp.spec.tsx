// mock useNavigate
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

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, type Mock } from 'vitest';
import { SignUpForm } from './SignUp';
import '@testing-library/jest-dom';
import { notifications } from '@mantine/notifications';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider, redirect } from 'react-router-dom';
import { vi } from 'vitest';
import * as signupAuth from '~/api/auth';
import { SignUpAction } from '~/routes';
import { render } from '~/utilities/testing';

Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
  // MSW will overwrite this to intercept requests
  writable: true,
});

Object.defineProperty(global, 'Request', {
  value: RequestPolyfill,
  writable: false,
});

const router = createMemoryRouter([
  { action: SignUpAction, element: <SignUpForm />, path: '/' },
]);

vi.mock('~/api/auth', () => ({
  signUp: vi.fn(),
}));

describe('Sign up activity', () => {
  it('Shows email and password fields', () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create Password/i)).toBeInTheDocument();
  });
  it('Shows an error if invalid email is provided', async () => {
    render(<RouterProvider router={router} />);
    const nameInput = screen.getByLabelText(/full name/i);
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/Create Password/i);
    const password_2 = screen.getByLabelText(/Confirm Password/i);
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    const checkbox = screen.getByLabelText(
      /I agree to the Terms and Conditions/i,
    );
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(email, { target: { value: 'invalidemail' } });
    fireEvent.change(password, { target: { value: '0106Abcd' } });
    fireEvent.change(password_2, { target: { value: '0106Abcd' } });
    fireEvent.click(checkbox);
    fireEvent.click(signUpButton);
    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message: 'Provide a valid Email',
      title: 'Mismatch',
    });
  });

  it('navigates to home page (/study) after successful signup', async () => {
    (signupAuth.signUp as Mock).mockResolvedValue({ data: { user: {} } });
    const form = new FormData();
    form.append('email', 'test@example.com');
    form.append('password', 'password123');
    form.append('name', 'dummyUser');
    const req = new Request('http://localhost/signup', {
      body: form,
      method: 'POST',
    });
    const result = await SignUpAction({
      context: {},
      params: {},
      request: req,
    });
    expect(result).toEqual(redirect('/study'));
  });
});
