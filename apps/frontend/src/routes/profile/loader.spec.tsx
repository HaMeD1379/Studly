const { mockFetchBio } = vi.hoisted(() => ({
  mockFetchBio: vi.fn(),
}));

import { describe, expect, it, type Mock, vi } from 'vitest';
import { SessionSummary } from '~/api';
import { fetchBio } from '~/api/profile';

vi.mock('~/api/profile', () => ({
  fetchBio: mockFetchBio,
  SessionSummary: vi.fn(),
}));

describe('fetchBio mock test', () => {
  it('returns a fake bio response', async () => {
    const mockResponse = {
      data: {
        data: {
          bio: "Hello, I'm a mocked bio",
          userId: '123',
        },
        message: 'Bio fetched successfully',
      },
    };

    mockFetchBio.mockResolvedValue(mockResponse);

    const result = await fetchBio('123');

    expect(result.data?.data.bio).toBe("Hello, I'm a mocked bio");
  });
  it('returns a fake session summary response', async () => {
    const mockResponse = {
      data: {
        sessionsLogged: 0,
        totalMinutesStudied: 0,
      },
      error: false,
    };
    (SessionSummary as Mock).mockResolvedValue(mockResponse);

    const result = await SessionSummary();

    expect(result.data?.sessionsLogged).toBe(0);
    expect(result.data?.totalMinutesStudied).toBe(0);
  });
});
