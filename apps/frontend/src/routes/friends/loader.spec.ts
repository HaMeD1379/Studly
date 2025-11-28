import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { loader } from './loader';

vi.mock('~/api', () => ({
  findUserById: vi.fn(),
  getAllFriends: vi.fn(),
  getFriendRequestCount: vi.fn(),
  getFriendsCount: vi.fn(),
  receivedFriendRequest: vi.fn(),
  viewFriendRequests: vi.fn(),
}));

import {
  findUserById,
  getAllFriends,
  getFriendRequestCount,
  getFriendsCount,
  receivedFriendRequest,
  viewFriendRequests,
} from '~/api';

vi.mock('~/store', () => ({
  userInfo: {
    getState: () => ({ userId: 'user-1' }),
  },
}));

describe('loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads friends and request profiles correctly', async () => {
    (getFriendsCount as Mock).mockResolvedValue({
      data: { count: 3 },
      error: false,
    });
    (getFriendRequestCount as Mock).mockResolvedValue({
      data: { count: 2 },
      error: false,
    });
    (getAllFriends as Mock).mockResolvedValue({
      data: { data: { friends: [{ to_user: '2' }] } },
      error: false,
    });
    (viewFriendRequests as Mock).mockResolvedValue({
      data: { data: { friends: [{ to_user: '3' }] } },
      error: false,
    });
    (receivedFriendRequest as Mock).mockResolvedValue({
      data: {
        data: {
          pending_requests: [{ from_user: 'user-1', to_user: '4' }],
          user_id: 'user-1',
        },
      },
      error: false,
    });
    (findUserById as Mock).mockResolvedValue({
      data: { bio: 'Hi', email: 'john@test.com', full_name: 'John' },
    });

    const result = await loader();

    expect(result.error).toBe(false);
    expect(result.data.friendCount).toEqual({ count: 3 });
    expect(result.data.requestCount).toEqual({ count: 2 });
    expect(result.data.friendsProfile).toHaveLength(1);
    expect(result.data.requestProfile).toHaveLength(1);
    expect(result.data.receivedRequestsProfile).toHaveLength(1);
  });

  it('handles API errors', async () => {
    (getFriendsCount as Mock).mockResolvedValue({ error: true });
    (getFriendRequestCount as Mock).mockResolvedValue({ error: true });
    (getAllFriends as Mock).mockResolvedValue({ error: true });
    (viewFriendRequests as Mock).mockResolvedValue({ error: true });
    (receivedFriendRequest as Mock).mockResolvedValue({ error: true });

    const result = await loader();

    expect(result.error).toBe(true);
  });
});
