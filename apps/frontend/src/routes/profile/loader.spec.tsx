import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatISOToYYYYMMDD } from '~/utilities/time';
import { loader } from './loader';

const { mockWeekly, mockBio, mockAllTime, mockBadges } = vi.hoisted(() => ({
  mockAllTime: vi.fn(),
  mockBadges: vi.fn(),
  mockBio: vi.fn(),
  mockWeekly: vi.fn(),
}));

vi.mock('~/api', () => ({
  fetchAllTimeSummary: mockAllTime,
  fetchBio: mockBio,
  fetchWeeklySessionSummary: mockWeekly,
}));

vi.mock('~/api/badges', () => ({
  fetchAllUserBadges: mockBadges,
}));

// Mock Zustand userInfo store
vi.mock('~/store', () => ({
  userInfo: {
    getState: () => ({ userId: 'user-1' }),
  },
}));

describe('loader()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correctly combined loader data', async () => {
    mockWeekly.mockResolvedValue({
      data: { sessionsStudied: 5 },
      error: false,
    });

    mockBio.mockResolvedValue({
      data: { bio: 'Hello world', userId: 'user-1' },
      error: false,
    });

    mockAllTime.mockResolvedValue({
      data: { sessions: [{ id: 1 }, { id: 2 }] },
      error: false,
    });

    mockBadges.mockResolvedValue({
      data: {
        badges: [
          {
            badge: { description: 'Study 3 days', name: 'Streak 3' },
            earnedAt: '2025-01-01T00:00:00Z',
          },
          {
            badge: { description: 'First login', name: 'Welcome' },
            earnedAt: null,
          },
        ],
      },
      error: false,
    });

    const result = await loader();

    expect(result).toEqual({
      data: {
        badges: {
          allBadges: [
            { description: 'Study 3 days', name: 'Streak 3' },
            { description: 'First login', name: 'Welcome' },
          ],
          unlockedBadges: [
            {
              description: 'Study 3 days',
              earnedAt: formatISOToYYYYMMDD('2025-01-01T00:00:00Z'),
              name: 'Streak 3',
            },
          ],
        },
        profileBio: { bio: 'Hello world', userId: 'user-1' },
        sessionSummary: { sessionsStudied: 5 },
        sessions: [{ id: 1 }, { id: 2 }],
      },
      error: false,
    });
  });

  it('handles empty badge list gracefully', async () => {
    mockWeekly.mockResolvedValue({ data: {}, error: false });
    mockBio.mockResolvedValue({ data: {}, error: false });
    mockAllTime.mockResolvedValue({ data: {}, error: false });
    mockBadges.mockResolvedValue({
      data: { badges: [] },
      error: false,
    });

    const result = await loader();

    expect(result.data?.badges?.allBadges).toEqual([]);
    expect(result.data?.badges?.unlockedBadges).toEqual([]);
  });

  it('uses userId from Zustand store when calling fetchBio', async () => {
    mockWeekly.mockResolvedValue({ data: {}, error: false });
    mockBio.mockResolvedValue({ data: {}, error: false });
    mockAllTime.mockResolvedValue({ data: {}, error: false });
    mockBadges.mockResolvedValue({ data: { badges: [] }, error: false });

    await loader();

    expect(mockBio).toHaveBeenCalledWith('user-1');
  });
});
