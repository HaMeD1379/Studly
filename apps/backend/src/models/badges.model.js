import { z } from 'zod';

// Define the shape of a Badge
export const BadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string(),
  category: z.enum(['streak', 'time', 'milestone', 'special']),
  imageUrl: z.string().url().optional(),
  requirements: z.object({
    type: z.enum(['consecutive_days', 'total_minutes', 'session_count', 'custom']),
    value: z.number(),
    metadata: z.record(z.any()).optional()
  }),
  sortOrder: z.number().optional(),
  isActive: z.boolean().default(true)
});

// Define the shape of a UserBadge
export const UserBadgeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  progress: z.number().min(0).max(100),
  earnedAt: z.string().datetime().nullable(),
  badge: BadgeSchema.optional() // For when we join with badges table
});

// Input validation schemas
export const AwardBadgeInputSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid()
});

export const UpdateProgressInputSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  progress: z.number().min(0).max(100)
});

export const GetUserBadgesInputSchema = z.object({
  userId: z.string().uuid(),
  includeProgress: z.boolean().optional().default(true)
});

// Badge criteria definitions (business rules)
export const BADGE_CRITERIA = {
  FIRST_SESSION: {
    type: 'session_count',
    value: 1,
    name: 'First Steps',
    description: 'Complete your first study session'
  },
  THREE_DAY_STREAK: {
    type: 'consecutive_days',
    value: 3,
    name: 'Consistent Learner',
    description: 'Study for 3 days in a row'
  },
  WEEK_WARRIOR: {
    type: 'consecutive_days',
    value: 7,
    name: 'Week Warrior',
    description: 'Study for 7 days in a row'
  },
  HOUR_HERO: {
    type: 'total_minutes',
    value: 60,
    name: 'Hour Hero',
    description: 'Study for a total of 1 hour'
  },
  // Add more badge definitions
};