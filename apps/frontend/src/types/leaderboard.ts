type LeaderboardRow = {
  userId: string,
  displayName: string,
  rank: number,
  totalMinutes?: number,
  badgeCount?: number,
  isSelf: boolean,
};

type LeaderboardPage = {
  studyTime: LeaderboardRow[];
  badges: LeaderboardRow[];
};

export type LeaderboardLoader = {
  friends: LeaderboardPage[];
  global: LeaderboardPage[];
};