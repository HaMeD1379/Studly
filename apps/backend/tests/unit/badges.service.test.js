import test from 'node:test';
import assert from 'node:assert/strict';
import { createBadgesService } from '../../src/services/badges.service.js';
import STRINGS from '../../src/config/strings.js';

// Helper to get date strings relative to today
const getRecentDates = () => {
  const today = new Date();
  const dates = [];
  
  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates; // Returns [today, yesterday, 2 days ago, 3 days ago]
};

// Mock repository
const createMockRepository = () => {
  const mockBadges = [
    { 
      badge_id: '1', 
      name: 'First Steps', 
      description: 'Complete your first session',
      icon_url: '/icons/first-steps.png',
      category: 'milestone',
      criteria_type: 'session_count',
      threshold: 1,
      created_at: '2025-01-01T00:00:00Z'
    },
    { 
      badge_id: '2', 
      name: '3 Day Streak', 
      description: 'Study 3 days in a row',
      icon_url: '/icons/streak.png',
      category: 'streak',
      criteria_type: 'consecutive_days',
      threshold: 3,
      created_at: '2025-01-01T00:00:00Z'
    }
  ];
  
  const mockUserBadges = [];
  
  const dates = getRecentDates();
  const mockSessions = [
    { date: dates[0], total_time: 30, end_time: `${dates[0]}T10:00:00Z` },
    { date: dates[1], total_time: 45, end_time: `${dates[1]}T10:00:00Z` },
    { date: dates[2], total_time: 60, end_time: `${dates[2]}T10:00:00Z` }
  ];
  
  return {
    findAllBadges: async () => mockBadges,
    findUserBadges: async () => mockUserBadges,
    findUserBadgeByIds: async () => null,
    createUserBadge: async (data) => ({ 
      ...data, 
      badge_id: data.badge_id || 'new-ub' 
    }),
    getUserSessionStats: async () => mockSessions
  };
};

test(STRINGS.TEST.BADGES_SERVICE_GET_ALL, async () => {
  const mockRepo = createMockRepository();
  const service = createBadgesService(mockRepo);
  
  const badges = await service.getAllBadges();
  
  assert.equal(badges.length, 2);
  assert.equal(badges[0].name, 'First Steps');
});

test(STRINGS.TEST.BADGES_SERVICE_AWARD, async () => {
  const mockRepo = createMockRepository();
  const service = createBadgesService(mockRepo);
  
  const result = await service.awardBadge('user123', 'badge1');
  
  assert.equal(result.userId, 'user123');
  assert.equal(result.badgeId, 'badge1');
  assert.ok(result.earnedAt);
});

test(STRINGS.TEST.BADGES_SERVICE_CALC_PROGRESS, async () => {
  const service = createBadgesService();
  const { calculateBadgeProgress } = service.__private;
  
  const sessions = [
    { total_time: 30 },
    { total_time: 40 }
  ];
  
  // Test session count
  const countProgress = calculateBadgeProgress(sessions, { 
    criteria_type: 'session_count',
    threshold: 4 
  });
  assert.equal(countProgress, 50); // 2 sessions / 4 required = 50%
  
  // Test total minutes
  const timeProgress = calculateBadgeProgress(sessions, { 
    criteria_type: 'total_minutes',
    threshold: 100 
  });
  assert.equal(timeProgress, 70); // 70 minutes / 100 required = 70%
});

test(STRINGS.TEST.BADGES_SERVICE_CALC_STREAK, async () => {
  const service = createBadgesService();
  const { calculateStreak } = service.__private;
  
  // Use dates relative to today (today, yesterday, 2 days ago, 4 days ago - with gap)
  const dates = getRecentDates();
  const sessions = [
    { date: dates[0] },  // today
    { date: dates[1] },  // yesterday
    { date: dates[2] },  // 2 days ago
    { date: dates[3].replace(/\d{2}$/, (d) => String(Number(d) - 1)) }  // 4 days ago (gap)
  ];
  
  const streak = calculateStreak(sessions);
  assert.equal(streak, 3); // Should be 3 consecutive days (today, yesterday, 2 days ago)
});

test(STRINGS.TEST.BADGES_SERVICE_CHECK, async () => {
  const mockRepo = createMockRepository();
  const service = createBadgesService(mockRepo);
  
  const newBadges = await service.checkAndAwardBadges('user123');
  
  // Should award "First Steps" badge (has 3 sessions, needs 1)
  // Should award "3 Day Streak" badge (has 3 consecutive days)
  assert.ok(newBadges.length >= 1);
});
