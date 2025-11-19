export type UserStore = {
  accessToken: string;
  bio: string;
  name: string;
  email: string;
  userId: string;
  refreshToken: string;
  isAccessStored: boolean;
  sessionId: string;
  setAccessToken: (newAccessToken: string) => void;
  setBio: (newBio: string) => void;
  setName: (newName: string) => void;
  setEmail: (newEmail: string) => void;
  setId: (newId: string) => void;
  setSessionId: (newSessionId: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setAccessStored: (bool: boolean) => void;
  setCheckAccess: () => void;
};
