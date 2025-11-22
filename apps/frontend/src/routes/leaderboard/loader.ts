import { fetchLeaderboards } from '~/api';
import type { LeaderboardResponse } from '~/types';

type LeaderboardsLoader = {
  data: LeaderboardResponse;
  error: boolean;
};

export const loader = async (): Promise<LeaderboardsLoader> => {
  const leaderboardsData = await fetchLeaderboards();

  return {
    data: leaderboardsData.data ?? {
      friends: {
        badges: [],
        studyTime: [],
      },
      global: {
        badges: [],
        studyTime: [],
      },
    },
    error: !!leaderboardsData.error,
  };
};
