import type { AvatarState } from '~/constants';
import { UnlockedBadge } from './badges';

export type UserStore = {
  accessToken: string;
  bio: string;
  name: string;
  email: string;
  userId: string;
  refreshToken: string;
  isAccessStored: boolean;
  sessionId: string;
  avatarState: AvatarState;
  setAccessToken: (newAccessToken: string) => void;
  setAvatarState: (newState: AvatarState) => void;
  setBio: (newBio: string) => void;
  setName: (newName: string) => void;
  setEmail: (newEmail: string) => void;
  setId: (newId: string) => void;
  setSessionId: (newSessionId: AvatarState) => void;
  setRefreshToken: (refreshToken: string) => void;
  setAccessStored: (bool: boolean) => void;
  setCheckAccess: () => void;
};

export type ProfileStore = {
  allTimeHoursStudied: string;
  setAllTimeHoursStudied: (newAllTime: string) => void;
};

export type BadgesStore = {
  userBadges: UnlockedBadge[]
  setUserBadges: (newUserBadges: UnlockedBadge[]) => void;
}
