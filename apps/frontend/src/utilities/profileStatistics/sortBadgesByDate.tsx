import type { UnlockedBadge } from '~/types';
export const sortBadgesByEarnedDate = (
  badges: UnlockedBadge[],
  ascending = true,
): UnlockedBadge[] => {
  return badges
    .filter((badge) => badge.earnedAt)
    .sort((a, b) => {
      const dateA = new Date(a.earnedAt as string).getTime();
      const dateB = new Date(b.earnedAt as string).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
};
