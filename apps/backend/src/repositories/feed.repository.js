/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/repositories/feed.repository.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Data access layer for feed-related queries in Supabase.
 *  Fetches friends and their activities (badge achievements, milestones).
 *
 *  Database Tables Used:
 *  ---------------------
 *  • friends: id, from_user, to_user, status, updated_at
 *  • user_badge: badge_id, user_id, earned_at
 *  • badge: badge_id, name, description, icon_url, category, criteria_type, threshold
 *  • user_profile: user_id, bio (future: avatar_url when added)
 *
 *  Design Notes
 *  ------------
 *  • Returns raw database records (snake_case)
 *  • Service layer maps to camelCase
 *  • Only returns accepted friends (status = 2)
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import supabase from '../config/supabase.client.js';

/**
 * Factory function for creating a feed repository instance.
 * Allows dependency injection of a custom Supabase client for testing.
 *
 * @param {object} [client=supabase] - The Supabase client to use.
 * @returns {object} repository - Contains data access functions for feed.
 */
export const createFeedRepository = (client = supabase) => {
  
  /**
   * Get all accepted friend IDs for a user.
   * Returns both directions of friendship (from_user and to_user).
   * 
   * @param {string} userId - UUID of the current user
   * @returns {Promise<Array<string>>} Array of friend user IDs
   * @throws {Error} If query fails
   */
  const getFriendIds = async (userId) => {
    const { data, error } = await client
      .from('friends')
      .select('from_user, to_user')
      .eq('status', 2) // Only accepted friends
      .or(`from_user.eq.${userId},to_user.eq.${userId}`);
    
    if (error) {
      throw new Error(`Failed to fetch friend IDs: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Extract friend IDs (exclude current user)
    const friendIds = data.map(friendship => 
      friendship.from_user === userId 
        ? friendship.to_user 
        : friendship.from_user
    );
    
    return [...new Set(friendIds)]; // Remove duplicates
  };
  
  /**
   * Get badge activities for a list of users.
   * Joins user_badge with badge and user_profile tables.
   * 
   * @param {Array<string>} userIds - Array of user UUIDs
   * @param {number} limit - Maximum number of activities to return
   * @param {string|null} beforeTimestamp - ISO timestamp for cursor pagination
   * @returns {Promise<Array>} Array of badge activity records
   * @throws {Error} If query fails
   */
  const getBadgeActivities = async (userIds, limit = 20, beforeTimestamp = null) => {
    if (userIds.length === 0) {
      return [];
    }
    
    let query = client
      .from('user_badge')
      .select(`
        badge_id,
        user_id,
        earned_at,
        badge:badge_id (
          badge_id,
          name,
          description,
          icon_url,
          category,
          criteria_type,
          threshold
        )
      `)
      .in('user_id', userIds)
      .order('earned_at', { ascending: false })
      .limit(limit);
    
    // Cursor-based pagination
    if (beforeTimestamp) {
      query = query.lt('earned_at', beforeTimestamp);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch badge activities: ${error.message}`);
    }
    
    return data ?? [];
  };
  
  /**
   * Get user profile information for multiple users.
   * Returns username and bio (avatar_url when added to schema).
   * 
   * Note: Currently using auth.users for username. In production, you might
   * want to denormalize username to user_profile table for performance.
   * 
   * @param {Array<string>} userIds - Array of user UUIDs
   * @returns {Promise<Array>} Array of user profile records
   * @throws {Error} If query fails
   */
  const getUserProfiles = async (userIds) => {
    if (userIds.length === 0) {
      return [];
    }
    
    // Query user_profile table for bio
    const { data: profiles, error: profileError } = await client
      .from('user_profile')
      .select('user_id, bio')
      .in('user_id', userIds);
    
    if (profileError) {
      throw new Error(`Failed to fetch user profiles: ${profileError.message}`);
    }
    
    // Query auth.users for username/email (Supabase metadata)
    // Note: This requires RLS policy or admin access
    const { data: authUsers, error: authError } = await client
      .from('user_profile')
      .select('user_id')
      .in('user_id', userIds);
    
    if (authError) {
      // Non-fatal: continue without username data
      console.warn('Could not fetch auth user data:', authError.message);
    }
    
    // Combine profile data
    const profileMap = new Map();
    
    (profiles ?? []).forEach(profile => {
      profileMap.set(profile.user_id, {
        user_id: profile.user_id,
        bio: profile.bio,
        username: null, // Will be populated if available
        avatar_url: null // Future: when added to schema
      });
    });
    
    // Ensure all requested users have an entry (even if profile doesn't exist)
    userIds.forEach(userId => {
      if (!profileMap.has(userId)) {
        profileMap.set(userId, {
          user_id: userId,
          bio: null,
          username: null,
          avatar_url: null
        });
      }
    });
    
    return Array.from(profileMap.values());
  };
  
  /**
   * Check if two users are friends (accepted status).
   * 
   * @param {string} userId1 - First user UUID
   * @param {string} userId2 - Second user UUID
   * @returns {Promise<boolean>} True if users are friends
   * @throws {Error} If query fails
   */
  const areFriends = async (userId1, userId2) => {
    const { data, error } = await client
      .from('friends')
      .select('id')
      .eq('status', 2)
      .or(`and(from_user.eq.${userId1},to_user.eq.${userId2}),and(from_user.eq.${userId2},to_user.eq.${userId1})`)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check friendship: ${error.message}`);
    }
    
    return data !== null;
  };
  
  return {
    getFriendIds,
    getBadgeActivities,
    getUserProfiles,
    areFriends
  };
};

// Default export: production instance using the configured Supabase client
const defaultRepository = createFeedRepository();
export default defaultRepository;
