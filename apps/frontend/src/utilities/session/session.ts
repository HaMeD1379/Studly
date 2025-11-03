export const getUserId = () => localStorage.getItem('userId') ?? '';

export const getAccessToken = () => localStorage.getItem('accessToken') ?? '';

export const setSessionId = (sessionId: string) =>
  localStorage.setItem('sessionId', sessionId) ?? '';

export const getSessionId = () => localStorage.getItem('sessionId') ?? '';
