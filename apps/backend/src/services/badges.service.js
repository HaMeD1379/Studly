import badgesRepository from '../repositories/badges.repository.js';
import { BADGE_CRITERIA } from '../models/badges.model.js';

export const createBadgesService = (repository = badgesRepository) => {
  
  const getAllBadges = async () => {
    return await repository.findAllBadges();
  };
  
  const getUserBadges = async (userId, includeProgress = true) => {
    return await repository.findUserBadges(userId, includeProgress);
  };
  
  const awardBadge = async (userId, badgeId) => {
    // Check if already awarded
    const existing = await repository.findUserBadgeByIds(userId, badgeId);
    if (existing && existing.earned_at) {
      throw new Error('BADGE_ALREADY_EARNED');
    }
    
    // Award the badge
    const userBadge = {
      user_id: userId,
      badge_id: badgeId,
      progress: 100,
      earned_at: new Date().toISOString()
    };
    
    return await repository.upsertUserBadge(userBadge);
  };
  
  const updateBadgeProgress = async (userId, badgeId, progress) => {
    const userBadge = {
      user_id: userId,
      badge_id: badgeId,
      progress: Math.min(100, Math.max(0, progress)),
      earned_at: progress >= 100 ? new Date().toISOString() : null
    };
    
    return await repository.upsertUserBadge(userBadge);
  };
  
  // Core business logic for checking badges
  const checkAndAwardBadges = async (userId) => {
    const sessions = await repository.getUserSessionStats(userId);
    const userBadges = await repository.findUserBadges(userId);
    const allBadges = await repository.findAllBadges();
    
    const newlyEarnedBadges = [];
    
    for (const badge of allBadges) {
      // Skip if already earned
      const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
      if (userBadge?.earned_at) continue;
      
      // Check if badge criteria is met
      const progress = calculateBadgeProgress(sessions, badge.requirements);
      
      if (progress >= 100) {
        const awarded = await awardBadge(userId, badge.id);
        newlyEarnedBadges.push(awarded);
      } else if (progress > 0) {
        await updateBadgeProgress(userId, badge.id, progress);
      }
    }
    
    return newlyEarnedBadges;
  };
  
  // Calculate progress based on badge requirements
    const calculateBadgeProgress = (sessions, requirements) => {
    if (!requirements) return 0;
    
    switch (requirements.type) {
        case 'session_count':
        return Math.min(100, (sessions.length / requirements.value) * 100);
        
        case 'total_minutes':
        // Use total_time field (assuming it's in minutes)
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.total_time || 0), 0);
        return Math.min(100, (totalMinutes / requirements.value) * 100);
        
        case 'consecutive_days':
        const streak = calculateStreak(sessions);
        return Math.min(100, (streak / requirements.value) * 100);
        
        default:
        return 0;
    }
    };

    // Update the calculateStreak function to use the date field
    const calculateStreak = (sessions) => {
    if (!sessions.length) return 0;
    
    // Use the date field directly since it's already a date type
    const dates = [...new Set(sessions.map(s => s.date))]
        .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
        const current = new Date(dates[i]);
        const previous = new Date(dates[i - 1]);
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
    updateBadgeProgress,
    checkAndAwardBadges,
    // Expose for testing
    __private: {
      calculateBadgeProgress,
      calculateStreak
    }
  };
};

const defaultService = createBadgesService();
export default defaultService;