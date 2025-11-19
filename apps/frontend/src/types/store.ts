export type UserStore = {
  bio: string;
  name: string;
  email: string;
  userId: string;
  refreshToken: string;
  isAccessStored: boolean;
  sessionId: string;
  setBio: (newBio: string) => void;
  setName: (newName: string) => void;
  setEmail: (newEmail: string) => void;
  setId: (newId: string) => void;
  setSessionId: (newSessionId: string) => void;
  setRefreshToken: (refresh_token: string) => void;
  setAccessStored: (bool: boolean) => void;
  setCheckAccess: () => void;
};
