import {fetchTodaysSessionSummary, getProfile} from '~/api'
import { SessionSummaryLoader,userProfileInfo,UnlockedBadge } from '~/types';
import { userInfo } from '~/store';
import { fetchAllUserBadges} from '~/api/badges';
import { formatISOToYYYYMMDD } from '~/utilities/time';

type combinedLoader = {
    data: {
        todaySession?: SessionSummaryLoader
        userProfileInfo?: userProfileInfo
        unlockedBadges?: UnlockedBadge[];
    };
    error: boolean
}

export const loader = async ():Promise<combinedLoader> => {
    const {userId} = userInfo.getState()
    const [todaySession,userProfileInfo,badgesResponse] = await Promise.all([
            fetchTodaysSessionSummary(),
            getProfile(userId),
            fetchAllUserBadges()
          ]);
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
        data:{
            todaySession: todaySession.data ?? undefined,
            userProfileInfo: userProfileInfo.data ?? undefined,
            unlockedBadges: unlockedBadges ?? []
        },
        error: !!(todaySession.error || userProfileInfo.error)
    }
}