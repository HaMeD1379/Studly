import { fetchLeaderboards } from '~/api/leaderboard';

type LeaderboardsLoader = {
  data: {
    leaderboards: string[]
  };
  error: boolean;
};

export const loader = async (): Promise<LeaderboardsLoader> => {
  const leaderboardsData = await fetchLeaderboards();

  return {
    data: {
      leaderboards: []
    },
    error: false,
  };
}