import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BadgesStore } from '~/types';

export const badgesStore = create<BadgesStore>()(
  persist(
    (set, _get) => ({
      userBadges: [],
      setUserBadges: (newUserBadges) =>
        set({ userBadges: newUserBadges }),
    }),
    {
      name: 'user_badges_storage',
    },
  ),
);