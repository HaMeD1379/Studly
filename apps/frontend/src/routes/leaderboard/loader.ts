import { fetchLeaderboards } from '~/api';
import { LeaderboardResponse } from '~/types';

type LeaderboardsLoader = {
  data: LeaderboardResponse;
  error: boolean;
};

export const loader = async (): Promise<LeaderboardsLoader> => {
  const leaderboardsData = await fetchLeaderboards();

  return {
    data: leaderboardsData.data ?? {
      friends: {
        studyTime: [],
        badges: [],
      },
      global: {
        studyTime: [],
        badges: [],
      },
    },
    error: !!leaderboardsData.error,
  };
}