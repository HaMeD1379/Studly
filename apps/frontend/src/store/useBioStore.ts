import { create } from 'zustand';

interface BioStore {
  bio: string;
  setBio: (newBio: string) => void;
}

export const useBioStore = create<BioStore>((set, _get) => ({
  bio: '',
  setBio: (newBio) => set({ bio: newBio }),
}));
