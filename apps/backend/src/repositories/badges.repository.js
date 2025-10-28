/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/repositories/badges.repository.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Data access layer for badges and user_badges tables in Supabase.
 *  All queries use the actual database schema (snake_case column names).
 *
 *  Database Schema:
 *  ----------------
 *  badge: badge_id, name, description, icon_url, category, criteria_type, 
 *         threshold, created_at
 *  user_badge: badge_id, user_id, earned_at (composite key on badge_id + user_id)
 *  sessions: id, user_id, start_time, end_time, date, subject, session_type,
 *            total_time, session_goal, inserted_at, updated_at
 *
 *  Design Notes
 *  ------------
 *  • Returns raw database records (snake_case)
 *  • Service layer handles mapping to camelCase
 *  • No progress column in user_badge (progress calculated on-the-fly)
 *
 *  TODOs
 *  -----
 *  • Add database indexes on frequently queried columns
 *  • Consider adding query result caching for getAllBadges
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import supabase from '../config/supabase.js';

/**
 * Factory function for creating a badges repository instance.
 * Allows dependency injection of a custom Supabase client for testing.
 *
 * @param {object} [client=supabase] - The Supabase client to use.
 * @returns {object} repository - Contains data access functions for badges.
 */
export const createBadgesRepository = (client = supabase) => {
  
  /**
   * Retrieve all badges from the database.
   * @returns {Promise<Array>} Array of badge records
   * @throws {Error} If query fails
   */
  const findAllBadges = async () => {
    const { data, error } = await client
      .from('badge')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error(`Failed to fetch all badges: ${error.message}`);
    }
    
    return data ?? [];
  };
  
  /**
   * Find a single badge by its ID.
   * @param {string} badgeId - UUID of the badge
   * @returns {Promise<object|null>} Badge record or null if not found
   * @throws {Error} If query fails
   */
  const findBadgeById = async (badgeId) => {
    const { data, error } = await client
      .from('badge')
      .select('*')
      .eq('badge_id', badgeId)
      .maybeSingle();
    
    if (error) {
      throw new Error(`Failed to fetch badge by ID: ${error.message}`);
    }
    
    return data;
  };
  
  /**
   * Find all badges earned by a specific user.
   * Joins with badge table to include full badge details.
   * 
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} Array of user_badge records with badge details
   * @throws {Error} If query fails
   */
  const findUserBadges = async (userId) => {
    const { data, error } = await client
      .from('user_badge')
      .select(`
        user_id,
        badge_id,
        earned_at,
        badge:badge_id (
          badge_id,
          name,
          description,
          icon_url,
          category,
          criteria_type,
          threshold,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch user badges: ${error.message}`);
    }
    
    return data ?? [];
  };
  
  /**
   * Check if a user has already earned a specific badge.
   * @param {string} userId - UUID of the user
   * @param {string} badgeId - UUID of the badge
   * @returns {Promise<object|null>} user_badge record or null if not found
   * @throws {Error} If query fails
   */
  const findUserBadgeByIds = async (userId, badgeId) => {
    const { data, error } = await client
      .from('user_badge')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .maybeSingle();
    
    // PGRST116 is "not found" - not an error, just no match
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check user badge: ${error.message}`);
    }
    
    return data;
  };
  
  /**
   * Award a badge to a user (insert into user_badge table).
   * @param {object} userBadge - Object with user_id, badge_id, earned_at
   * @returns {Promise<object>} Created user_badge record
   * @throws {Error} If insertion fails
   */
  const createUserBadge = async (userBadge) => {
    const { data, error } = await client
      .from('user_badge')
      .insert(userBadge)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to award badge: ${error.message}`);
    }
    
    return data;
  };
  
  /**
   * Get all completed sessions for a user to calculate badge progress.
   * @param {string} userId - UUID of the user
   * @param {string|null} [fromDate=null] - Optional start date filter (ISO string)
   * @returns {Promise<Array>} Array of session records
   * @throws {Error} If query fails
   */
  const getUserSessionStats = async (userId, fromDate = null) => {
    let query = client
      .from('sessions')
      .select('date, total_time, end_time')
      .eq('user_id', userId)
      .not('end_time', 'is', null); // Only completed sessions
    
    if (fromDate) {
      query = query.gte('date', fromDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch user session stats: ${error.message}`);
    }
    
    return data ?? [];
  };
  
  return {
    findAllBadges,
    findBadgeById,
    findUserBadges,
    findUserBadgeByIds,
    createUserBadge,
    getUserSessionStats
  };
};

// Default export: production instance using the configured Supabase client
const defaultRepository = createBadgesRepository();
export default defaultRepository;
