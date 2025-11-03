import type { StudySession } from '~/types';

export const mockRecentStudySessions: StudySession[] = [
  {
    endTime: new Date(1760234974000).toISOString(),
    totalMinutes: 61,
    subject: 'Mathematics',
  },
  {
    endTime: new Date(1760117302000).toISOString(),
    totalMinutes: 25,
    subject: 'Computer Science',
  },
  {
    endTime: new Date(1759234974000).toISOString(),
    totalMinutes: 453,
    subject: 'Chemistry',
  },
];
export const mockTotalTimeStudied = 166;
export const mockSessionsLogged = 3;
export const mockStartStudySessionFetcherRequestTime = 1000;

export const mockStartStudySessionFetcherRequest = {
  endTime: 901000,
  startTime: mockStartStudySessionFetcherRequestTime,
  subject: 'Mathematics',
  type: 'start',
}

export const mockStopStudySessionFetcherSubmit = {
  type: 'stop',
}

export const mockNoSessionData = {
  data: {},
  error: false,
}

export const mockErrorData = {
  data: {
    sessionsList: undefined,
    summary: undefined,
  },
  error: true
}

export const mockSessionData = {
  data: {
    sessionsList: mockRecentStudySessions,
    summary: {
      totalTimeStudied: mockTotalTimeStudied,
      sessionsLogged: mockSessionsLogged,
    }
  },
  error: false,
}
