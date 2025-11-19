/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/models/feed.model.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Zod schemas for feed activity data validation and type safety.
 *  Defines activity types for the home page social feed.
 *
 *  Activity Types:
 *  ---------------
 *  • badge_earned: User earned a new badge
 *  • study_milestone: User hit X total hours/sessions milestone
 *  • streak_milestone: User reached a streak milestone
 *
 *  Design Notes
 *  ------------
 *  • Maps snake_case DB fields to camelCase API fields
 *  • Activity types are polymorphic (different data shapes)
 *  • Pagination uses cursor-based approach with timestamps
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

// Activity type enum
export const ActivityType = z.enum([
  'badge_earned',
  'study_milestone',
  'streak_milestone'
]);

/**
 * Base user info that appears in all activities
 */
export const ActivityUserSchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional()
});

/**
 * Badge earned activity data
 */
export const BadgeActivityDataSchema = z.object({
  badgeId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url().nullable().optional(),
  category: z.string()
});

/**
 * Study milestone activity data
 * Examples: "Reached 5 hours", "Completed 10 sessions"
 */
export const StudyMilestoneDataSchema = z.object({
  type: z.enum(['total_hours', 'session_count']),
  value: z.number().positive(),
  description: z.string()
});

/**
 * Streak milestone activity data
 * Example: "On a 10-day streak!"
 */
export const StreakMilestoneDataSchema = z.object({
  days: z.number().positive(),
  description: z.string()
});

/**
 * Union schema for activity data (polymorphic)
 */
export const ActivityDataSchema = z.union([
  z.object({ badge: BadgeActivityDataSchema }),
  z.object({ milestone: StudyMilestoneDataSchema }),
  z.object({ streak: StreakMilestoneDataSchema })
]);

/**
 * Complete activity schema
 */
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  type: ActivityType,
  timestamp: z.string().datetime(),
  user: ActivityUserSchema
}).and(ActivityDataSchema);

/**
 * Pagination metadata
 */
export const PaginationSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().datetime().nullable(),
  count: z.number().nonnegative()
});

/**
 * Feed response schema
 */
export const FeedResponseSchema = z.object({
  activities: z.array(ActivitySchema),
  pagination: PaginationSchema
});

// ============================================================================
// Input Validation Schemas for API Endpoints
// ============================================================================

export const GetFeedInputSchema = z.object({
  userId: z.string().uuid(),
  limit: z.coerce.number().positive().max(50).optional().default(20),
  before: z.string().datetime().optional()
});

// ============================================================================
// Milestone Thresholds (Business Rules)
// ============================================================================

/**
 * Define which milestones trigger feed activities
 * Notable achievements worth sharing
 */
export const MILESTONE_THRESHOLDS = {
  TOTAL_HOURS: [1, 5, 10, 25, 50, 100], // Hours
  SESSION_COUNT: [1, 10, 25, 50, 100, 250], // Number of sessions
  STREAK_DAYS: [3, 7, 14, 30, 60, 100] // Consecutive days
};

export default {
  ActivityType,
  ActivityUserSchema,
  BadgeActivityDataSchema,
  StudyMilestoneDataSchema,
  StreakMilestoneDataSchema,
  ActivityDataSchema,
  ActivitySchema,
  PaginationSchema,
  FeedResponseSchema,
  GetFeedInputSchema,
  MILESTONE_THRESHOLDS
};
