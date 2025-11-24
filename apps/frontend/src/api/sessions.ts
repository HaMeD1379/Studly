import {
  MS_IN_A_DAY,
  RECENT_STUDY_SESSIONS_LIST_SIZE,
  SESSIONS,
  SESSIONS_SUMMARY,
} from '~/constants';
import { userInfo } from '~/store';
import {
  type CreateStudySessionAction,
  RequestMethods,
  type SessionListLoader,
  type SessionSummaryLoader,
} from '~/types';
import { request } from '~/utilities/requests';
import { getSunday } from '~/utilities/time';

export const fetchTodaysSessionSummary = async () => {
  const { userId } = userInfo.getState();

  const from = new Date(Date.now() - MS_IN_A_DAY).toISOString();
  const to = new Date(Date.now()).toISOString();
  const path = `${SESSIONS_SUMMARY}?userId=${userId}&from=${from}&to=${to}`;
  const result = await request<SessionSummaryLoader>(RequestMethods.GET, path);

  return result;
};

export const fetchSessionsList = async () => {
  const { userId } = userInfo.getState();
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
  const { userId } = userInfo.getState();

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
  const { sessionId } = userInfo.getState();

  const path = `${SESSIONS}/${sessionId}`;
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

export const fetchWeeklySessionSummary = async () => {
  const { userId } = userInfo.getState();

  const to = new Date(Date.now()).toISOString();

  const from = getSunday(new Date(Date.now()));
  console.log(`from ${from} to ${to}`);
  const path = `${SESSIONS_SUMMARY}?userId=${userId}&from=${from}&to=${to}`;
  const result = await request<SessionSummaryLoader>(RequestMethods.GET, path);
  return result;
};

export const fetchAllTimeSummary = async () => {
  const { userId } = userInfo.getState();
  const endTime = new Date(Date.now()).toISOString();
  const path = `${SESSIONS}?userId=${userId}&to=${endTime}`;
  const result = await request<SessionListLoader>(RequestMethods.GET, path);

  return result;
};
