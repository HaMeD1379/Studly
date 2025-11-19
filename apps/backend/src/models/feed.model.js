/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/models/feed.model.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Zod schemas for feed activity data validation and type safety.
 *  Defines activity types that appear in user's social feed.
 *
 *  Activity Types:
 *  ---------------
 *  • badge_earned: Friend earned a badge
 *  • study_milestone: Friend reached X total hours
 *  • streak_milestone: Friend reached X day streak
 *
 *  Design Notes
 *  ------------
 *  • Activities are derived from user_badge and sessions tables
 *  • No dedicated activities table - computed on query
 *  • Sorted by timestamp DESC for reverse chronological feed
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

/**
 * Activity types that can appear in feed
 */
export const ActivityType = z.enum([
  'badge_earned',
  'study_milestone', 
  'streak_milestone'
]);

/**
 * User info embedded in activity (from profile/auth)
 */
export const ActivityUserSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  avatarUrl: z.string().url().nullable().optional()
});

/**
 * Badge data for badge_earned activities
 */
export const ActivityBadgeSchema = z.object({
  badgeId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url().nullable().optional(),
  category: z.string()
});

/**
 * Milestone data for study/streak milestones
 */
export const ActivityMilestoneSchema = z.object({
  type: z.enum(['total_hours', 'total_sessions', 'streak_days']),
  value: z.number().positive(),
  description: z.string()
});

/**
 * Base activity schema
 */
export const FeedActivitySchema = z.object({
  id: z.string(), // Composite: type + userId + timestamp
  type: ActivityType,
  timestamp: z.string().datetime(),
  user: ActivityUserSchema,
  badge: ActivityBadgeSchema.optional(), // Only for badge_earned
  milestone: ActivityMilestoneSchema.optional() // Only for milestones
});

/**
 * Feed response with pagination
 */
export const FeedResponseSchema = z.object({
  activities: z.array(FeedActivitySchema),
  pagination: z.object({
    hasMore: z.boolean(),
    nextCursor: z.string().datetime().nullable(),
    count: z.number()
  })
});

// ============================================================================
// Input Validation Schemas
// ============================================================================

/**
 * GET /feed query params
 */
export const GetFeedInputSchema = z.object({
  userId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  before: z.string().datetime().optional() // Cursor for pagination
});

export default {
  ActivityType,
  ActivityUserSchema,
  ActivityBadgeSchema,
  ActivityMilestoneSchema,
  FeedActivitySchema,
  FeedResponseSchema,
  GetFeedInputSchema
};
