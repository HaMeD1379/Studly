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
   * @param {object} dbStudyTimeEntry - Raw entry from database (user_id, total_minutes, full_name)
   * @param {string} requestingUserId - UUID of requesting user (for isSelf flag)
   * @returns {object} Entry in API format (camelCase)
   */
  const mapStudyTimeEntryToApi = (
    /** @type {object} */ dbStudyTimeEntry,
    /** @type {string} */ requestingUserId
  ) => {
    if (!dbStudyTimeEntry) return null;

    const isSelf = dbStudyTimeEntry.user_id === requestingUserId;

    return {
      userId: dbStudyTimeEntry.user_id,
      displayName: isSelf ? 'You' : (dbStudyTimeEntry.full_name || null),
      totalMinutes: dbStudyTimeEntry.total_minutes,
      isSelf
    };
  };

  /**
   * Map database badge count leaderboard entry to API format.
   * @param {object} dbBadgeCountEntry - Raw entry from database (user_id, badge_count, full_name)
   * @param {string} requestingUserId - UUID of requesting user (for isSelf flag)
   * @returns {object} Entry in API format (camelCase)
   */
  const mapBadgeCountEntryToApi = (
    /** @type {object} */ dbBadgeCountEntry,
    /** @type {string} */ requestingUserId
  ) => {
    if (!dbBadgeCountEntry) return null;

    const isSelf = dbBadgeCountEntry.user_id === requestingUserId;

    return {
      userId: dbBadgeCountEntry.user_id,
      displayName: isSelf ? 'You' : (dbBadgeCountEntry.full_name || null),
      badgeCount: dbBadgeCountEntry.badge_count,
      isSelf
    };
  };

  /**
   * Add rank field to leaderboard entries (1-based sequential).
   * @param {Array} leaderboardEntries - Array of leaderboard entries
   * @returns {Array} Entries with rank field added
   */
  const addRankings = (
    /** @type {Array} */ leaderboardEntries
  ) => {
    return leaderboardEntries.map((leaderboardEntry, index) => ({
      ...leaderboardEntry,
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
   * @param {string} requestingUserId - UUID of the requesting user
   * @param {number} [limit=7] - Maximum entries per leaderboard
   * @returns {Promise<object>} Complete leaderboard response
   * @throws {Error} If any repository call fails
   */
  const getLeaderboards = async (
    /** @type {string} */ requestingUserId,
    /** @type {number} */ limit = 7
  ) => {
    try {
      const acceptedFriendIds = await repository.findAcceptedFriendsForUser(requestingUserId);
      const friendUserIdsWithSelf = [...acceptedFriendIds, requestingUserId];

      const [
        friendsStudyTimeDbEntries,
        friendsBadgeCountDbEntries,
        globalStudyTimeDbEntries,
        globalBadgeCountDbEntries
      ] = await Promise.all([
        repository.findStudyTimeLeaderboard({
          userIds: friendUserIdsWithSelf.length > 1 ? friendUserIdsWithSelf : [requestingUserId],
          limit
        }),
        repository.findBadgeCountLeaderboard({
          userIds: friendUserIdsWithSelf.length > 1 ? friendUserIdsWithSelf : [requestingUserId],
          limit
        }),
        repository.findStudyTimeLeaderboard({
          userIds: null,
          limit,
          ensureUserId: requestingUserId
        }),
        repository.findBadgeCountLeaderboard({
          userIds: null,
          limit,
          ensureUserId: requestingUserId
        })
      ]);

      const friendsStudyTimeLeaderboard = addRankings(
        friendsStudyTimeDbEntries.map(dbEntry => mapStudyTimeEntryToApi(dbEntry, requestingUserId))
      );

      const friendsBadgesLeaderboard = addRankings(
        friendsBadgeCountDbEntries.map(dbEntry => mapBadgeCountEntryToApi(dbEntry, requestingUserId))
      );

      const globalStudyTimeLeaderboard = addRankings(
        globalStudyTimeDbEntries.map(dbEntry => mapStudyTimeEntryToApi(dbEntry, requestingUserId))
      );

      const globalBadgesLeaderboard = addRankings(
        globalBadgeCountDbEntries.map(dbEntry => mapBadgeCountEntryToApi(dbEntry, requestingUserId))
      );

      return {
        friends: {
          studyTime: friendsStudyTimeLeaderboard,
          badges: friendsBadgesLeaderboard
        },
        global: {
          studyTime: globalStudyTimeLeaderboard,
          badges: globalBadgesLeaderboard
        },
        metadata: {
          userId: requestingUserId,
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

