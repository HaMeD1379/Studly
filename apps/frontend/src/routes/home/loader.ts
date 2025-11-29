import { fetchTodaysSessionSummary, getProfile } from '~/api';
import { fetchAllUserBadges } from '~/api/badges';
import { userInfo } from '~/store';
import type {
  Badge,
  inProgressBadge,
  SessionSummaryLoader,
  UnlockedBadge,
  userProfileInfo,
} from '~/types';
import { formatISOToYYYYMMDD } from '~/utilities/time';

type combinedLoader = {
  data: {
    todaySession?: SessionSummaryLoader;
    userProfileInfo?: userProfileInfo;
    unlockedBadges?: UnlockedBadge[];
    allBadges?: Badge[];
    inProgressBadges?: inProgressBadge[];
  };
  error: boolean;
};

export const loader = async (): Promise<combinedLoader> => {
  const { userId } = userInfo.getState();
  const [todaySession, userProfileInfo, badgesResponse] = await Promise.all([
    fetchTodaysSessionSummary(),
    getProfile(userId),
    fetchAllUserBadges(),
  ]);
  const allBadges = [];
  const unlockedBadges = [];
  const inProgressBadges = [];

  if (badgesResponse.data && !badgesResponse.error) {
    for (const badgeData of badgesResponse.data.badges) {
      allBadges.push(badgeData.badge);
      console.log('progress:', typeof badgeData.progress);
      if (badgeData.progress !== undefined && badgeData.progress < 100) {
        inProgressBadges.push({
          ...badgeData.badge,
          progress: badgeData.progress,
        });
      }
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
      inProgressBadges: inProgressBadges ?? [],
      todaySession: todaySession.data ?? undefined,
      unlockedBadges: unlockedBadges ?? [],
      userProfileInfo: userProfileInfo.data ?? undefined,
    },
    error: !!(todaySession.error || userProfileInfo.error),
  };
};
