const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => mockNavigate,
  };
});
const mockAction = vi.fn(() => null);

import { act, fireEvent, screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { createMemoryRouter, RouterProvider, redirect } from 'react-router-dom';
import { describe, expect, it, type Mock, vi } from 'vitest';
import * as logoutApi from '~/api/auth';
import { logoutAction } from '~/routes';
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
    { action: mockAction, element: <Navbar>MOCK_CHILDREN</Navbar>, path: '/' },
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
    expect(screen.getByText('MOCK_CHILDREN')).not.toBeNull();
  });

  it('navigations are called to the proper route', async () => {
    render(<RouterProvider router={router} />);

    const homeButton = screen.getByRole('button', { name: 'Home' });
    const studySessionButton = screen.getByRole('button', {
      name: 'Study Session',
    });
    const badgesButton = screen.getByRole('button', { name: 'Badges' });
    const logoutButton = screen.getByRole('button', { name: 'Logout' });

    await act(async () => {
      fireEvent.click(homeButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/home');
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(studySessionButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/study');
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(badgesButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/badges');
    mockNavigate.mockClear();

    await act(async () => {
      fireEvent.click(logoutButton);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  it('navigates to the login page when logout button is clicked', async () => {
    // Arrange: mock API and localStorage
    (logoutApi.logout as Mock).mockResolvedValue({
      data: {},
      message: 'Logout successful',
    });
    localStorage.setItem('accessToken', 'abc123');

    // Act: call the action
    const result = await logoutAction();

    // Assert: redirect and localStorage cleared inside the action
    expect(result).toEqual(redirect('/'));
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});
