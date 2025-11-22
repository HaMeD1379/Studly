import { UnlockedBadge } from "~/types";
export const sortBadgesByEarnedDate = (
  badges: UnlockedBadge[],
  ascending = true
): UnlockedBadge[] => {
  return badges
    .filter((badge) => badge.earnedAt)
    .sort((a, b) => {
      const dateA = new Date(a.earnedAt!).getTime();
      const dateB = new Date(b.earnedAt!).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
};
