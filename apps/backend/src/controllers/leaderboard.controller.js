/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/leaderboard.controller.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT for documentation and validation logic
 *  Last-Updated: 2025-11-14
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express controller for leaderboard endpoints. Handles request validation,
 *  parameter parsing, and response formatting for leaderboard API.
 *
 *  Endpoints (paired with router):
 *  • getLeaderboard(req, res, next) → GET / : fetch all four leaderboards
 *
 *  Design Notes
 *  ------------
 *  • Separation of concerns: keeps DB logic in service layer
 *  • Dependency injection: accepts service for easy Jest mocking
 *  • Defensive programming: validates userId and limit parameters
 *  • Follows sessions.controller.js patterns for consistency
 *
 *  Query Parameters
 *  ----------------
 *  • userId (required): UUID of requesting user
 *  • limit (optional): Max entries per leaderboard (default 7, max 50)
 *
 *  Response Format
 *  ---------------
 *  {
 *    friends: { studyTime: [], badges: [] },
 *    global: { studyTime: [], badges: [] },
 *    metadata: { userId, limit, generatedAt }
 *  }
 *
 *  TODOs
 *  -----
 *  • Add authentication middleware when auth is finalized
 *  • Add request rate limiting for production
 *  • Add structured logging with request IDs
 *  • Consider adding ETag support for caching
 *
 *  @module controllers/leaderboard
 *  @see ../services/leaderboard.service.js
 * ────────────────────────────────────────────────────────────────────────────────
 */

import leaderboardService from '../services/leaderboard.service.js';

/**
 * Parse and validate limit parameter.
 * @param {string|number} value - Limit value from query string
 * @returns {number} Validated limit (default 7, max 50)
 * @throws {Error} If limit is invalid
 */
const parseLimit = (value) => {
  if (value === undefined || value === null) {
    return 7; // Default
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('limit must be a positive integer');
  }

  if (parsed > 50) {
    throw new Error('limit cannot exceed 50');
  }

  return parsed;
};

/**
 * Validate UUID format (basic check).
 * @param {string} value - UUID string to validate
 * @returns {boolean} True if valid UUID format
 */
const isValidUUID = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Factory for leaderboard controller — allows injecting mock service in tests.
 * @param {object} service - Leaderboard service with getLeaderboards method
 * @returns {{getLeaderboard: Function}}
 */
export const createLeaderboardController = (service = leaderboardService) => {

  /**
   * GET /
   * Fetch all four leaderboards (friends/global × study time/badges).
   *
   * Query params:
   *   - userId (required): UUID of requesting user
   *   - limit (optional): Max entries per leaderboard (default 7, max 50)
   *
   * Response: 200 OK with leaderboard data
   * Errors: 400 Bad Request, 500 Internal Server Error
   */
  const getLeaderboard = async (req, res, next) => {
    try {
      const { userId, limit } = req.query ?? {};

      // Validate userId (required)
      if (!userId) {
        return res.status(400).json({
          error: 'userId query parameter is required'
        });
      }

      if (!isValidUUID(userId)) {
        return res.status(400).json({
          error: 'userId must be a valid UUID'
        });
      }

      // Parse and validate limit (optional)
      let parsedLimit;
      try {
        parsedLimit = parseLimit(limit);
      } catch (validationError) {
        return res.status(400).json({
          error: validationError.message
        });
      }

      // Fetch leaderboards from service
      const leaderboards = await service.getLeaderboards(userId, parsedLimit);

      return res.status(200).json(leaderboards);

    } catch (error) {
      // Log error for debugging (in production, use structured logging)
      console.error('[Leaderboard Controller Error]', {
        error: error.message,
        stack: error.stack
      });

      return next(error);
    }
  };

  return {
    getLeaderboard
  };
};

// Default export: concrete controller instance
const controller = createLeaderboardController(leaderboardService);
export const { getLeaderboard } = controller;
export default controller;

