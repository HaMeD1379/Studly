import {
  MS_IN_A_DAY,
  RECENT_STUDY_SESSIONS_LIST_SIZE,
  SESSIONS,
  SESSIONS_SUMMARY,
} from '~/constants';
import {
  type CreateStudySessionAction,
  RequestMethods,
  type SessionListLoader,
  type SessionSummaryLoader,
} from '~/types';
import { request } from '~/utilities/requests';
import { getSessionId, getUserId } from '~/utilities/session';

export const fetchTodaysSessionSummary = async () => {
  const userId = getUserId();

  const from = new Date(Date.now() - MS_IN_A_DAY).toISOString();
  const to = new Date(Date.now()).toISOString();
  const path = `${SESSIONS_SUMMARY}?userId=${userId}&from=${from}&to=${to}`;
  const result = await request<SessionSummaryLoader>(RequestMethods.GET, path);

  return result;
};

export const fetchSessionsList = async () => {
  const userId = getUserId();
  const endTime = new Date(Date.now()).toISOString();
  const path = `${SESSIONS}?userId=${userId}&limit=${RECENT_STUDY_SESSIONS_LIST_SIZE}&to=${endTime}`;
  const result = await request<SessionListLoader>(RequestMethods.GET, path);

  return result;
};

export const startSession = async (
  startTime: number,
  endTime: number,
  subject: string,
) => {
  const startTimeISO = new Date(startTime).toISOString();
  const endTimeISO = new Date(endTime).toISOString();
  const userId = getUserId();

  const result = await request<CreateStudySessionAction>(
    RequestMethods.POST,
    SESSIONS,
    undefined,
    JSON.stringify({
      endTime: endTimeISO,
      sessionType: 1,
      startTime: startTimeISO,
      subject,
      userId,
    }),
  );

  return result;
};

export const stopSession = async () => {
  const path = `${SESSIONS}/${getSessionId()}`;
  const result = await request(
    RequestMethods.PATCH,
    path,
    undefined,
    JSON.stringify({
      endTime: new Date(Date.now()).toISOString(),
    }),
  );

  return result;
};
