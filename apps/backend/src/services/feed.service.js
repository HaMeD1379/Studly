/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/services/feed.service.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Business logic layer for feed operations. Orchestrates fetching friends'
 *  activities, merging different activity types, and formatting for API response.
 *
 *  Responsibilities
 *  ----------------
 *  • Fetch user's friends from repository
 *  • Retrieve badge activities for friends
 *  • Map snake_case DB records to camelCase API format
 *  • Merge and sort activities by timestamp
 *  • Handle pagination logic
 *  • (Future) Calculate study/streak milestones
 *
 *  Design Notes
 *  ------------
 *  • Returns consistent activity format regardless of type
 *  • Handles empty friend lists gracefully
 *  • Cursor-based pagination using timestamp
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import feedRepository from '../repositories/feed.repository.js';

/**
 * Factory function for feed service - allows injecting mock repository in tests.
 * @param {object} repository - Feed repository with getFriendIds, getBadgeActivities, etc.
 * @returns {object} Service with business logic functions
 */
export const createFeedService = (repository = feedRepository) => {
  
  /**
   * Map database user record (snake_case) to API format (camelCase).
   * 
   * @param {object} dbUser - User record from database
   * @returns {object} User object in camelCase
   */
  const mapUserToApi = (dbUser) => ({
    userId: dbUser.user_id,
    username: dbUser.username || `user_${dbUser.user_id.slice(0, 8)}`, // Fallback if no username
    avatarUrl: dbUser.avatar_url || null,
    bio: dbUser.bio || null
  });
  
  /**
   * Map database badge record (snake_case) to API format (camelCase).
   * 
   * @param {object} dbBadge - Badge record from database
   * @returns {object} Badge object in camelCase
   */
  const mapBadgeToApi = (dbBadge) => ({
    badgeId: dbBadge.badge_id,
    name: dbBadge.name,
    description: dbBadge.description,
    iconUrl: dbBadge.icon_url,
    category: dbBadge.category,
    criteriaType: dbBadge.criteria_type,
    threshold: dbBadge.threshold
  });
  
  /**
   * Convert a user_badge record into a badge_earned activity.
   * 
   * @param {object} userBadge - User badge record with nested badge and user info
   * @param {Map<string, object>} userProfilesMap - Map of userId to user profile
   * @returns {object} Badge earned activity for API
   */
  const mapBadgeActivityToApi = (userBadge, userProfilesMap) => {
    const userProfile = userProfilesMap.get(userBadge.user_id);
    
    return {
      id: `badge_${userBadge.badge_id}_${userBadge.user_id}`, // Composite ID
      type: 'badge_earned',
      timestamp: userBadge.earned_at,
      user: mapUserToApi(userProfile || { user_id: userBadge.user_id }),
      badge: mapBadgeToApi(userBadge.badge)
    };
  };
  
  /**
   * Get activity feed for a user.
   * Fetches friends' badge achievements and formats them as activities.
   * 
   * @param {string} userId - Current user's UUID
   * @param {object} options - Pagination and filter options
   * @param {number} options.limit - Max activities to return (default: 20)
   * @param {string} options.before - Timestamp cursor for pagination
   * @param {string} options.type - Filter by activity type (optional)
   * @returns {Promise<object>} Feed response with activities and pagination
   * @throws {Error} If fetching fails
   */
  const getFeed = async (userId, options = {}) => {
    const { 
      limit = 20, 
      before = null, 
      type = null 
    } = options;
    
    try {
      // 1. Get user's friend IDs
      const friendIds = await repository.getFriendIds(userId);
      
      // If no friends, return empty feed
      if (friendIds.length === 0) {
        return {
          activities: [],
          pagination: {
            hasMore: false,
            nextCursor: null,
            count: 0
          }
        };
      }
      
      // 2. Fetch activities based on type filter
      let allActivities = [];
      
      // Badge activities (default or if filtered)
      if (!type || type === 'badge_earned') {
        const badgeActivities = await repository.getBadgeActivities(
          friendIds, 
          limit + 1, // Fetch one extra to check if more exist
          before
        );
        
        // 3. Get user profiles for all users in activities
        const userIds = [...new Set(badgeActivities.map(ba => ba.user_id))];
        const userProfiles = await repository.getUserProfiles(userIds);
        const userProfilesMap = new Map(
          userProfiles.map(up => [up.user_id, up])
        );
        
        // 4. Map badge activities to API format
        const mappedBadgeActivities = badgeActivities.map(ba => 
          mapBadgeActivityToApi(ba, userProfilesMap)
        );
        
        allActivities.push(...mappedBadgeActivities);
      }
      
      // TODO: Add study_milestone and streak_milestone activities here
      // if (!type || type === 'study_milestone') {
      //   const milestoneActivities = await calculateStudyMilestones(friendIds, before);
      //   allActivities.push(...milestoneActivities);
      // }
      
      // 5. Sort all activities by timestamp (most recent first)
      allActivities.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      // 6. Handle pagination
      const hasMore = allActivities.length > limit;
      const activities = hasMore ? allActivities.slice(0, limit) : allActivities;
      const nextCursor = hasMore && activities.length > 0
        ? activities[activities.length - 1].timestamp
        : null;
      
      return {
        activities,
        pagination: {
          hasMore,
          nextCursor,
          count: activities.length
        }
      };
      
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw new Error(`Failed to fetch feed: ${error.message}`);
    }
  };
  
  /**
   * Check if a user has access to view another user's activity.
   * Currently checks if they are friends.
   * 
   * @param {string} viewerId - User requesting to view
   * @param {string} targetUserId - User whose activity is being viewed
   * @returns {Promise<boolean>} True if viewer can see target's activity
   */
  const canViewActivity = async (viewerId, targetUserId) => {
    // Users can always see their own activities
    if (viewerId === targetUserId) {
      return true;
    }
    
    // Check if they are friends
    return await repository.areFriends(viewerId, targetUserId);
  };
  
  return {
    getFeed,
    canViewActivity
  };
};

// Default instance for production wiring
const defaultService = createFeedService();
export default defaultService;
