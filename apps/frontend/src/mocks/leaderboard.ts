export const mockStudyTimeLeaderboard = [
  {
    displayName: 'John',
    isSelf: false,
    rank: 1,
    totalMinutes: 100,
  },
  {
    displayName: 'Joe',
    isSelf: false,
    rank: 2,
    totalMinutes: 60,
  },
  {
    displayName: 'You',
    isSelf: true,
    rank: 3,
    totalMinutes: 59,
  },
];

export const mockBadgesLeaderboard = [
  {
    badgeCount: 4,
    displayName: 'John',
    isSelf: false,
    rank: 1,
  },
  {
    badgeCount: 2,
    displayName: 'Joe',
    isSelf: false,
    rank: 2,
  },
  {
    badgeCount: 1,
    displayName: 'You',
    isSelf: true,
    rank: 3,
  },
];

export const mockLeaderboardLoaderResponse = {
  data: {
    friends: {
      badges: [mockBadgesLeaderboard[0]],
      studyTime: [mockStudyTimeLeaderboard[0]],
    },
    global: {
      badges: mockBadgesLeaderboard,
      studyTime: mockStudyTimeLeaderboard,
    },
  },
  error: false,
};

export const mockLeaderboardErrorResponse = {
  data: {
    friends: {
      badges: [],
      studyTime: [],
    },
    global: {
      badges: [],
      studyTime: [],
    },
  },
  error: true,
};
