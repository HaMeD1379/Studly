const { mockFetchAllUserBadges } = vi.hoisted(
  () => ({
    mockFetchAllUserBadges: vi.fn()
  }),
);

vi.mock('~/api/badges', () => ({
  fetchAllUserBadges: mockFetchAllUserBadges
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockBadgesResponse, mockBadgesLoaderResponse, mockBadgesErrorResponse} from '~/mocks';
import { loader } from './loader';

describe('loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns data with badges', async () => {
    mockFetchAllUserBadges.mockResolvedValueOnce(mockBadgesResponse);
  
    const result = await loader();

    expect(result).toEqual(mockBadgesLoaderResponse);
  });

  it('returns error', async () => {
    mockFetchAllUserBadges.mockResolvedValueOnce({
      data: Promise.resolve(),
      error: true,
    });

    const result = await loader();
    expect(result).toEqual(mockBadgesErrorResponse);
  });
});
