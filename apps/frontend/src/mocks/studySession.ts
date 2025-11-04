import type { StudySession } from '~/types';

export const mockRecentStudySessions: StudySession[] = [
  {
    endTime: new Date(1760234974000).toISOString(),
    subject: 'Mathematics',
    totalMinutes: 61,
  },
  {
    endTime: new Date(1760117302000).toISOString(),
    subject: 'Computer Science',
    totalMinutes: 25,
  },
  {
    endTime: new Date(1759234974000).toISOString(),
    subject: 'Chemistry',
    totalMinutes: 453,
  },
];
export const mockTotalTimeStudied = 166;
export const mockSessionsLogged = 3;
export const mockStartStudySessionFetcherRequestTime = 1000;

export const mockStartStudySessionFetcherRequest = [
  {
    endTime: 901000,
    startTime: mockStartStudySessionFetcherRequestTime,
    subject: 'Mathematics',
    type: 'start',
  },
  {
    method: 'POST',
  },
];

export const mockStopStudySessionFetcherSubmit = [
  {
    type: 'stop',
  },
  {
    method: 'PATCH',
  },
];

export const mockNoSessionData = {
  data: {},
  error: false,
};

export const mockErrorData = {
  data: {
    sessionsList: undefined,
    summary: undefined,
  },
  error: true,
};

export const mockSessionData = {
  data: {
    sessionsList: mockRecentStudySessions,
    summary: {
      sessionsLogged: mockSessionsLogged,
      totalTimeStudied: mockTotalTimeStudied,
    },
  },
  error: false,
};
