/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/badges.controller.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express controller for badge-related endpoints. Handles request validation,
 *  delegates business logic to badges service, and formats HTTP responses.
 *
 *  Endpoints (paired with router):
 *  • getAllBadges(req, res, next)      → GET    /               : all available badges
 *  • getUserBadges(req, res, next)     → GET    /users/:userId  : user's earned badges
 *  • awardBadge(req, res, next)        → POST   /award          : manually award badge
 *  • checkUserBadges(req, res, next)   → POST   /users/:userId/check : auto-check & award
 *
 *  Design Notes
 *  ------------
 *  • Minimal logic - delegates to service layer
 *  • Uses req.validated from middleware for input
 *  • Consistent error handling via Express next()
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import badgesService from '../services/badges.service.js';

/**
 * Factory function for badges controller - allows injecting a mock service in tests.
 * @param {object} service - Badges service with getAllBadges, getUserBadges, etc.
 * @returns {object} Controller with request handler functions
 */
export const createBadgesController = (service = badgesService) => {
  
  /**
   * GET /
   * Retrieve all available badges in the system.
   * Response: 200 OK { badges: [] }
   */
  const getAllBadges = async (req, res, next) => {
    try {
      const badges = await service.getAllBadges();
      return res.status(200).json({ badges });
    } catch (error) {
      return next(error);
    }
  };
  
  /**
   * GET /users/:userId
   * Get all badges earned by a specific user.
   * Query params: ?includeProgress=true (optional)
   * Response: 200 OK { badges: [] }
   */
  const getUserBadges = async (req, res, next) => {
    try {
      const { userId, includeProgress } = req.validated;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const badges = await service.getUserBadges(userId, includeProgress);
      return res.status(200).json({ badges });
    } catch (error) {
      return next(error);
    }
  };
  
  /**
   * POST /award
   * Manually award a badge to a user.
   * Body: { userId: string, badgeId: string }
   * Response: 201 Created { userBadge } | 409 if already earned
   */
  const awardBadge = async (req, res, next) => {
    try {
      const { userId, badgeId } = req.validated;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      if (!badgeId) {
        return res.status(400).json({ error: 'badgeId is required' });
      }
      
      const userBadge = await service.awardBadge(userId, badgeId);
      return res.status(201).json({ userBadge });
    } catch (error) {
      if (error.message === 'BADGE_ALREADY_EARNED') {
        return res.status(409).json({ 
          error: 'Badge already earned by user' 
        });
      }
      return next(error);
    }
  };
  
  /**
   * POST /users/:userId/check
   * Check user's sessions and automatically award any newly earned badges.
   * Response: 200 OK { newBadges: [] }
   */
  const checkUserBadges = async (req, res, next) => {
    try {
      const { userId } = req.validated;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const newBadges = await service.checkAndAwardBadges(userId);
      return res.status(200).json({ 
        newBadges,
        count: newBadges.length 
      });
    } catch (error) {
      return next(error);
    }
  };
  
  return {
    getAllBadges,
    getUserBadges,
    awardBadge,
    checkUserBadges
  };
};

// Default instance for production wiring
const defaultController = createBadgesController();

// Named exports for router
export const { getAllBadges, getUserBadges, awardBadge, checkUserBadges } = 
  defaultController;

// Default export for direct imports
export default defaultController;
