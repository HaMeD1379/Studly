import {
  MS_IN_A_DAY,
  RECENT_STUDY_SESSIONS_LIST_SIZE,
  SESSIONS,
  SESSIONS_SUMMARY,
} from '~/constants';
import {
  RequestMethods,
  type StudySession,
  type TodaysStudyStatistics,
} from '~/types';
import { request } from '~/utilities/requests';

export const fetchTodaysSessionSummary = async (userId: string) => {
  const path = `${SESSIONS_SUMMARY}?userId=${userId}&from=${Date.now() - MS_IN_A_DAY}&to=${Date.now()}`;
  const result = await request<TodaysStudyStatistics>(RequestMethods.GET, path);

  return result;
};

export const fetchSessionsList = async (userId: string) => {
  const path = `${SESSIONS}?userId=${userId}&limit=${RECENT_STUDY_SESSIONS_LIST_SIZE}`;
  const result = await request<StudySession[]>(RequestMethods.GET, path);

  return result;
};
