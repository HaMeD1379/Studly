const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}));

vi.mock('~/utilities/requests/requests', () => ({
  request: requestMock,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFetchHomeFeedPath } from '~/mocks';
import { mockFeedTimestamp } from '~/mocks/feed';
import { RequestMethods } from '~/types';
import { fetchHomeFeed } from './feed';

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
