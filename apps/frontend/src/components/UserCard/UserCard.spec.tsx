const mockLoaderData = {
  data: {
    badges: {
      allBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
        {
          description: 'Study for a total of 30 minutes',
          earnedAt: '2025-11-21',
          name: 'Half Hour Hero',
        },
        {
          description: 'Study for a total of 1 hour',
          earnedAt: '2025-11-21',
          name: 'Hour Hero',
        },
      ],
      unlockedBadges: [
        {
          description: 'Completed 5 sessions',
          earnedAt: '2025-01-01',
          name: '5 Sessions',
        },
        {
          description: 'Total 3 hours',
          earnedAt: '2025-01-02',
          name: '3 Hours',
        },
        {},
      ],
    },
    profileBio: { data: { bio: 'This is my Bio' } },
    sessionSummary: { sessionsLogged: 0, totalMinutesStudied: 0 },
  },
  error: false,
};
// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useLoaderData: () => mockLoaderData,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('~/store', () => {
  return {
    userInfo: {
      getState: () => ({
        avatarState: 'online',
        bio: '',
        email: 'testUser@gmail.com',
        name: 'Test User',
        setBio: vi.fn(),
        setEmail: vi.fn(),
        setName: vi.fn(),
      }),
    },
  };
});

import { fireEvent, screen } from '@testing-library/react';
import fetchPolyfill, { Request as RequestPolyfill } from 'node-fetch';
import { describe, expect, it, vi } from 'vitest';
import { SETTINGS } from '~/constants';
import { NavbarProvider } from '~/context';
import { render } from '~/utilities/testing';
import { UserCard } from './UserCard';

//Lines 43 - 52 were provided through an online github repo (https://github.com/reduxjs/redux-toolkit/issues/4966#issuecomment-3115230061) as solution to the error:
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

describe('User Card tests', () => {
  it('displays all elements', async () => {
    render(
      <NavbarProvider>
        <UserCard />
      </NavbarProvider>,
    );

    const nameField = await screen.findByTestId('name-text');
    const emailField = await screen.findByTestId('email-text');
    const bioField = await screen.findByTestId('bio-text');
    const editBtn = await screen.findByTestId('edit-btn');
    const shareBtn = await screen.findByTestId('share-btn');
    const avatarComponent = await screen.findByTestId('avatar');
    const statusDot = screen.getByTestId('status-dot');

    expect(nameField).toHaveTextContent('Test User');
    expect(emailField).toHaveTextContent('testUser@gmail.com');
    expect(bioField).toHaveTextContent('This is my Bio');
    expect(editBtn).toHaveTextContent('Edit');
    expect(shareBtn).toHaveTextContent('Share');
    expect(avatarComponent).toBeInTheDocument();
    expect(statusDot).toBeInTheDocument();
  });
  it('naviagtes to settings when edit button is clicked', () => {
    render(
      <NavbarProvider>
        <UserCard />
      </NavbarProvider>,
    );
    fireEvent.click(screen.getByTestId('edit-btn'));
    expect(mockNavigate).toHaveBeenCalledWith(SETTINGS);
  });
  it('displays the result from the fetch bio api call in the bio field', () => {
    render(
      <NavbarProvider>
        <UserCard />
      </NavbarProvider>,
    );
  });
});
