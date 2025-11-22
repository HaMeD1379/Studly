import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfileStore } from '~/types';

export const profileInfo = create<ProfileStore>()(
  persist(
    (set, _get) => ({
      allTimeHoursStudied: '',
      setAllTimeHoursStudied: (newAllTimeHoursStudied) =>
        set({ allTimeHoursStudied: newAllTimeHoursStudied }),
    }),
    {
      name: 'profile_storage',
    },
  ),
);
