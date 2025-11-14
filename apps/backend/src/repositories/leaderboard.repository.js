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
    const friendIds = data.map(row =>
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
   * @param {number} [options.limit=7] - Maximum number of results
   * @returns {Promise<Array>} Array of leaderboard entries with user_id, total_minutes, bio
   * @throws {Error} If query fails
   */
  const findStudyTimeLeaderboard = async ({ userIds = null, limit = 7 }) => {
    try {
      // Build query to aggregate study time per user
      let query = client
        .from('sessions')
        .select('user_id, total_time, user_profile!inner(bio)')
        .not('end_time', 'is', null); // Only completed sessions

      // Apply user filter if provided
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        query = query.in('user_id', userIds);
      }

      const { data: sessions, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch study time data: ${error.message}`);
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      // Aggregate total_time per user in JavaScript
      const userTotals = {};
      const userBios = {};

      for (const session of sessions) {
        const userId = session.user_id;
        const totalTime = Number(session.total_time) || 0;

        if (!userTotals[userId]) {
          userTotals[userId] = 0;
          userBios[userId] = session.user_profile?.bio || null;
        }

        userTotals[userId] += totalTime;
      }

      // Convert to array and sort descending by total minutes
      const results = Object.entries(userTotals)
        .map(([userId, totalMinutes]) => ({
          user_id: userId,
          total_minutes: totalMinutes,
          bio: userBios[userId]
        }))
        .sort((a, b) => b.total_minutes - a.total_minutes)
        .slice(0, limit);

      return results;
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
   * @param {number} [options.limit=7] - Maximum number of results
   * @returns {Promise<Array>} Array of leaderboard entries with user_id, badge_count, bio
   * @throws {Error} If query fails
   */
  const findBadgeCountLeaderboard = async ({ userIds = null, limit = 7 }) => {
    try {
      // Build query to count badges per user
      let query = client
        .from('user_badge')
        .select('user_id, user_profile!inner(bio)');

      // Apply user filter if provided
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        query = query.in('user_id', userIds);
      }

      const { data: userBadges, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch badge data: ${error.message}`);
      }

      if (!userBadges || userBadges.length === 0) {
        return [];
      }

      // Count badges per user in JavaScript
      const userCounts = {};
      const userBios = {};

      for (const badge of userBadges) {
        const userId = badge.user_id;

        if (!userCounts[userId]) {
          userCounts[userId] = 0;
          userBios[userId] = badge.user_profile?.bio || null;
        }

        userCounts[userId] += 1;
      }

      // Convert to array and sort descending by badge count
      const results = Object.entries(userCounts)
        .map(([userId, badgeCount]) => ({
          user_id: userId,
          badge_count: badgeCount,
          bio: userBios[userId]
        }))
        .sort((a, b) => b.badge_count - a.badge_count)
        .slice(0, limit);

      return results;
    } catch (err) {
      throw new Error(`Badge count leaderboard query failed: ${err.message}`);
    }
  };

  return {
    findAcceptedFriendsForUser,
    findStudyTimeLeaderboard,
    findBadgeCountLeaderboard
  };
};

// Default export: production instance using configured Supabase client
export default createLeaderboardRepository(supabase);

