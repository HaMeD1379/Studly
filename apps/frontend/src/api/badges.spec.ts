const { requestMock, getUserIdMock } = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  requestMock: vi.fn(),
}));

vi.mock('~/utilities/requests/requests', () => ({
  request: requestMock,
}));

vi.mock('~/store/userInfoStore', () => ({
  userInfoStore: {
    getState: vi.fn(() => ({
      userId: mockUserId,
    })),
  },
}));

import { describe, expect, it, vi } from 'vitest';
import { mockFetchAllUserBadgesPath, mockUserId } from '~/mocks';
import { RequestMethods } from '~/types';
import { fetchAllUserBadges } from './badges';

describe('badges', () => {
  it('fetchAllUserBadges runs and calls request properly', async () => {
    await fetchAllUserBadges();
    expect(requestMock).toHaveBeenCalledWith(
      RequestMethods.GET,
      mockFetchAllUserBadgesPath,
    );
  });
});
