type LeaderboardEntry = {
  displayName: string,
  rank: number,
  isSelf: boolean,
};

export type BadgeLeaderboardEntry = LeaderboardEntry & {
  badgeCount: number,
};

export type StudyTimeLeaderboardEntry = LeaderboardEntry & {
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

export enum LeaderboardPageType {
  StudyTime = 'studyTime',
  Badges = 'badges',
}
