import { BADGES_ALL_USER } from '~/constants';
import { userInfo } from '~/store';
import { type BadgeLoader, RequestMethods } from '~/types';
import { request } from '~/utilities/requests';

export const fetchAllUserBadges = async () => {
  const { userId } = userInfo.getState();

  const path = `${BADGES_ALL_USER}/${userId}?includeProgress=true`;

  const result = await request<BadgeLoader>(RequestMethods.GET, path);

  return result;
};
