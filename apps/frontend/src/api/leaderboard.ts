import { LEADERBOARD_ALL } from '~/constants';
import { userInfo } from '~/store';
import { type LeaderboardResponse, RequestMethods } from '~/types';
import { request } from '~/utilities/requests';

export const fetchLeaderboards = async () => {
  const { userId } = userInfo.getState();

  const path = `${LEADERBOARD_ALL}?userId=${userId}`;

  const result = await request<LeaderboardResponse>(RequestMethods.GET, path);

  return result;
};
