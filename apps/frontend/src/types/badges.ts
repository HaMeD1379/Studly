export type Badge = {
  name: string;
  description: string;
};

export type UnlockedBadge = Badge & {
  earnedAt: string;
};

export type BadgeLoader = {
  badges: {
    earnedAt: string;
    badge: Badge;
  }[];
};
