import { create } from 'zustand';

export type BioStore = {
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
  setSessId: (newSessionId: string) => void;
  setRefreshToken: (refresh_token: string) => void;
  setAccessStored: (bool: boolean) => void;
  setCheckAccess: () => void;
};

export const userInfoStore = create<BioStore>((set, get) => ({
  bio: '',
  email: '',
  isAccessStored: false,
  name: '',
  refreshToken: '',
  sessionId: '',
  setAccessStored: (bool) => set({ isAccessStored: bool }),
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
  setRefreshToken: (refresh_token) => set({ refreshToken: refresh_token }),
  setSessId: (session_id) => set({ sessionId: session_id }),
  userId: '',
}));
