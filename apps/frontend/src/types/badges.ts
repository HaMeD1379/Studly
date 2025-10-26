export type Badge = {
  name: string;
  description: string;
};

export type UnlockedBadge = Badge & {
  timeUnlocked: number;
}