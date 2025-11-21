const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}));

vi.mock('~/utilities/requests/requests', () => ({
  request: requestMock,
}));

vi.mock('~/store/userInfo', () => ({
  userInfo: {
    getState: vi.fn(() => ({
      userId: mockUserId,
    })),
  },
}));

import { describe, expect, it, vi } from 'vitest';
import { mockFetchLeaderboardsPath, mockUserId } from '~/mocks';
import { RequestMethods } from '~/types';
import { fetchLeaderboards } from './leaderboard';

describe('leaderboards', () => {
  it('fetchLeaderboards runs and calls request properly', async () => {
    await fetchLeaderboards();
    expect(requestMock).toHaveBeenCalledWith(
      RequestMethods.GET,
      mockFetchLeaderboardsPath,
    );
  });
});
