import { fireEvent, screen } from '@testing-library/react';
import { useLoaderData, useSubmit } from 'react-router';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import {
  FRIENDS_NO_REQUESTS,
  FRIENDS_PENDING,
  FRIENDS_SENT_REQUEST,
} from '~/constants';
import { userInfo } from '~/store';
import { render } from '~/utilities/testing';
import type { LoaderData } from './FriendRequest';
import { FriendRequest } from './FriendRequest';

// Mock Mantine components
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

// Mock react-router
vi.mock('react-router', () => ({
  Form: ({
    onSubmit,
    children,
    method,
  }: {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    children: React.ReactNode;
    method: string;
  }) => (
    <form data-testid='form' method={method} onSubmit={onSubmit}>
      {children}
    </form>
  ),
  useLoaderData: vi.fn(),
  useSubmit: vi.fn(),
}));

// Mock store and avatar
vi.mock('~/store', () => ({ userInfo: vi.fn() }));
vi.mock('../Avatar/Avatar', () => ({
  Avatar: ({ name }: { name: string }) => (
    <div data-testid='avatar'>{name}</div>
  ),
}));

describe('FriendRequest Component', () => {
  const mockSubmit = vi.fn();
  const mockUserId = 'user123';

  const mockedUseSubmit = useSubmit as unknown as Mock;
  const mockedUseLoaderData = useLoaderData as unknown as Mock;
  const mockedUserInfo = userInfo as unknown as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSubmit.mockReturnValue(mockSubmit);
    mockedUserInfo.mockReturnValue({ userId: mockUserId });
  });

  const sampleFriend = {
    bio: 'Testing bio',
    email: 'jane@example.com',
    full_name: 'Jane Doe',
    user_id: 'friend1',
  };

  const sampleData: LoaderData = {
    data: {
      pendingFriendships: { friends: [sampleFriend] },
      receivedRequestsProfile: [{ profile: { data: sampleFriend } }],
      requestProfile: [{ profile: { data: sampleFriend } }],
    },
  };

  it('renders received and sent requests correctly', () => {
    mockedUseLoaderData.mockReturnValue(sampleData);

    render(<FriendRequest />);

    expect(screen.getByText('RECEIVED REQUESTS')).toBeInTheDocument();
    expect(screen.getByText('SENT REQUESTS')).toBeInTheDocument();

    // Multiple "Jane Doe" appear (Avatar + Text)
    const nameElements = screen.getAllByText('Jane Doe');
    expect(nameElements.length).toBeGreaterThan(0);

    expect(screen.getAllByText('Testing bio').length).toBeGreaterThan(0);
    expect(screen.getByText(FRIENDS_SENT_REQUEST)).toBeInTheDocument();
    expect(screen.getByText(FRIENDS_PENDING)).toBeInTheDocument();
    expect(screen.getAllByTestId('avatar').length).toBeGreaterThan(0);
  });
  it('renders FRIENDS_NO_REQUESTS text when lists are empty', () => {
    const emptyData: LoaderData = {
      data: {
        pendingFriendships: { friends: [] },
        receivedRequestsProfile: [],
        requestProfile: [],
      },
    };

    mockedUseLoaderData.mockReturnValue(emptyData);

    render(<FriendRequest />);
    const emptyTexts = screen.getAllByText(FRIENDS_NO_REQUESTS);
    expect(emptyTexts.length).toBe(2);
  });

  it('calls submit when accepting a request', () => {
    mockedUseLoaderData.mockReturnValue(sampleData);
    render(<FriendRequest />);

    const forms = screen.getAllByTestId('form');
    const acceptForm = forms[0];
    fireEvent.submit(acceptForm);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    const formDataArg = mockSubmit.mock.calls[0][0] as FormData;
    expect(formDataArg.get('to_user')).toBe(mockUserId);
    expect(formDataArg.get('from_user')).toBe('friend1');
  });

  it('calls submit when rejecting a request', () => {
    mockedUseLoaderData.mockReturnValue(sampleData);
    render(<FriendRequest />);

    const forms = screen.getAllByTestId('form');
    const rejectForm = forms[1];
    fireEvent.submit(rejectForm);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    const formDataArg = mockSubmit.mock.calls[0][0] as FormData;
    expect(formDataArg.get('to_user')).toBe(mockUserId);
    expect(formDataArg.get('from_user')).toBe('friend1');
  });

  it('renders dynamic scroll content', () => {
    mockedUseLoaderData.mockReturnValue(sampleData);
    render(<FriendRequest />);

    const scrollAreas = screen.getAllByTestId('scroll-area');
    expect(scrollAreas.length).toBeGreaterThan(0);
  });
});
