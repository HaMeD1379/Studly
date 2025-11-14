import { describe, expect, it, vi } from 'vitest';
import { fetchBio } from '~/api/profileChanges';

vi.mock('~/api/profileChanges', () => ({
  fetchBio: vi.fn(),
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

    // @ts-expect-error — tell TypeScript we're controlling the mock
    fetchBio.mockResolvedValue(mockResponse);

    const result = await fetchBio('123');

    expect(result.data?.data.bio).toBe("Hello, I'm a mocked bio");
  });
});
