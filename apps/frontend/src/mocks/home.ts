import { mockHomeFeed } from './feed';

export const mockHomePageLoaderData = {
  data: {
    homeFeed: mockHomeFeed,
    inProgressBadges: [
      { description: 'Study 10 hours', name: 'Marathon', progress: 70 },
      { description: 'Study 3 days straight', name: 'Sprinter', progress: 40 },
    ],
    todaySession: {
      totalMinutesStudied: 120,
    },
    unlockedBadges: [{ name: 'First Steps' }, { name: 'Consistency' }],
    userProfileInfo: {
      data: {
        bio: 'Keep pushing forward!',
        full_name: 'Alice',
      },
    },
  },
};
