const { mockUserId, mockSessionId, mockAccessToken, mockSetSessId } =
  vi.hoisted(() => ({
    mockAccessToken: 'token789',
    mockSessionId: 'sess456',
    mockSetSessId: vi.fn(),
    mockUserId: 'user123',
  }));

vi.mock('~/store/userInfoStore', () => {
  return {
    userInfoStore: {
      getState: vi.fn(() =>
        createMockBioStore({
          sessionId: mockSessionId,
          setSessId: mockSetSessId,
          userId: mockUserId,
        }),
      ),
    },
  };
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userInfoStore } from '~/store';
import { createMockBioStore } from './mockUserInfo';
import {
  getAccessToken,
  getSessionId,
  getUserId,
  setSessionId,
} from './session';

describe('session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(userInfoStore.getState).mockReturnValue(
      createMockBioStore({
        sessionId: mockSessionId,
        setSessId: mockSetSessId,
        userId: mockUserId,
      }),
    );
  });

  it('returns empty string on getAccessToken if no storage is set', () => {
    expect(getAccessToken()).toBe('');
  });

  it('returns empty string on getUserId if store has no userId', () => {
    vi.mocked(userInfoStore.getState).mockReturnValue(
      createMockBioStore({
        sessionId: mockSessionId,
        setSessId: mockSetSessId,
        userId: '',
      }),
    );

    expect(getUserId()).toBe('');
  });

  it('returns empty string on getSessionId if store has no sessionId', () => {
    vi.mocked(userInfoStore.getState).mockReturnValue(
      createMockBioStore({
        sessionId: '',
        setSessId: mockSetSessId,
        userId: mockUserId,
      }),
    );

    expect(getSessionId()).toBe('');
  });

  it('returns token on getAccessToken if storage is set', () => {
    localStorage.setItem('accessToken', mockAccessToken);
    expect(getAccessToken()).toBe(mockAccessToken);
  });

  it('returns user id from store', () => {
    expect(getUserId()).toBe(mockUserId);
  });

  it('returns session id from store', () => {
    expect(getSessionId()).toBe(mockSessionId);
  });

  it('sets session id via store', () => {
    const newSessionId = 'newSess123';

    expect(mockSetSessId).not.toHaveBeenCalled();

    setSessionId(newSessionId);

    expect(mockSetSessId).toHaveBeenCalledWith(newSessionId);
  });
});
