import { fetchTodaysSessionSummary, getProfile } from '~/api';
import { fetchAllUserBadges } from '~/api/badges';
import { fetchHomeFeed } from '~/api/feed';
import { userInfo } from '~/store';
import type {
  Badge,
  HomeFeed,
  InProgressBadge,
  SessionSummaryLoader,
  UnlockedBadge,
  userProfileInfo,
} from '~/types';
import { formatISOToYYYYMMDD } from '~/utilities/time';

type CombinedLoader = {
  data: {
    todaySession?: SessionSummaryLoader;
    userProfileInfo?: userProfileInfo;
    unlockedBadges?: UnlockedBadge[];
    allBadges?: Badge[];
    inProgressBadges?: InProgressBadge[];
    homeFeed?: HomeFeed;
  };
  error: boolean;
};

export const loader = async (): Promise<CombinedLoader> => {
  const { userId } = userInfo.getState();
  const [todaySession, userProfileInfo, badgesResponse, homeFeedResponse] =
    await Promise.all([
      fetchTodaysSessionSummary(),
      getProfile(userId),
      fetchAllUserBadges(),
      fetchHomeFeed(),
    ]);
  const allBadges = [];
  const unlockedBadges = [];
  const inProgressBadges = [];
  const homeFeed = [];

  if (badgesResponse.data && !badgesResponse.error) {
    for (const badgeData of badgesResponse.data.badges) {
      allBadges.push(badgeData.badge);
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

  if (homeFeedResponse.data && !homeFeedResponse.error) {
    const dataFeed = homeFeedResponse.data.data.feed;
    if (dataFeed) {
      for (const data of dataFeed) {
        const badgeData = data.badge;
        const sessionData = data.session;

        homeFeed.push({
          badge: badgeData ?? undefined,
          session: sessionData
            ? {
                subject: sessionData.subject,
                totalTime: sessionData.total_time,
              }
            : undefined,
          timestamp: data.timestamp,
          user: {
            fullName: data.user.full_name,
          },
        });
      }
    }
  }

  return {
    data: {
      allBadges: allBadges ?? [],
      homeFeed: homeFeed ?? undefined,
      inProgressBadges: inProgressBadges ?? [],
      todaySession: todaySession.data ?? undefined,
      unlockedBadges: unlockedBadges ?? [],
      userProfileInfo: userProfileInfo.data ?? undefined,
    },
    error: !!(todaySession.error || userProfileInfo.error),
  };
};
