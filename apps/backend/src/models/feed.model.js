/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/models/feed.model.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Zod schemas for feed-related data validation and type safety.
 *  Defines activity types for the social feed (badge achievements, milestones).
 *
 *  Activity Types
 *  --------------
 *  • badge_earned: Friend earned a new badge
 *  • study_milestone: Friend reached X hours of study (future)
 *  • streak_milestone: Friend reached X day streak (future)
 *
 *  Design Notes
 *  ------------
 *  • Cursor-based pagination using timestamp
 *  • Returns camelCase for API, maps from snake_case DB
 *  • User info included for avatar/username display
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

/**
 * Activity types that can appear in the feed
 */
export const ActivityType = z.enum([
  'badge_earned',
  'study_milestone',    // Future: when user hits 5hr, 10hr, etc.
  'streak_milestone'    // Future: when user hits 10-day, 30-day streak
]);

/**
 * User information embedded in activity
 */
export const ActivityUserSchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(1),
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional()
});

/**
 * Badge information for badge_earned activities
 */
export const ActivityBadgeSchema = z.object({
  badgeId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url().nullable().optional(),
  category: z.string(),
  criteriaType: z.string(),
  threshold: z.number()
});

/**
 * Base activity schema - all activities have these fields
 */
export const BaseActivitySchema = z.object({
  id: z.string().uuid(),
  type: ActivityType,
  timestamp: z.string().datetime(),
  user: ActivityUserSchema
});

/**
 * Badge earned activity - when a friend earns a badge
 */
export const BadgeEarnedActivitySchema = BaseActivitySchema.extend({
  type: z.literal('badge_earned'),
  badge: ActivityBadgeSchema
});

/**
 * Study milestone activity (future implementation)
 */
export const StudyMilestoneActivitySchema = BaseActivitySchema.extend({
  type: z.literal('study_milestone'),
  milestone: z.object({
    type: z.enum(['total_hours', 'session_count']),
    value: z.number(),
    description: z.string()
  })
});

/**
 * Streak milestone activity (future implementation)
 */
export const StreakMilestoneActivitySchema = BaseActivitySchema.extend({
  type: z.literal('streak_milestone'),
  streak: z.object({
    days: z.number(),
    description: z.string()
  })
});

/**
 * Union type for any activity
 */
export const ActivitySchema = z.discriminatedUnion('type', [
  BadgeEarnedActivitySchema,
  StudyMilestoneActivitySchema,
  StreakMilestoneActivitySchema
]);

/**
 * Feed response with pagination
 */
export const FeedResponseSchema = z.object({
  activities: z.array(ActivitySchema),
  pagination: z.object({
    hasMore: z.boolean(),
    nextCursor: z.string().datetime().nullable(),
    count: z.number()
  })
});

// ============================================================================
// Input Validation Schemas for API Endpoints
// ============================================================================

/**
 * GET /api/v1/feed
 * Query params validation
 */
export const GetFeedInputSchema = z.object({
  userId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  before: z.string().datetime().optional(), // Cursor for pagination
  type: ActivityType.optional() // Optional filter by activity type
});

/**
 * Validation for checking if users are friends
 */
export const CheckFriendsInputSchema = z.object({
  userId: z.string().uuid(),
  friendIds: z.array(z.string().uuid())
});

export default {
  ActivityType,
  ActivityUserSchema,
  ActivityBadgeSchema,
  BaseActivitySchema,
  BadgeEarnedActivitySchema,
  StudyMilestoneActivitySchema,
  StreakMilestoneActivitySchema,
  ActivitySchema,
  FeedResponseSchema,
  GetFeedInputSchema,
  CheckFriendsInputSchema
};
