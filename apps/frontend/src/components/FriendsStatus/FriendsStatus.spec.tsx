import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import {
  FRIENDS_SEARCH_TO_FIND_A_FRIENDS,
  FRIENDS_VIEW_PROFILE,
} from '~/constants';
import { render } from '~/utilities/testing';
import { FriendsStatus } from './FriendsStatus';

// --- Mock Mantine components with simple replacements for layout ---
vi.mock('@mantine/core', async () => {
  const actual =
    await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
  return {
    ...actual,
    ScrollArea: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='scroll-area'>{children}</div>
    ),
  };
});

// --- Mock Avatar ---
vi.mock('../Avatar/Avatar', () => ({
  Avatar: ({ name }: { name: string }) => (
    <div data-testid='avatar'>{name}</div>
  ),
}));

// --- Mock useLoaderData safely ---
vi.mock('react-router', () => ({
  useLoaderData: vi.fn(),
}));

import { useLoaderData } from 'react-router';

describe('FriendsStatus', () => {
  const mockUseLoaderData = useLoaderData as unknown as Mock;

  const sampleFriend = {
    bio: 'Friendly tester',
    email: 'jane@example.com',
    full_name: 'Jane Doe',
    user_id: 'friend-1',
  };

  const populatedData = {
    data: {
      friendsList: { friends: [sampleFriend] },
      friendsProfile: [
        {
          profile: { data: sampleFriend },
        },
      ],
      receivedRequestsProfile: [],
    },
  };

  const emptyData = {
    data: {
      friendsList: { friends: [] },
      friendsProfile: [],
      receivedRequestsProfile: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no friends', () => {
    mockUseLoaderData.mockReturnValue(emptyData);

    render(
      <MemoryRouter>
        <FriendsStatus />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(FRIENDS_SEARCH_TO_FIND_A_FRIENDS),
    ).toBeInTheDocument();
  });

  it('renders friend card with name, bio, avatar, and buttons', () => {
    mockUseLoaderData.mockReturnValue(populatedData);

    render(
      <MemoryRouter>
        <FriendsStatus />
      </MemoryRouter>,
    );

    // Avatar
    expect(screen.getByTestId('avatar')).toHaveTextContent('Jane Doe');

    // Friend name and bio
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
    expect(screen.getByText('Friendly tester')).toBeInTheDocument();

    // Buttons
    expect(screen.getByText(FRIENDS_VIEW_PROFILE)).toBeInTheDocument();

    // Icon button (message icon)
    const iconButtons = screen.getAllByRole('button');
    expect(iconButtons.length).toBeGreaterThanOrEqual(2);

    // ScrollArea present
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('renders fallback bio when missing', () => {
    const noBioData = {
      data: {
        friendsList: { friends: [] },
        friendsProfile: [
          {
            profile: {
              data: {
                bio: undefined,
                email: 'john@example.com',
                full_name: 'John Doe',
                user_id: 'friend-2',
              },
            },
          },
        ],
        receivedRequestsProfile: [],
      },
    };

    mockUseLoaderData.mockReturnValue(noBioData);

    render(
      <MemoryRouter>
        <FriendsStatus />
      </MemoryRouter>,
    );

    expect(screen.getByText('No bio provided')).toBeInTheDocument();
  });
});
