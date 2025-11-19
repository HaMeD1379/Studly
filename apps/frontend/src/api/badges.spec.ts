const { requestMock, getUserIdMock } = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  requestMock: vi.fn(),
}));

vi.mock('~/utilities/requests/requests', () => ({
  request: requestMock,
}));

vi.mock('~/utilities/session/session', () => ({
  getUserId: getUserIdMock,
}));

import { describe, expect, it, vi } from 'vitest';
import { mockFetchAllUserBadgesPath } from '~/mocks';
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
