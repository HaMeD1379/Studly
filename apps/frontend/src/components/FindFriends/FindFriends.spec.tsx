import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import {
  FRIENDS_REQUESTED,
  FRIENDS_SEARCH_NO_USERS,
  FRIENDS_VIEW_PROFILE,
} from '~/constants';
import { render } from '~/utilities/testing';
import { FindFriends } from './FindFriends';

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

vi.mock('../Avatar/Avatar', () => ({
  Avatar: ({ name }: { name: string }) => (
    <div data-testid='avatar'>{name}</div>
  ),
}));

vi.mock('~/store', () => ({
  userInfo: vi.fn(() => ({ userId: 'current-user' })),
}));

vi.mock('react-router', () => {
  return {
    Form: ({
      onSubmit,
      children,
      method,
    }: {
      onSubmit: React.FormEventHandler<HTMLFormElement>;
      children: React.ReactNode;
      method: string;
    }) => (
      <form method={method} onSubmit={onSubmit}>
        {children}
      </form>
    ),
    useLoaderData: vi.fn(),
    useSubmit: vi.fn(() => vi.fn()),
  };
});

import { useLoaderData, useSubmit } from 'react-router';
import { userInfo } from '~/store';

describe('FindFriends Component', () => {
  const mockUseLoaderData = useLoaderData as unknown as Mock;
  const mockUseSubmit = useSubmit as unknown as Mock;
  const mockUserInfo = userInfo as unknown as Mock;

  const baseFriend = {
    bio: 'Hello world',
    email: 'jane@example.com',
    full_name: 'Jane Doe',
    user_id: 'user-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserInfo.mockReturnValue({ userId: 'current-user' });
    mockUseSubmit.mockReturnValue(vi.fn());
  });

  it('renders empty state when no results', () => {
    mockUseLoaderData.mockReturnValue({
      data: {
        friendsList: { friends: [] },
        pendingFriendships: { friends: [] },
      },
    });

    render(
      <MemoryRouter>
        <FindFriends results={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(FRIENDS_SEARCH_NO_USERS)).toBeInTheDocument();
  });

  it('renders add friend button when user is not a friend or requested', () => {
    mockUseLoaderData.mockReturnValue({
      data: {
        friendsList: { friends: [] },
        pendingFriendships: { friends: [] },
      },
    });

    render(
      <MemoryRouter>
        <FindFriends results={[baseFriend]} />
      </MemoryRouter>,
    );

    // Avatar, name, bio
    expect(screen.getByTestId('avatar')).toHaveTextContent('Jane Doe');
    expect(screen.getByText('Hello world')).toBeInTheDocument();

    // Add friend button
    const addButtons = screen.getAllByRole('button');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('renders FRIENDS_REQUESTED text when user has already been requested', () => {
    mockUseLoaderData.mockReturnValue({
      data: {
        friendsList: { friends: [] },
        pendingFriendships: { friends: [{ to_user: 'user-1' }] },
      },
    });

    render(
      <MemoryRouter>
        <FindFriends results={[baseFriend]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(FRIENDS_REQUESTED)).toBeInTheDocument();
  });

  it('renders message and view profile buttons when already friends', () => {
    mockUseLoaderData.mockReturnValue({
      data: {
        friendsList: { friends: [{ to_user: 'user-1' }] },
        pendingFriendships: { friends: [] },
      },
    });

    render(
      <MemoryRouter>
        <FindFriends results={[baseFriend]} />
      </MemoryRouter>,
    );

    expect(screen.getByText(FRIENDS_VIEW_PROFILE)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('calls submit() when add friend button form is submitted', () => {
    const mockSubmit = vi.fn();
    mockUseSubmit.mockReturnValue(mockSubmit);

    mockUseLoaderData.mockReturnValue({
      data: {
        friendsList: { friends: [] },
        pendingFriendships: { friends: [] },
      },
    });

    render(
      <MemoryRouter>
        <FindFriends results={[baseFriend]} />
      </MemoryRouter>,
    );

    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);

    // simulate form submission
    expect(mockSubmit).toHaveBeenCalled();
  });
});
