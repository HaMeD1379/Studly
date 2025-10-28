/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/badges.routes.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Versioned router for badge-related endpoints. Routes are mounted at /api/v1/badges
 *  in the main application file.
 *
 *  Endpoints
 *  ---------
 *  GET    /api/v1/badges                     - Get all available badges
 *  GET    /api/v1/badges/users/:userId       - Get user's earned badges
 *  POST   /api/v1/badges/award                - Manually award a badge
 *  POST   /api/v1/badges/users/:userId/check  - Check and auto-award badges
 *
 *  Design Principles
 *  -----------------
 *  • Thin routing layer - no business logic
 *  • Uses validation middleware for input sanitization
 *  • Supports API versioning via /api/v1 prefix
 *
 *  TODOs
 *  -----
 *  • Add authentication middleware once auth is ready
 *  • Consider rate limiting for check endpoint
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import badgesController from '../../controllers/badges.controller.js';
import { validateRequest } from '../../middleware/badge.validation.middleware.js';
import {
  GetUserBadgesInputSchema,
  AwardBadgeInputSchema,
  CheckBadgesInputSchema
} from '../../models/badges.model.js';

const router = express.Router();

// ============================================================================
// Public Routes (no auth required for now)
// ============================================================================

/**
 * GET /
 * Retrieve all available badges in the system.
 */
router.get(
  '/',
  badgesController.getAllBadges
);

/**
 * GET /users/:userId
 * Get badges earned by a specific user.
 * Query: ?includeProgress=true (optional - calculates progress on unearned badges)
 */
router.get(
  '/users/:userId',
  validateRequest(GetUserBadgesInputSchema),
  badgesController.getUserBadges
);

/**
 * POST /award
 * Manually award a badge to a user.
 * Body: { userId: string, badgeId: string }
 * Returns: 201 Created with awarded badge, or 409 if already earned
 */
router.post(
  '/award',
  validateRequest(AwardBadgeInputSchema),
  badgesController.awardBadge
);

/**
 * POST /users/:userId/check
 * Check user's study sessions and automatically award newly earned badges.
 * Returns: 200 OK with array of newly awarded badges
 */
router.post(
  '/users/:userId/check',
  validateRequest(CheckBadgesInputSchema),
  badgesController.checkUserBadges
);

export default router;