type LeaderboardEntry = {
  userId: string,
  displayName: string,
  rank: number,
  isSelf: boolean,
};

type BadgeLeaderboardEntry = LeaderboardEntry | {
  badgeCount: number,
};

type StudyTimeLeaderboardEntry = LeaderboardEntry | {
  totalMinutes: number,
};

type LeaderboardPage = {
  studyTime: StudyTimeLeaderboardEntry[];
  badges: BadgeLeaderboardEntry[];
};

export type LeaderboardLoader = {
  friends: LeaderboardPage[];
  global: LeaderboardPage[];
};