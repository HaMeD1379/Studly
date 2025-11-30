const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}));

vi.mock('~/utilities/requests/requests', () => ({
  request: requestMock,
}));

import { vi, expect, describe, it, beforeEach } from 'vitest';
import { fetchHomeFeed } from './feed';
import { RequestMethods } from '~/types';
import { mockFetchHomeFeedPath } from '~/mocks';
import { mockFeedTimestamp } from '~/mocks/feed';

describe('feed', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetchHomeFeed runs and calls request properly', async () => {
    const dateSpy = vi.spyOn(Date.prototype, 'toISOString');

    dateSpy.mockReturnValue(mockFeedTimestamp);

    await fetchHomeFeed();
    expect(requestMock).toHaveBeenCalledWith(
      RequestMethods.GET,
      mockFetchHomeFeedPath,
    );

    dateSpy.mockRestore();
  });
});