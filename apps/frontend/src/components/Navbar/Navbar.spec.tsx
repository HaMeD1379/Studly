const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLocation: () => ({ pathname: LOGIN }),
    useNavigate: () => mockNavigate,
  };
});

const mockSetAccessToken = vi.fn();

vi.mock('~/store', () => ({
  userInfo: {
    getState: () => ({
      accessToken: mockAccessToken,
      setAccessStored: vi.fn(),
      setAccessToken: mockSetAccessToken,
      setCheckAccess: vi.fn(),
    }),
  },
}));

import { act, fireEvent, screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider, redirect } from 'react-router-dom';
import { describe, expect, it, type Mock, vi } from 'vitest';
import * as logoutApi from '~/api/auth';
import {
  BADGES,
  FRIENDS,
  HOME,
  LOGIN,
  PROFILE,
  SETTINGS,
  STUDY,
} from '~/constants';
import { mockAccessToken } from '~/mocks';
import { logoutAction } from '~/routes/logout';
import { render } from '~/utilities/testing';
import { Navbar } from './Navbar';

Object.defineProperty(global, 'fetch', {
  value: fetchPolyfill,
  // MSW will overwrite this to intercept requests
  writable: true,
});

Object.defineProperty(global, 'Request', {
  value: RequestPolyfill,
  writable: false,
});
vi.mock('~/api/auth', () => ({
  logout: vi.fn(),
}));
describe('Navbar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  const router = createMemoryRouter([
    {
      children: [{ element: <div>MOCK_CHILDREN</div> }],
      element: <Navbar />,
      path: LOGIN,
    },
  ]);

  it('renders all navigations', () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Studly')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Home' })).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Study Session' }),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Badges' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Logout' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Profile' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Settings' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Friends' })).not.toBeNull();
  });

  it('navigations are called to the proper route', async () => {
    render(<RouterProvider router={router} />);

    const homeButton = screen.getByRole('button', { name: 'Home' });
    const studySessionButton = screen.getByRole('button', {
      name: 'Study Session',
    });
    const badgesButton = screen.getByRole('button', { name: 'Badges' });
    const friendsButton = screen.getByRole('button', { name: 'Friends' });
    const profileButton = screen.getByRole('button', { name: 'Profile' });
    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    await act(async () => {
      fireEvent.click(homeButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith(HOME);
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(studySessionButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith(STUDY);
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(badgesButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith(BADGES);
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(friendsButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith(FRIENDS);
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(profileButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith(PROFILE);
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(settingsButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS);
    mockNavigate.mockClear();
  });

  it('navigates to the login page when logout button is clicked', async () => {
    (logoutApi.logout as Mock).mockResolvedValue({
      data: {},
      message: 'Logout successful',
    });

    const result = await logoutAction();

    expect(result).toEqual(redirect(LOGIN));
    expect(mockSetAccessToken).toHaveBeenCalledWith('');
  });
});
