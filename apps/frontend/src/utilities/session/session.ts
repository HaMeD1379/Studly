import { userInfoStore } from '~/store/userInfoStore';

export const getUserId = () => {
  return userInfoStore.getState().userId ?? '';
};

export const getSessionId = () => {
  return userInfoStore.getState().sessionId ?? '';
};

export const setSessionId = (sessionId: string) => {
  return userInfoStore.getState().setSessId(sessionId);
};

export const getAccessToken = () => localStorage.getItem('accessToken') ?? '';
