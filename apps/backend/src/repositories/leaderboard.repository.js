/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/repositories/leaderboard.repository.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT for documentation and query optimization
 *  Last-Updated: 2025-11-14
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Data access layer for leaderboard queries. Provides functions to:
 *  • Fetch accepted friends for a user (status = 2)
 *  • Aggregate study time rankings (sum of session total_time)
 *  • Aggregate badge count rankings (count of user_badge rows)
 *  • Join with user_profile for display names
 *
 *  Database Schema Used:
 *  ---------------------
 *  friends: id, from_user, to_user, status, updated_at
 *  sessions: id, user_id, start_time, end_time, total_time, date, subject, etc.
 *  user_badge: badge_id, user_id, earned_at
 *  user_profile: user_id, bio
 *
 *  Design Notes
 *  ------------
 *  • Returns raw database records (snake_case)
 *  • Service layer handles mapping to camelCase
 *  • Uses Supabase query builder with .rpc() fallback for complex aggregations
 *  • All leaderboard queries filter completed sessions (end_time IS NOT NULL)
 *  • Friends are bidirectional: status=2 matches both directions
 *
 *  Performance Considerations
 *  --------------------------
 *  • Recommend indexes: sessions(user_id, end_time), user_badge(user_id),
 *    friends(from_user, to_user, status)
 *  • Consider materialized views for large datasets in production
 *
 *  TODOs
 *  -----
 *  • Add time window filtering (e.g., last 7 days) for sessions
 *  • Implement query result caching for global leaderboards
 *  • Add detailed query logging for performance monitoring
 *
 *  @module repositories/leaderboard
 * ────────────────────────────────────────────────────────────────────────────────
 */

import supabase from '../config/supabase.client.js';

/**
 * Factory function for creating a leaderboard repository instance.
 * Allows dependency injection of a custom Supabase client for testing.
 *
 * @param {object} [client=supabase] - The Supabase client to use.
 * @returns {object} repository - Contains data access functions for leaderboards.
 */
