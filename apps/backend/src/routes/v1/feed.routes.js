/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/feed.routes.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Versioned router for feed-related endpoints. Routes are mounted at /api/v1/feed
 *  in the main application file.
 *
 *  Endpoints
 *  ---------
 *  GET    /api/v1/feed                 - Get activity feed for user
 *  GET    /api/v1/feed/check-access    - Check if user can view activities
 *
 *  Design Principles
 *  -----------------
 *  • Thin routing layer - no business logic
 *  • Uses validation middleware for input sanitization
 *  • Supports API versioning via /api/v1 prefix
 *
 *  TODOs
 *  -----
 *  • Add authentication middleware to verify userId matches JWT
 *  • Consider rate limiting for feed endpoint
 *  • Add caching headers for feed responses
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import feedController from '../../controllers/feed.controller.js';
import { validateRequest } from '../../middleware/badge.validation.middleware.js'; // Reuse existing validation
import { GetFeedInputSchema } from '../../models/feed.model.js';

const router = express.Router();

// ============================================================================
// Public Routes (no auth required for now - add auth middleware later)
// ============================================================================

/**
 * GET /
 * Get activity feed for a user.
 * 
 * Query Parameters:
 * - userId (required): UUID of user requesting feed
 * - limit (optional): Number of activities to return (default: 20, max: 100)
 * - before (optional): ISO timestamp for cursor-based pagination
 * - type (optional): Filter by activity type ('badge_earned', 'study_milestone', etc.)
 * 
 * Example:
 * GET /api/v1/feed?userId=123e4567-e89b-12d3-a456-426614174000&limit=20
 * GET /api/v1/feed?userId=123e4567-e89b-12d3-a456-426614174000&before=2025-11-19T10:00:00Z
 * GET /api/v1/feed?userId=123e4567-e89b-12d3-a456-426614174000&type=badge_earned
 * 
 * Response:
 * {
 *   "activities": [
 *     {
 *       "id": "badge_uuid1_user_uuid1",
 *       "type": "badge_earned",
 *       "timestamp": "2025-11-19T09:30:00Z",
 *       "user": {
 *         "userId": "user-uuid",
 *         "username": "john_doe",
 *         "avatarUrl": null,
 *         "bio": "Student studying CS"
 *       },
 *       "badge": {
 *         "badgeId": "badge-uuid",
 *         "name": "Week Warrior",
 *         "description": "Study for 7 days in a row",
 *         "iconUrl": null,
 *         "category": "streak",
 *         "criteriaType": "consecutive_days",
 *         "threshold": 7
 *       }
 *     }
 *   ],
 *   "pagination": {
 *     "hasMore": true,
 *     "nextCursor": "2025-11-19T08:15:00Z",
 *     "count": 20
 *   }
 * }
 */
router.get(
  '/',
  validateRequest(GetFeedInputSchema),
  feedController.getFeed
);

/**
 * GET /check-access
 * Check if a user has permission to view another user's activities.
 * Used for privacy checks before showing activity details.
 * 
 * Query Parameters:
 * - viewerId: UUID of user requesting access
 * - targetUserId: UUID of user whose activities are being viewed
 * 
 * Response:
 * { "canView": true }
 */
router.get(
  '/check-access',
  feedController.checkAccess
);

export default router;
