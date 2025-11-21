const { mockFetchLeaderboards } = vi.hoisted(() => ({
  mockFetchLeaderboards: vi.fn(),
}));

vi.mock('~/api/leaderboard', () => ({
  fetchLeaderboards: mockFetchLeaderboards,
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockLeaderboardErrorResponse,
  mockLeaderboardLoaderResponse,
} from '~/mocks';
import { loader } from './loader';

describe('loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns data with badges', async () => {
    mockFetchLeaderboards.mockResolvedValueOnce(mockLeaderboardLoaderResponse);

    const result = await loader();

    expect(result).toEqual(mockLeaderboardLoaderResponse);
  });

  it('returns no data on empty data', async () => {
    mockFetchLeaderboards.mockResolvedValueOnce({
      data: null,
      error: false,
    });

    const result = await loader();

    expect(result).toEqual({
      data: {
        friends: {
          badges: [],
          studyTime: [],
        },
        global: {
          badges: [],
          studyTime: [],
        },
      },
      error: false,
    });
  });

  it('returns error', async () => {
    mockFetchLeaderboards.mockResolvedValueOnce({
      data: {
        friends: {
          badges: [],
          studyTime: [],
        },
        global: {
          badges: [],
          studyTime: [],
        },
      },
      error: true,
    });

    const result = await loader();
    expect(result).toEqual(mockLeaderboardErrorResponse);
  });
});