export const createLeaderboardRepository = (client = supabase) => {
  const resolveQueryResult = async (maybePromise) => {
    // Real Supabase returns a Promise; mocks may return a plain { data, error } object
    if (maybePromise && typeof maybePromise.then === 'function') {
      return maybePromise;
    }
    return maybePromise ?? { data: null, error: null };
  };

  /**
   * Find all accepted friends for a given user.
   * Friends are defined as users with status=2 in either direction
   * (from_user → to_user OR to_user → from_user).
   *
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array<string>>} Array of friend user IDs (UUIDs)
   * @throws {Error} If query fails
   */
  const findAcceptedFriendsForUser = async (userId) => {
    const { data, error } = await client
      .from('friends')
      .select('from_user, to_user')
      .eq('status', 2)
      .or(`from_user.eq.${userId},to_user.eq.${userId}`);

    if (error) {
      throw new Error(`Failed to fetch friends: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract friend IDs (the other user in each relationship)
    const friendIds = data.map((row) =>
      row.from_user === userId ? row.to_user : row.from_user
    );

    // Return unique friend IDs
    return [...new Set(friendIds)];
  };

  /**
   * Get study time leaderboard (sum of total_time from completed sessions).
   * Joins with user_profile for display names.
   *
   * @param {object} options - Query options
   * @param {Array<string>} [options.userIds] - Optional array of user IDs to filter
   * @param {number} [options.limit=7] - Maximum number of results (used as a guideline)
   * @param {string} [options.ensureUserId] - User ID that must be included if they have data
   * @returns {Promise<Array>} Array of leaderboard entries with user_id, total_minutes, bio
   * @throws {Error} If query fails
   */
  const findStudyTimeLeaderboard = async ({ userIds: filterUserIds = null, limit = 7, ensureUserId = null }) => {
    try {
      // Fetch sessions (completed only) WITHOUT attempting to join user_profile
      let studyTimeQuery = client
        .from('sessions')
        .select('user_id, total_time')
        .not('end_time', 'is', null); // Only completed sessions

      // Apply user filter if provided
      if (filterUserIds && Array.isArray(filterUserIds) && filterUserIds.length > 0) {
        studyTimeQuery = studyTimeQuery.in('user_id', filterUserIds);
      }

      const { data: sessionRows, error: sessionError } = await resolveQueryResult(studyTimeQuery);

      if (sessionError) {
        throw new Error(`Failed to fetch study time data: ${sessionError.message}`);
      }

      if (!sessionRows || sessionRows.length === 0) {
        return [];
      }

      // Aggregate total_time per user
      const totalMinutesByUserId = {};
      for (const sessionRow of sessionRows) {
        const sessionUserId = sessionRow.user_id;
        const sessionTotalTime = Number(sessionRow.total_time) || 0;
        if (!totalMinutesByUserId[sessionUserId]) {
          totalMinutesByUserId[sessionUserId] = 0;
        }
        totalMinutesByUserId[sessionUserId] += sessionTotalTime;
      }

      const userIds = Object.keys(totalMinutesByUserId);

      // Fetch profiles separately and join in JS
      let profilesByUserId = {};
      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await client
          .from('user_profile')
          .select('user_id, bio')
          .in('user_id', userIds);

        if (profileError) {
          // Do not hard-fail the whole leaderboard if profile join fails; just log and continue
          console.error('[Leaderboard Repository] Failed to fetch user_profile for studyTime leaderboard:', profileError.message);
        } else if (profileRows && profileRows.length > 0) {
          profilesByUserId = profileRows.reduce((acc, row) => {
            acc[row.user_id] = row.bio || null;
            return acc;
          }, {});
        }
      }

      const sortedEntries = Object.entries(totalMinutesByUserId)
        .map(([userId, totalMinutes]) => ({
          user_id: userId,
          total_minutes: totalMinutes,
          bio: Object.prototype.hasOwnProperty.call(profilesByUserId, userId)
            ? profilesByUserId[userId]
            : null,
        }))
        .sort((firstUser, secondUser) => secondUser.total_minutes - firstUser.total_minutes);

      // Ensure the specified user is included if they have data, even if outside top N
      if (ensureUserId && totalMinutesByUserId[ensureUserId]) {
        const topEntries = sortedEntries.slice(0, limit);
        const userInTop = topEntries.some((entry) => entry.user_id === ensureUserId);

        if (!userInTop) {
          // User has data but is outside top N - include them
          const userEntry = sortedEntries.find((entry) => entry.user_id === ensureUserId);
          return [...topEntries, userEntry];
        }

        return topEntries;
      }

      // No ensureUserId specified, just return top N
      return sortedEntries.slice(0, limit);
    } catch (err) {
      throw new Error(`Study time leaderboard query failed: ${err.message}`);
    }
  };

  /**
   * Get badge count leaderboard (count of user_badge rows per user).
   * Joins with user_profile for display names.
   *
   * @param {object} options - Query options
   * @param {Array<string>} [options.userIds] - Optional array of user IDs to filter
   * @param {number} [options.limit=7] - Maximum number of results (used as a guideline)
   * @param {string} [options.ensureUserId] - User ID that must be included if they have data
   * @returns {Promise<Array>} Array of leaderboard entries with user_id, badge_count, bio
   * @throws {Error} If query fails
   */
  const findBadgeCountLeaderboard = async ({ userIds: filterUserIds = null, limit = 7, ensureUserId = null }) => {
    try {
      // Fetch user_badge WITHOUT attempting to join user_profile
      let badgeCountQuery = client
        .from('user_badge')
        .select('user_id');

      // Apply user filter if provided
      if (filterUserIds && Array.isArray(filterUserIds) && filterUserIds.length > 0) {
        badgeCountQuery = badgeCountQuery.in('user_id', filterUserIds);
      }

      const { data: badgeRows, error: badgeError } = await resolveQueryResult(badgeCountQuery);

      if (badgeError) {
        throw new Error(`Failed to fetch badge data: ${badgeError.message}`);
      }

      if (!badgeRows || badgeRows.length === 0) {
        return [];
      }

      // Count badges per user in JavaScript
      const badgeCountByUserId = {};
      for (const badgeRow of badgeRows) {
        const badgeUserId = badgeRow.user_id;
        if (!badgeCountByUserId[badgeUserId]) {
          badgeCountByUserId[badgeUserId] = 0;
        }
        badgeCountByUserId[badgeUserId] += 1;
      }

      const userIds = Object.keys(badgeCountByUserId);

      // Fetch profiles separately and join in JS
      let profilesByUserId = {};
      if (userIds.length > 0) {
        const { data: profileRows, error: profileError } = await client
          .from('user_profile')
          .select('user_id, bio')
          .in('user_id', userIds);

        if (profileError) {
          console.error('[Leaderboard Repository] Failed to fetch user_profile for badge leaderboard:', profileError.message);
        } else if (profileRows && profileRows.length > 0) {
          profilesByUserId = profileRows.reduce((acc, row) => {
            acc[row.user_id] = row.bio || null;
            return acc;
          }, {});
        }
      }

      const sortedEntries = Object.entries(badgeCountByUserId)
        .map(([userId, badgeCount]) => ({
          user_id: userId,
          badge_count: badgeCount,
          bio: Object.prototype.hasOwnProperty.call(profilesByUserId, userId)
            ? profilesByUserId[userId]
            : null,
        }))
        .sort((firstUser, secondUser) => secondUser.badge_count - firstUser.badge_count);

      // Ensure the specified user is included if they have data, even if outside top N
      if (ensureUserId && badgeCountByUserId[ensureUserId]) {
        const topEntries = sortedEntries.slice(0, limit);
        const userInTop = topEntries.some((entry) => entry.user_id === ensureUserId);

        if (!userInTop) {
          // User has data but is outside top N - include them
          const userEntry = sortedEntries.find((entry) => entry.user_id === ensureUserId);
          return [...topEntries, userEntry];
        }

        return topEntries;
      }

      // No ensureUserId specified, just return top N
      return sortedEntries.slice(0, limit);
    } catch (err) {
      throw new Error(`Badge count leaderboard query failed: ${err.message}`);
    }
  };

  return {
    findAcceptedFriendsForUser,
    findStudyTimeLeaderboard,
    findBadgeCountLeaderboard,
  };
};

// Default export: production instance using configured Supabase client
export default createLeaderboardRepository(supabase);
