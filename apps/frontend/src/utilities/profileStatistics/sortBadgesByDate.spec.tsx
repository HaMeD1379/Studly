import { describe, expect, it } from 'vitest';
import type { UnlockedBadge } from '~/types';
import { sortBadgesByEarnedDate } from './sortBadgesByDate';

describe('sortBadgesByEarnedDate', () => {
  const badges: UnlockedBadge[] = [
    {
      description: 'Bronze badge',
      earnedAt: '2024-01-10',
      name: 'Bronze',
    },
    {
      description: 'Gold badge',
      earnedAt: '2024-03-01',
      name: 'Gold',
    },
    {
      description: 'Silver badge',
      earnedAt: '2024-02-01',
      name: 'Silver',
    },
  ];

  it('sorts badges by earnedAt in ascending order', () => {
    const result = sortBadgesByEarnedDate(badges, true);

    expect(result.map((b) => b.name)).toEqual([
      'Bronze', // Jan 10
      'Silver', // Feb 1
      'Gold', // Mar 1
    ]);
  });

  it('sorts badges by earnedAt in descending order', () => {
    const result = sortBadgesByEarnedDate(badges, false);

    expect(result.map((b) => b.name)).toEqual([
      'Gold', // Mar 1
      'Silver', // Feb 1
      'Bronze', // Jan 10
    ]);
  });

  it('returns an empty array when input is empty', () => {
    expect(sortBadgesByEarnedDate([])).toEqual([]);
  });

  it('handles badges with identical dates correctly', () => {
    const duplicateDateBadges: UnlockedBadge[] = [
      {
        description: 'A desc',
        earnedAt: '2024-05-01',
        name: 'A',
      },
      {
        description: 'B desc',
        earnedAt: '2024-05-01',
        name: 'B',
      },
    ];

    const result = sortBadgesByEarnedDate(duplicateDateBadges, true);

    // Order should remain stable
    expect(result.map((b) => b.name)).toEqual(['A', 'B']);
  });
});
