import { MS_IN_A_DAY, SESSIONS } from '~/constants';
import { mockFeedTimestamp } from './feed';
import { mockSessionId, mockUserId } from './session';

export const mockStartSessionStart = MS_IN_A_DAY;
export const mockStartSessionStop = MS_IN_A_DAY * 2;
export const mockStartSessionSubject = 'Mathematics';

export const mockStopSessionPath = `${SESSIONS}/${mockSessionId}`;

export const mockFetchSessionSummaryPath = `sessions/summary?userId=${mockUserId}&from=1970-01-02T00:00:00.000Z&to=1970-01-03T00:00:00.000Z`;
export const mockFetchSessionListPath = `sessions?userId=${mockUserId}&limit=3&to=1970-01-03T00:00:00.000Z`;
export const mockStartSessionBody = JSON.stringify({
  endTime: '1970-01-03T00:00:00.000Z',
  sessionType: 1,
  startTime: '1970-01-02T00:00:00.000Z',
  subject: mockStartSessionSubject,
  userId: mockUserId,
});

export const mockEndSessionBody = JSON.stringify({
  endTime: '1970-01-03T00:00:00.000Z',
});

export const mockFetchAllUserBadgesPath = `badges/users/${mockUserId}?includeProgress=true`;

export const mockFetchLeaderboardsPath = `leaderboard?userId=${mockUserId}`;

export const mockFetchHomeFeedPath = `feed/${mockFeedTimestamp}`;
