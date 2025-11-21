import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AVATAR_OFFLINE } from '~/constants';
import type { UserStore } from '~/types';

// Zustand docs were used for persistance: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
export const userInfo = create<UserStore>()(
  persist(
    (set, get) => ({
      accessToken: '',
      avatarState: AVATAR_OFFLINE,
      bio: '',
      email: '',
      isAccessStored: false,
      name: '',
      refreshToken: '',
      sessionId: '',
      setAccessStored: (newAccessStored) =>
        set({ isAccessStored: newAccessStored }),
      setAccessToken: (newAccessToken) => set({ accessToken: newAccessToken }),
      setAvatarState: (newState) => set({ avatarState: newState }),
      setBio: (newBio) => set({ bio: newBio }),
      setCheckAccess: () => {
        const { isAccessStored } = get();
        if (!isAccessStored) {
          set({
            bio: '',
            email: '',
            name: '',
            refreshToken: '',
            userId: '',
          });
        }
      },
      setEmail: (newEmail) => set({ email: newEmail }),
      setId: (newId) => set({ userId: newId }),
      setName: (newName) => set({ name: newName }),
      setRefreshToken: (newRefreshToken) =>
        set({ refreshToken: newRefreshToken }),
      setSessionId: (newSessionId) => set({ sessionId: newSessionId }),
      userId: '',
    }),
    {
      name: 'user_storage',
    },
  ),
);
