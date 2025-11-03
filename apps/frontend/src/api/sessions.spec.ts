const { requestMock, getUserIdMock, getSessionIdMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
  getUserIdMock: vi.fn(),
  getSessionIdMock: vi.fn(),
}));

vi.mock('~/utilities/requests/requests', () => ({
  request: requestMock,
}));

vi.mock('~/utilities/session/session', () => ({
  getUserId: getUserIdMock,
  getSessionId: getSessionIdMock,
}));

import { vi, describe, it, expect } from 'vitest';
import { fetchSessionsList, fetchTodaysSessionSummary, startSession, stopSession } from './sessions';
import { mockStartSessionBody, endSessionBodyMock, mockStopSessionPath, mockFetchSessionSummaryPath, mockFetchSessionListPath, mockStartSessionStart, mockStartSessionStop, mockStartSessionSubject, mockSessionId } from '~/mocks';
import { MS_IN_A_DAY, SESSIONS } from '~/constants';
import { RequestMethods } from '~/types';

describe('sessions', () => {
  it('fetchTodaysSessionSummary runs and calls request properly', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(MS_IN_A_DAY * 2);

    await fetchTodaysSessionSummary();
    expect(requestMock).toHaveBeenCalledWith(RequestMethods.GET, mockFetchSessionSummaryPath);
  });

  it('fetchSessionsList runs and calls request properly', async () => {
    await fetchSessionsList();
    expect(requestMock).toHaveBeenCalledWith(RequestMethods.GET, mockFetchSessionListPath);
  });

  it('startSession runs and calls request properly', async () => {
    await startSession(mockStartSessionStart, mockStartSessionStop, mockStartSessionSubject);
    expect(requestMock).toHaveBeenCalledWith(RequestMethods.POST, SESSIONS, undefined, mockStartSessionBody);
  });

  it('stopSession runs and calls request properly', async () => {
    getSessionIdMock.mockReturnValueOnce(mockSessionId);

    await stopSession();
    expect(requestMock).toHaveBeenCalledWith(RequestMethods.PATCH, mockStopSessionPath, undefined, endSessionBodyMock);
  });
});