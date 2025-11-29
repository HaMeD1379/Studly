import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { FRIENDS_TAB_REQUESTS } from '~/constants';
import { render } from '~/utilities/testing';
import { Friends } from './Friends';

vi.mock('@mantine/core', async () => {
  const actual =
    await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
  return {
    ...actual,
    Container: ({ children }: { children: React.ReactNode }) => (
      <div data-testid='container'>{children}</div>
    ),
  };
});

vi.mock('~/components', () => ({
  FindFriends: vi.fn(({ results }: { results: unknown }) => (
    <div data-testid='find-friends'>FindFriends {JSON.stringify(results)}</div>
  )),
  FriendRequest: vi.fn(() => <div data-testid='friend-request'>Request</div>),
  FriendsHeader: vi.fn(() => <div data-testid='friends-header'>Header</div>),
  FriendsStatus: vi.fn(() => <div data-testid='friends-status'>Status</div>),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useActionData: vi.fn(),
    useRevalidator: vi.fn(),
  };
});

import { useActionData, useRevalidator } from 'react-router-dom';
import { FriendsHeader } from '~/components';

describe('Friends Component', () => {
  const mockUseActionData = useActionData as unknown as Mock;
  const mockUseRevalidator = useRevalidator as unknown as Mock;
  const mockRevalidate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRevalidator.mockReturnValue({ revalidate: mockRevalidate });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the friends tab view by default', () => {
    mockUseActionData.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('friends-header')).toBeInTheDocument();
    expect(screen.getByTestId('friends-status')).toBeInTheDocument();
    expect(screen.queryByTestId('friend-request')).not.toBeInTheDocument();
  });

  it('renders FriendRequest when requests tab selected', () => {
    mockUseActionData.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>,
    );

    const requestsTab = screen.getByText(FRIENDS_TAB_REQUESTS);
    fireEvent.click(requestsTab);

    expect(screen.getByTestId('friend-request')).toBeInTheDocument();
    expect(screen.queryByTestId('friends-status')).not.toBeInTheDocument();
  });

  it('renders FindFriends when search results are returned', () => {
    mockUseActionData.mockReturnValue({
      data: { results: [{ full_name: 'Jane', user_id: '1' }] },
      formtype: 'searchFriends',
    });

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('find-friends')).toBeInTheDocument();

    const calls = (FriendsHeader as Mock).mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({ isHidden: false });
  });

  it('calls revalidator.revalidate when refresh icon clicked', () => {
    mockUseActionData.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>,
    );

    const refreshButton = screen.getByRole('button');
    fireEvent.click(refreshButton);

    expect(mockRevalidate).toHaveBeenCalled();
  });

  it('renders FriendsHeader with isHidden=true when not searching', () => {
    mockUseActionData.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <Friends />
      </MemoryRouter>,
    );

    const calls = (FriendsHeader as Mock).mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({ isHidden: true });
  });
});
