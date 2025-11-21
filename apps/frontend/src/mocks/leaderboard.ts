export const mockStudyTimeLeaderboard = [
  {
    displayName: 'John',
    rank: 1,
    isSelf: false,
    totalMinutes: 100,
  },
  {
    displayName: 'Joe',
    rank: 2,
    isSelf: false,
    totalMinutes: 60,
  },
  {
    displayName: 'You',
    rank: 3,
    isSelf: true,
    totalMinutes: 59,
  },
];

export const mockBadgesLeaderboard = [
  {
    displayName: 'John',
    rank: 1,
    isSelf: false,
    badgeCount: 4,
  },
  {
    displayName: 'Joe',
    rank: 2,
    isSelf: false,
    badgeCount: 2,
  },
  {
    displayName: 'You',
    rank: 3,
    isSelf: true,
    badgeCount: 1,
  },
];

export const mockLeaderboardLoaderResponse = {
  data: {
    friends: {
      studyTime: [
        mockStudyTimeLeaderboard[0],
      ],
      badges: [
        mockBadgesLeaderboard[0]
      ],
    },
    global: {
      studyTime: mockStudyTimeLeaderboard,
      badges: mockBadgesLeaderboard,
    }
  },
  error: false,
};

export const mockLeaderboardErrorResponse = {
  data: {
    friends: {
      studyTime: [],
      badges: [],
    },
    global: {
      studyTime: [],
      badges: [],
    },
  },
  error: true,
};