/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/services/leaderboard.service.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT for documentation and business logic
 *  Last-Updated: 2025-11-14
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Business logic layer for leaderboard system. Orchestrates repository calls
 *  to build four leaderboards (friends/global × study time/badges) in a single
 *  response optimized for frontend caching.
 *
 *  Core Functions
 *  --------------
 *  • getLeaderboards(userId, limit) - Fetch all four leaderboards with rankings
 *  • mapDbLeaderboardToApi()         - Convert snake_case DB records to camelCase API
 *  • addRankings()                   - Add rank field and isSelf flag to entries
 *
 *  Design Notes
 *  ------------
 *  • Maps DB snake_case to API camelCase following badges.service.js pattern
 *  • Marks requesting user with isSelf=true and displayName="You"
 *  • Handles empty datasets gracefully (returns empty arrays)
 *  • All rankings are 1-based with sequential numbering (not dense ranking)
 *
 *  Response Structure
 *  ------------------
 *  {
 *    friends: { studyTime: [], badges: [] },
 *    global: { studyTime: [], badges: [] },
 *    metadata: { userId, limit, generatedAt }
 *  }
 *
 *  TODOs
 *  -----
 *  • Add time window filtering (this week, this month)
 *  • Implement caching strategy for global leaderboards
 *  • Add user activity status (last seen) to entries
 *
 *  @module services/leaderboard
 *  @see ../repositories/leaderboard.repository.js
 * ────────────────────────────────────────────────────────────────────────────────
 */

import leaderboardRepository from '../repositories/leaderboard.repository.js';

/**
 * Factory function for creating a leaderboard service instance.
 * Allows dependency injection of a custom repository for testing.
 *
 * @param {object} [repository=leaderboardRepository] - The repository to use.
 * @returns {object} service - Contains business logic functions for leaderboards.
 */
export const createLeaderboardService = (repository = leaderboardRepository) => {

  // ============================================================================
  // Field Mapping Functions (DB snake_case <-> API camelCase)
  // ============================================================================

  /**
   * Map database study time leaderboard entry to API format.
   * @param {object} entry - Raw entry from database (user_id, total_minutes, bio)
   * @param {string} requestingUserId - UUID of requesting user (for isSelf flag)
   * @returns {object} Entry in API format (camelCase)
   */
  const mapStudyTimeEntryToApi = (entry, requestingUserId) => {
    if (!entry) return null;

    const isSelf = entry.user_id === requestingUserId;

    return {
      userId: entry.user_id,
      displayName: isSelf ? 'You' : (entry.bio || null),
      totalMinutes: entry.total_minutes,
      isSelf
    };
  };

  /**
   * Map database badge count leaderboard entry to API format.
   * @param {object} entry - Raw entry from database (user_id, badge_count, bio)
   * @param {string} requestingUserId - UUID of requesting user (for isSelf flag)
   * @returns {object} Entry in API format (camelCase)
   */
  const mapBadgeCountEntryToApi = (entry, requestingUserId) => {
    if (!entry) return null;

    const isSelf = entry.user_id === requestingUserId;

    return {
      userId: entry.user_id,
      displayName: isSelf ? 'You' : (entry.bio || null),
      badgeCount: entry.badge_count,
      isSelf
    };
  };

  /**
   * Add rank field to leaderboard entries (1-based sequential).
   * @param {Array} entries - Array of leaderboard entries
   * @returns {Array} Entries with rank field added
   */
  const addRankings = (entries) => {
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  };

  // ============================================================================
  // Public Service Functions
  // ============================================================================

  /**
   * Fetch all four leaderboards in a single call.
   * Returns friends and global rankings for both study time and badge count.
   *
   * @param {string} userId - UUID of the requesting user
   * @param {number} [limit=7] - Maximum entries per leaderboard
   * @returns {Promise<object>} Complete leaderboard response
   * @throws {Error} If any repository call fails
   */
  const getLeaderboards = async (userId, limit = 7) => {
    try {
      // Step 1: Fetch accepted friends for the user
      const friendIds = await repository.findAcceptedFriendsForUser(userId);

      // Step 2: Build user filter for friends leaderboards (include requesting user)
      const friendsWithSelf = [...friendIds, userId];

      // Step 3: Fetch all four leaderboards in parallel
      const [
        friendsStudyTimeRaw,
        friendsBadgesRaw,
        globalStudyTimeRaw,
        globalBadgesRaw
      ] = await Promise.all([
        repository.findStudyTimeLeaderboard({
          userIds: friendsWithSelf.length > 1 ? friendsWithSelf : [userId],
          limit
        }),
        repository.findBadgeCountLeaderboard({
          userIds: friendsWithSelf.length > 1 ? friendsWithSelf : [userId],
          limit
        }),
        repository.findStudyTimeLeaderboard({
          userIds: null, // No filter = global
          limit
        }),
        repository.findBadgeCountLeaderboard({
          userIds: null, // No filter = global
          limit
        })
      ]);

      // Step 4: Map to API format with rankings
      const friendsStudyTime = addRankings(
        friendsStudyTimeRaw.map(entry => mapStudyTimeEntryToApi(entry, userId))
      );

      const friendsBadges = addRankings(
        friendsBadgesRaw.map(entry => mapBadgeCountEntryToApi(entry, userId))
      );

      const globalStudyTime = addRankings(
        globalStudyTimeRaw.map(entry => mapStudyTimeEntryToApi(entry, userId))
      );

      const globalBadges = addRankings(
        globalBadgesRaw.map(entry => mapBadgeCountEntryToApi(entry, userId))
      );

      // Step 5: Build response structure
      return {
        friends: {
          studyTime: friendsStudyTime,
          badges: friendsBadges
        },
        global: {
          studyTime: globalStudyTime,
          badges: globalBadges
        },
        metadata: {
          userId,
          limit,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      throw new Error(`Failed to fetch leaderboards: ${error.message}`);
    }
  };

  return {
    getLeaderboards
  };
};

// Default export: production instance using configured repository
export default createLeaderboardService(leaderboardRepository);

