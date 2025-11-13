import { BADGES_ALL_USER } from '~/constants';
import { type BadgeLoader, RequestMethods } from '~/types';
import { request } from '~/utilities/requests';
import { getUserId } from '~/utilities/session';

export const fetchAllUserBadges = async () => {
  const userId = getUserId();

  const path = `${BADGES_ALL_USER}/${userId}?includeProgress=true`;

  const result = await request<BadgeLoader>(RequestMethods.GET, path);

  return result;
};
