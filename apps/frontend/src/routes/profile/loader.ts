import {
  fetchAllTimeSummary,
  fetchBio,
  fetchWeeklySessionSummary,
} from '~/api';
import { fetchAllUserBadges } from '~/api/badges';
import { userInfo } from '~/store';
import type {
  Badge,
  ProfileBio,
  StudySession,
  TodaysStudyStatistics,
  UnlockedBadge,
} from '~/types';
import { formatISOToYYYYMMDD } from '~/utilities/time';

type CombinedLoader = {
  data: {
    sessionSummary?: TodaysStudyStatistics;
    profileBio?: ProfileBio;
    sessions?: StudySession[];
    badges?: {
      unlockedBadges: UnlockedBadge[];
      allBadges: Badge[];
    };
  };
  error: boolean;
};

export const loader = async (): Promise<CombinedLoader> => {
  const { userId } = userInfo.getState();

  const [sessionSummary, profileBio, sessionsList, badgesResponse] =
    await Promise.all([
      fetchWeeklySessionSummary(),
      fetchBio(userId),
      fetchAllTimeSummary(),
      fetchAllUserBadges(),
    ]);

  const allBadges: Badge[] = [];
  const unlockedBadges: UnlockedBadge[] = [];

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
      badges: {
        allBadges,
        unlockedBadges,
      },
      profileBio: profileBio.data,
      sessionSummary: sessionSummary.data,
      sessions: sessionsList.data?.sessions,
    },
    error:
      !!sessionSummary.error || !!profileBio.error || !!badgesResponse.error,
  };
};
