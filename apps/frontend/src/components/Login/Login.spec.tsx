vi.mock('~/store/userInfo', () => ({
  userInfo: {
    getState: () => ({
      setAccessToken: vi.fn(),
      setEmail: vi.fn(),
      setId: vi.fn(),
      setName: vi.fn(),
      setRefreshToken: vi.fn(),
    }),
  },
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { LoginForm } from './Login';
import '@testing-library/jest-dom';
import { notifications } from '@mantine/notifications';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider, redirect } from 'react-router-dom';
import * as auth from '~/api/auth';
import { FORGOT_PASSWORD, LOGIN, SIGNUP, STUDY } from '~/constants';
import { loginAction } from '~/routes/login';
import { render } from '~/utilities/testing';

//Lines 15 - 24 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
//RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal.
Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
  // MSW will overwrite this to intercept requests
  writable: true,
});

Object.defineProperty(global, 'Request', {
  value: RequestPolyfill,
  writable: false,
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

vi.mock('~/api/auth', () => ({
  login: vi.fn(),
}));

const router = createMemoryRouter([
  { action: loginAction, element: <LoginForm />, path: LOGIN },
]);

describe('Login Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Shows email and password fields', () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('Shows an error if invalid email is provided', async () => {
    render(<RouterProvider router={router} />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalidemail' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '0106Abcd' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(notifications.show).toHaveBeenCalledWith({
      color: 'red',
      message: 'Provide a valid email',
      title: 'Mismatch',
    });
  });

  it('Navigates to /study after successful login', async () => {
    (auth.login as Mock).mockResolvedValue({
      data: {
        data: {
          session: { access_token: 'abc123' },
          user: {
            email: 'testuser@gmail.com',
            full_name: 'test user',
            id: '1',
          },
        },
      },
      error: null,
    });
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const req = new Request('http://localhost/', {
      body: formData,
      method: 'POST',
    });

    const result = await loginAction({
      context: {},
      params: {},
      request: req,
    });

    expect(result).toEqual(redirect(STUDY));
  });

  it('Navigates to forgot password page', () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByText(/Forgot password\?/i));
    expect(mockNavigate).toHaveBeenCalledWith(FORGOT_PASSWORD);
  });

  it('Navitates to signup page', () => {
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(mockNavigate).toHaveBeenCalledWith(SIGNUP);
  });

  it('shows error on invalid credentials', async () => {
    (auth.login as Mock).mockResolvedValue({
      error: { message: 'Invalid login credentials', status: 401 },
    });

    render(<RouterProvider router={router} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword',
      );
    });

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith({
        color: 'red',
        message: 'Invalid Credentials',
        title: 'Login Error',
      });
    });
  });
});
