import { MS_IN_A_DAY, SESSIONS } from '~/constants';
import { mockSessionId } from './session';

export const mockStartSessionStart = MS_IN_A_DAY;
export const mockStartSessionStop = MS_IN_A_DAY * 2;
export const mockStartSessionSubject = 'Mathematics';

export const mockStopSessionPath = `${SESSIONS}/${mockSessionId}`;

export const mockFetchSessionSummaryPath =
  'sessions/summary?userId=undefined&from=1970-01-02T00:00:00.000Z&to=1970-01-03T00:00:00.000Z';
export const mockFetchSessionListPath =
  'sessions?userId=undefined&limit=3&to=1970-01-03T00:00:00.000Z';
export const mockStartSessionBody = JSON.stringify({
  endTime: '1970-01-03T00:00:00.000Z',
  sessionType: 1,
  startTime: '1970-01-02T00:00:00.000Z',
  subject: mockStartSessionSubject,
});

export const endSessionBodyMock = JSON.stringify({
  endTime: '1970-01-03T00:00:00.000Z',
});
