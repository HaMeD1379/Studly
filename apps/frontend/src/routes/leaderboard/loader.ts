import { fetchLeaderboards } from '~/api/leaderboard';

type LeaderboardsLoader = {
  data: {
    leaderboard: string[]
  };
  error: boolean;
};

export const loader = async (): Promise<LeaderboardsLoader> => {
  const leaderboardsData = await fetchLeaderboards();

  return {
    data: {
      leaderboard: []
    },
    error: false,
  };
}