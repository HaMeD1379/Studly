import { create } from 'zustand';
import type { UserStore } from '~/types';

export const userInfoStore = create<UserStore>((set, get) => ({
  bio: '',
  email: '',
  isAccessStored: false,
  name: '',
  refreshToken: '',
  sessionId: '',
  userId: '',
  setAccessStored: (newAccessStored) => set({ isAccessStored: newAccessStored }),
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
  setRefreshToken: (newRefreshToken) => set({ refreshToken: newRefreshToken }),
  setSessionId: (newSessionId) => set({ sessionId: newSessionId }),
}));
