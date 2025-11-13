import { fetchAllUserBadges } from '~/api/badges';
import type { Badge, UnlockedBadge } from '~/types';
import { formatISOToYYYYMMDD } from '~/utilities/date';

type BadgeLoaderResponse = {
  data: {
    unlockedBadges?: UnlockedBadge[];
    allBadges?: Badge[];
  };
  error: boolean;
};

export const loader = async (): Promise<BadgeLoaderResponse> => {
  const badgesResponse = await fetchAllUserBadges();

  const allBadges = [];
  const unlockedBadges = [];

  if (badgesResponse.data && !badgesResponse.error) {
    for (const badgeData of badgesResponse.data.badges) {
      allBadges.push(badgeData.badge);

      if (badgeData.earnedAt) {
        unlockedBadges.push({
          ...badgeData.badge,
          earnedAt: formatISOToYYYYMMDD(badgeData.earnedAt),
        });
      }
    }
  }

  return {
    data: {
      allBadges: allBadges ?? [],
      unlockedBadges: unlockedBadges ?? [],
    },
    error: !!badgesResponse.error,
  };
};
