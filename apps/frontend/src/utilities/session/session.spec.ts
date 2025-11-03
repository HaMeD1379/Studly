import { describe, expect, it } from 'vitest';
import { mockAccessToken, mockSessionId, mockUserId } from '~/mocks';
import {
  getAccessToken,
  getSessionId,
  getUserId,
  setSessionId,
} from './session';

describe('session', () => {
  it('returns empty string on getAccessToken if no storage is set', () => {
    expect(getAccessToken()).toEqual('');
  });

  it('returns empty string on getUserId if no storage is set', () => {
    expect(getUserId()).toEqual('');
  });

  it('returns empty string on getSessionId if no storage is set', () => {
    expect(getSessionId()).toEqual('');
  });

  it('returns token on getAccessToken if storage is set', () => {
    localStorage.setItem('accessToken', mockAccessToken);
    expect(getAccessToken()).toEqual(mockAccessToken);
    localStorage.removeItem('accessToken');
  });

  it('returns user id on getUserId if storage is set', () => {
    localStorage.setItem('userId', mockUserId);
    expect(getUserId()).toEqual(mockUserId);
    localStorage.removeItem('userId');
  });

  it('returns session id on getSessionId if storage is set', () => {
    localStorage.setItem('sessionId', mockSessionId);
    expect(getSessionId()).toEqual(mockSessionId);
    localStorage.removeItem('sessionId');
  });

  it('sets session id on local storage correectly', () => {
    setSessionId(mockSessionId);
    expect(localStorage.getItem('sessionId')).toEqual(mockSessionId);
    localStorage.removeItem('sessionId');
  });
});
