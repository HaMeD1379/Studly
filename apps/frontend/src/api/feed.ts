import { FEED } from '~/constants';
import { type FeedLoader, RequestMethods } from '~/types';
import { request } from '~/utilities/requests';

export const fetchHomeFeed = async () => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastWeekISO = lastWeek.toISOString();
  const path = `${FEED}/${lastWeekISO}`;

  const result = await request<FeedLoader>(RequestMethods.GET, path);

  return result;
};
