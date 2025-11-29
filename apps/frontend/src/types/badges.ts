export type Badge = {
  name: string;
  description: string;
};

export type UnlockedBadge = Badge & {
  earnedAt: string;
};

export type InProgressBadge = Badge & {
  progress: number;
};

export type BadgeLoader = {
  badges: {
    earnedAt: string;
    badge: Badge;
    progress?: number;
  }[];
};
