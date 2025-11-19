/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/feed.controller.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express controller for feed-related endpoints. Handles request validation,
 *  delegates business logic to feed service, and formats HTTP responses.
 *
 *  Endpoints (paired with router):
 *  • getFeed(req, res, next)  → GET  /  : get activity feed for user
 *
 *  Design Notes
 *  ------------
 *  • Minimal logic - delegates to service layer
 *  • Uses req.validated from middleware for input
 *  • Consistent error handling via Express next()
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import feedService from '../services/feed.service.js';

/**
 * Factory function for feed controller - allows injecting a mock service in tests.
 * @param {object} service - Feed service with getFeed, canViewActivity, etc.
 * @returns {object} Controller with request handler functions
 */
export const createFeedController = (service = feedService) => {
  
  /**
   * GET /
   * Get activity feed for a user.
   * Query params: userId, limit, before, type
   * Response: 200 OK { activities: [], pagination: {} }
   */
  const getFeed = async (req, res, next) => {
    try {
      const { userId, limit, before, type } = req.validated;
      
      if (!userId) {
        return res.status(400).json({ 
          error: 'userId is required' 
        });
      }
      
      const feedData = await service.getFeed(userId, {
        limit,
        before,
        type
      });
      
      return res.status(200).json(feedData);
      
    } catch (error) {
      console.error('Error in getFeed controller:', error);
      return next(error);
    }
  };
  
  /**
   * GET /check-access
   * Check if a user can view another user's activities.
   * Query params: viewerId, targetUserId
   * Response: 200 OK { canView: boolean }
   */
  const checkAccess = async (req, res, next) => {
    try {
      const { viewerId, targetUserId } = req.query;
      
      if (!viewerId || !targetUserId) {
        return res.status(400).json({ 
          error: 'viewerId and targetUserId are required' 
        });
      }
      
      const canView = await service.canViewActivity(viewerId, targetUserId);
      
      return res.status(200).json({ canView });
      
    } catch (error) {
      return next(error);
    }
  };
  
  return {
    getFeed,
    checkAccess
  };
};

// Default instance for production wiring
const defaultController = createFeedController();

// Named exports for router
export const { getFeed, checkAccess } = defaultController;

// Default export for direct imports
export default defaultController;
