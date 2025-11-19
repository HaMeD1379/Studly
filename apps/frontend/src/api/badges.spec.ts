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
