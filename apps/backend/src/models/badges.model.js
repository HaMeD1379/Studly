/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/models/badges.model.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Zod schemas for badge-related data validation and type safety.
 *  Matches the actual Supabase database schema for badges and user_badges tables.
 *
 *  Database Schema Mapping:
 *  ------------------------
 *  badge table: badge_id, name, description, icon_url, category, criteria_type, 
 *               threshold, created_at
 *  user_badge table: badge_id, user_id, earned_at
 *
 *  Design Notes
 *  ------------
 *  • Maps snake_case DB fields to camelCase API fields
 *  • Progress is calculated on-the-fly, not stored in DB
 *  • Uses criteria_type + threshold instead of nested requirements object
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

// Badge criteria types that match database enum
export const CriteriaType = z.enum([
  'consecutive_days',
  'total_minutes', 
  'session_count',
  'custom'
]);

// Badge categories
export const BadgeCategory = z.enum([
  'streak',
  'time',
  'milestone',
  'special'
]);

/**
 * Schema for Badge entity (from database)
 * Maps to 'badge' table in Supabase
 */
export const BadgeSchema = z.object({
  badgeId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string(),
  iconUrl: z.string().url().nullable().optional(),
  category: BadgeCategory,
  criteriaType: CriteriaType,
  threshold: z.number().positive(),
  createdAt: z.string().datetime().optional()
});

/**
 * Schema for UserBadge entity (from database)
 * Maps to 'user_badge' table in Supabase
 * Note: No primary key 'id' or 'progress' column in actual DB
 */
export const UserBadgeSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid(),
  earnedAt: z.string().datetime(),
  badge: BadgeSchema.optional() // When joined with badges table
});

/**
 * Schema for UserBadge with calculated progress (not stored in DB)
 * Used when API needs to return progress information
 */
export const UserBadgeWithProgressSchema = UserBadgeSchema.extend({
  progress: z.number().min(0).max(100).optional()
});

// ============================================================================
// Input Validation Schemas for API Endpoints
// ============================================================================

export const AwardBadgeInputSchema = z.object({
  userId: z.string().uuid(),
  badgeId: z.string().uuid()
});

export const GetUserBadgesInputSchema = z.object({
  userId: z.string().uuid(),
  includeProgress: z.coerce.boolean().optional().default(false)
});

export const CheckBadgesInputSchema = z.object({
  userId: z.string().uuid()
});

// ============================================================================
// Badge Criteria Definitions (Business Rules)
// ============================================================================

/**
 * Predefined badge definitions that match database records
 * These should be seeded into the 'badge' table
 */
export const BADGE_DEFINITIONS = {
  FIRST_SESSION: {
    name: 'First Steps',
    description: 'Complete your first study session',
    category: 'milestone',
    criteriaType: 'session_count',
    threshold: 1,
    iconUrl: null
  },
  THREE_DAY_STREAK: {
    name: 'Consistent Learner',
    description: 'Study for 3 days in a row',
    category: 'streak',
    criteriaType: 'consecutive_days',
    threshold: 3,
    iconUrl: null
  },
  WEEK_WARRIOR: {
    name: 'Week Warrior',
    description: 'Study for 7 days in a row',
    category: 'streak',
    criteriaType: 'consecutive_days',
    threshold: 7,
    iconUrl: null
  },
  MONTH_MASTER: {
    name: 'Month Master',
    description: 'Study for 30 days in a row',
    category: 'streak',
    criteriaType: 'consecutive_days',
    threshold: 30,
    iconUrl: null
  },
  HOUR_HERO: {
    name: 'Hour Hero',
    description: 'Study for a total of 60 minutes',
    category: 'time',
    criteriaType: 'total_minutes',
    threshold: 60,
    iconUrl: null
  },
  FIVE_HOUR_CHAMPION: {
    name: 'Five Hour Champion',
    description: 'Study for a total of 5 hours',
    category: 'time',
    criteriaType: 'total_minutes',
    threshold: 300,
    iconUrl: null
  },
  TEN_SESSIONS: {
    name: 'Dedicated Student',
    description: 'Complete 10 study sessions',
    category: 'milestone',
    criteriaType: 'session_count',
    threshold: 10,
    iconUrl: null
  }
};

export default {
  BadgeSchema,
  UserBadgeSchema,
  UserBadgeWithProgressSchema,
  AwardBadgeInputSchema,
  GetUserBadgesInputSchema,
  CheckBadgesInputSchema,
  CriteriaType,
  BadgeCategory,
  BADGE_DEFINITIONS
};