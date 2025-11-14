/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/leaderboard.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT for documentation
 *  Last-Updated: 2025-11-14
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Versioned router for leaderboard endpoints. Provides a single GET endpoint
 *  to fetch all four leaderboards (friends/global × study time/badges) optimized
 *  for frontend caching.
 *
 *  Features
 *  --------
 *  • GET /leaderboard?userId={uuid}&limit={number} → fetch all leaderboards
 *  • Returns top N users ranked by study time and badge count
 *  • Marks requesting user with "You" label and isSelf flag
 *  • Friends defined as status=2 in friends table (accepted friend requests)
 *
 *  Design Principles
 *  -----------------
 *  • Maintain separation of concerns (routing vs. controller logic)
 *  • Support API versioning via /api/v1 prefix for forward compatibility
 *  • Heavy endpoint design: single call returns all needed data for caching
 *
 *  TODOs
 *  -----
 *  • Add caching headers (Cache-Control, ETag) for better performance
 *  • Add rate limiting to prevent abuse
 *  • Add authentication middleware when auth is finalized
 *
 *  @module routes/v1/leaderboard
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { getLeaderboard } from '../../controllers/leaderboard.controller.js';

const router = Router();

/**
 * GET /
 * Fetch all four leaderboards in a single response.
 *
 * Query Parameters:
 *   - userId (required): UUID of requesting user
 *   - limit (optional): Max entries per leaderboard (default 7, max 50)
 *
 * Response: {
 *   friends: { studyTime: [], badges: [] },
 *   global: { studyTime: [], badges: [] },
 *   metadata: { userId, limit, generatedAt }
 * }
 */
router.get('/', getLeaderboard);

export default router;

