/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/services/badges.service.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Business logic layer for badge system. Handles badge awarding, progress
 *  calculation, and field mapping between database (snake_case) and API (camelCase).
 *
 *  Core Functions
 *  --------------
 *  • getAllBadges()                  - Fetch all available badges
 *  • getUserBadges(userId, includeProgress) - Get user's earned badges + optional progress
 *  • awardBadge(userId, badgeId)     - Manually award a badge
 *  • checkAndAwardBadges(userId)     - Auto-check and award new badges
 *
 *  Design Notes
 *  ------------
 *  • Progress is calculated on-the-fly (not persisted in DB)
 *  • Maps DB snake_case to API camelCase
 *  • Prevents duplicate badge awards
 *  • Uses sessions table to calculate streaks and totals
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import badgesRepository from '../repositories/badges.repository.js';

/**
 * Factory function for creating a badges service instance.
 * Allows dependency injection of a custom repository for testing.
 *
 * @param {object} [repository=badgesRepository] - The repository to use.
 * @returns {object} service - Contains business logic functions for badges.
 */
export const createBadgesService = (repository = badgesRepository) => {
  
  // ============================================================================
  // Field Mapping Functions (DB snake_case <-> API camelCase)
  // ============================================================================
  
  /**
   * Map database badge record to API format.
   * @param {object} badge - Raw badge record from database
   * @returns {object} Badge in API format (camelCase)
   */
  const mapDbBadgeToApi = (badge) => {
    if (!badge) return null;
    
    return {
      badgeId: badge.badge_id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.icon_url,
      category: badge.category,
      criteriaType: badge.criteria_type,
      threshold: badge.threshold,
      createdAt: badge.created_at
    };
  };
  
  /**
   * Map database user_badge record to API format.
   * @param {object} userBadge - Raw user_badge record from database
   * @returns {object} UserBadge in API format (camelCase)
   */
  const mapDbUserBadgeToApi = (userBadge) => {
    if (!userBadge) return null;
    
    return {
      userId: userBadge.user_id,
      badgeId: userBadge.badge_id,
      earnedAt: userBadge.earned_at,
      badge: userBadge.badge ? mapDbBadgeToApi(userBadge.badge) : undefined
    };
  };
  
  // ============================================================================
  // Public Service Functions
  // ============================================================================
  
  /**
   * Retrieve all available badges.
   * @returns {Promise<Array>} Array of badges in API format
   */
  const getAllBadges = async () => {
    const badges = await repository.findAllBadges();
    return badges.map(mapDbBadgeToApi);
  };
  
  /**
   * Get all badges earned by a user, optionally with progress on unearned badges.
   * @param {string} userId - UUID of the user
   * @param {boolean} includeProgress - Whether to calculate progress on unearned badges
   * @returns {Promise<Array>} Array of user badges (earned + optional progress on unearned)
   */
  const getUserBadges = async (userId, includeProgress = false) => {
    const userBadges = await repository.findUserBadges(userId);
    const mappedBadges = userBadges.map(mapDbUserBadgeToApi);
    
    // If no progress calculation needed, return earned badges only
    if (!includeProgress) {
      return mappedBadges;
    }
    
    // Calculate progress on all badges (earned and unearned)
    const allBadges = await repository.findAllBadges();
    const sessions = await repository.getUserSessionStats(userId);
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    
    // Add unearned badges with progress
    const unearnedBadgesWithProgress = allBadges
      .filter(badge => !earnedBadgeIds.has(badge.badge_id))
      .map(badge => {
        const progress = calculateBadgeProgress(sessions, badge);
        return {
          userId,
          badgeId: badge.badge_id,
          earnedAt: null,
          progress,
          badge: mapDbBadgeToApi(badge)
        };
      });
    
    // Add progress: 100 to earned badges
    const earnedWithProgress = mappedBadges.map(ub => ({
      ...ub,
      progress: 100
    }));
    
    return [...earnedWithProgress, ...unearnedBadgesWithProgress];
  };
  
  /**
   * Manually award a badge to a user.
   * @param {string} userId - UUID of the user
   * @param {string} badgeId - UUID of the badge
   * @returns {Promise<object>} The awarded user badge
   * @throws {Error} If badge already earned or award fails
   */
  const awardBadge = async (userId, badgeId) => {
    // Check if already awarded
    const existing = await repository.findUserBadgeByIds(userId, badgeId);
    if (existing) {
      throw new Error('BADGE_ALREADY_EARNED');
    }
    
    // Award the badge
    const userBadge = {
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString()
    };
    
    const awarded = await repository.createUserBadge(userBadge);
    return mapDbUserBadgeToApi(awarded);
  };
  
  /**
   * Check user's sessions and automatically award any newly earned badges.
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} Array of newly awarded badges
   */
  const checkAndAwardBadges = async (userId) => {
    const sessions = await repository.getUserSessionStats(userId);
    const userBadges = await repository.findUserBadges(userId);
    const allBadges = await repository.findAllBadges();
    
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
    const newlyEarnedBadges = [];
    
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.badge_id)) continue;
      
      // Check if badge criteria is met
      const progress = calculateBadgeProgress(sessions, badge);
      
      if (progress >= 100) {
        try {
          const awarded = await awardBadge(userId, badge.badge_id);
          newlyEarnedBadges.push(awarded);
        } catch (error) {
          // Skip if already earned (race condition) or other error
          if (error.message !== 'BADGE_ALREADY_EARNED') {
            console.error(`Failed to award badge ${badge.badge_id}:`, error);
          }
        }
      }
    }
    
    return newlyEarnedBadges;
  };
  
  // ============================================================================
  // Internal Helper Functions (Progress Calculation)
  // ============================================================================
  
  /**
   * Calculate progress percentage for a badge based on user's sessions.
   * @param {Array} sessions - User's completed sessions
   * @param {object} badge - Badge with criteria_type and threshold
   * @returns {number} Progress percentage (0-100)
   */
  const calculateBadgeProgress = (sessions, badge) => {
    if (!badge.criteria_type || !badge.threshold) return 0;
    
    switch (badge.criteria_type) {
      case 'session_count': {
        const sessionCount = sessions.length;
        return Math.min(100, (sessionCount / badge.threshold) * 100);
      }
      
      case 'total_minutes': {
        const totalMinutes = sessions.reduce(
          (sum, session) => sum + (session.total_time || 0),
          0
        );
        return Math.min(100, (totalMinutes / badge.threshold) * 100);
      }
      
      case 'consecutive_days': {
        const streak = calculateStreak(sessions);
        return Math.min(100, (streak / badge.threshold) * 100);
      }
      
      default:
        return 0;
    }
  };
  
  /**
   * Calculate the current study streak based on consecutive days.
   * @param {Array} sessions - User's completed sessions (should have 'date' field)
   * @returns {number} Current streak in days
   */
  const calculateStreak = (sessions) => {
    if (!sessions.length) return 0;
    
    // Extract unique dates and sort descending (most recent first)
    const uniqueDates = [...new Set(sessions.map(s => s.date))]
      .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if most recent session is today or yesterday
    const mostRecent = new Date(uniqueDates[0]);
    mostRecent.setHours(0, 0, 0, 0);
    const daysSinceLastSession = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
    
    // Streak broken if last session was more than 1 day ago
    if (daysSinceLastSession > 1) return 0;
    
    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const current = new Date(uniqueDates[i]);
      const previous = new Date(uniqueDates[i - 1]);
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((previous - current) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  return {
    getAllBadges,
    getUserBadges,
    awardBadge,
    checkAndAwardBadges,
    // Expose for testing
    __private: {
      calculateBadgeProgress,
      calculateStreak,
      mapDbBadgeToApi,
      mapDbUserBadgeToApi
    }
  };
};

// Default export: production instance using the configured repository
const defaultService = createBadgesService();
export default defaultService;