const { mockFetchBio } = vi.hoisted(() => ({
  mockFetchBio: vi.fn(),
}));

import { describe, expect, it, vi } from 'vitest';
import { fetchBio } from '~/api';

vi.mock('~/api/profile', () => ({
  fetchBio: mockFetchBio,
}));

describe('fetchBio mock test', () => {
  it('returns a fake bio response', async () => {
    const mockResponse = {
      data: {
        data: {
          bio: "Hello, I'm a mocked bio",
          user_id: '123',
        },
        message: 'Bio fetched successfully',
      },
    };

    mockFetchBio.mockResolvedValue(mockResponse);

    const result = await fetchBio('123');

    expect(result.data?.data.bio).toBe("Hello, I'm a mocked bio");
  });
});
