import { BADGES_ALL_USER } from '~/constants';
import { type BadgeLoader, RequestMethods } from '~/types';
import { request } from '~/utilities/requests';
import { userInfoStore } from '~/store';

export const fetchAllUserBadges = async () => {
  const { userId } = userInfoStore.getState();

  const path = `${BADGES_ALL_USER}/${userId}?includeProgress=true`;

  const result = await request<BadgeLoader>(RequestMethods.GET, path);

  return result;
};
