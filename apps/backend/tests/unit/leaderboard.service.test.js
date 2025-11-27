/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/leaderboard.service.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Last-Updated: 2025-11-14
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for leaderboard service layer. Tests business logic for:
 *  • Field mapping (DB snake_case to API camelCase)
 *  • Ranking calculation (1-based sequential)
 *  • Self-identification (isSelf flag, displayName="You")
 *  • Empty dataset handling
 *  • Friends vs global leaderboard filtering
 *
 *  Test Strategy
 *  -------------
 *  • Mock repository layer to isolate service logic
 *  • Test each leaderboard type independently
 *  • Verify edge cases (no friends, ties, requesting user not in top N)
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createLeaderboardService } from '../../src/services/leaderboard.service.js';

const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';
const MOCK_FRIEND_ID_1 = '22222222-2222-2222-2222-222222222222';
const MOCK_FRIEND_ID_2 = '33333333-3333-3333-3333-333333333333';

// Factory for creating mock repository with default data
const createMockRepository = (overrides = {}) => {
  const defaults = {
    findAcceptedFriendsForUser: async () => [],
    findStudyTimeLeaderboard: async () => [],
    findBadgeCountLeaderboard: async () => []
  };

  return { ...defaults, ...overrides };
};

test('getLeaderboards - should return all four leaderboards with correct structure', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [MOCK_FRIEND_ID_1, MOCK_FRIEND_ID_2],
    findStudyTimeLeaderboard: async () => [
      { user_id: MOCK_FRIEND_ID_1, total_minutes: 1000, full_name: 'Friend One' },
      { user_id: MOCK_USER_ID, total_minutes: 500, full_name: 'Me' }
    ],
    findBadgeCountLeaderboard: async () => [
      { user_id: MOCK_FRIEND_ID_2, badge_count: 15, full_name: 'Friend Two' },
      { user_id: MOCK_USER_ID, badge_count: 10, full_name: 'Me' }
    ]
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  assert.ok(result.friends, 'Should have friends object');
  assert.ok(result.global, 'Should have global object');
  assert.ok(result.metadata, 'Should have metadata object');

  assert.ok(result.friends.studyTime, 'Should have friends.studyTime');
  assert.ok(result.friends.badges, 'Should have friends.badges');
  assert.ok(result.global.studyTime, 'Should have global.studyTime');
  assert.ok(result.global.badges, 'Should have global.badges');

  assert.strictEqual(result.metadata.userId, MOCK_USER_ID);
  assert.strictEqual(result.metadata.limit, 7);
  assert.ok(result.metadata.generatedAt, 'Should have generatedAt');
});

test('getLeaderboards - should mark requesting user with isSelf=true and displayName="You"', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [],
    findStudyTimeLeaderboard: async () => [
      { user_id: MOCK_USER_ID, total_minutes: 500, full_name: 'My Bio' }
    ],
    findBadgeCountLeaderboard: async () => [
      { user_id: MOCK_USER_ID, badge_count: 10, full_name: 'My Bio' }
    ]
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  const friendsStudyEntry = result.friends.studyTime[0];
  assert.strictEqual(friendsStudyEntry.isSelf, true);
  assert.strictEqual(friendsStudyEntry.displayName, 'You');
  assert.strictEqual(friendsStudyEntry.userId, MOCK_USER_ID);

  const friendsBadgeEntry = result.friends.badges[0];
  assert.strictEqual(friendsBadgeEntry.isSelf, true);
  assert.strictEqual(friendsBadgeEntry.displayName, 'You');
});

test('getLeaderboards - should add sequential rankings starting from 1', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [MOCK_FRIEND_ID_1, MOCK_FRIEND_ID_2],
    findStudyTimeLeaderboard: async () => [
      { user_id: MOCK_FRIEND_ID_1, total_minutes: 1000, full_name: 'First' },
      { user_id: MOCK_FRIEND_ID_2, total_minutes: 800, full_name: 'Second' },
      { user_id: MOCK_USER_ID, total_minutes: 600, full_name: 'Third' }
    ],
    findBadgeCountLeaderboard: async () => []
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  const studyTime = result.friends.studyTime;
  assert.strictEqual(studyTime[0].rank, 1);
  assert.strictEqual(studyTime[1].rank, 2);
  assert.strictEqual(studyTime[2].rank, 3);
});

test('getLeaderboards - should handle empty leaderboards gracefully', async () => {
  const mockRepo = createMockRepository();
  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  assert.deepStrictEqual(result.friends.studyTime, []);
  assert.deepStrictEqual(result.friends.badges, []);
  assert.deepStrictEqual(result.global.studyTime, []);
  assert.deepStrictEqual(result.global.badges, []);
});

test('getLeaderboards - should map study time fields correctly to camelCase', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [],
    findStudyTimeLeaderboard: async () => [
      { user_id: MOCK_FRIEND_ID_1, total_minutes: 1234.56, full_name: 'Test User' }
    ],
    findBadgeCountLeaderboard: async () => []
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  const entry = result.friends.studyTime[0];
  assert.strictEqual(entry.userId, MOCK_FRIEND_ID_1);
  assert.strictEqual(entry.totalMinutes, 1234.56);
  assert.strictEqual(entry.displayName, 'Test User');
  assert.strictEqual(entry.rank, 1);
  assert.strictEqual(entry.isSelf, false);
});

test('getLeaderboards - should map badge count fields correctly to camelCase', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [],
    findStudyTimeLeaderboard: async () => [],
    findBadgeCountLeaderboard: async () => [
      { user_id: MOCK_FRIEND_ID_1, badge_count: 42, full_name: 'Badge Master' }
    ]
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  const entry = result.friends.badges[0];
  assert.strictEqual(entry.userId, MOCK_FRIEND_ID_1);
  assert.strictEqual(entry.badgeCount, 42);
  assert.strictEqual(entry.displayName, 'Badge Master');
  assert.strictEqual(entry.rank, 1);
  assert.strictEqual(entry.isSelf, false);
});

test('getLeaderboards - should handle null full_name by returning null displayName', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [],
    findStudyTimeLeaderboard: async () => [
      { user_id: MOCK_FRIEND_ID_1, total_minutes: 500, full_name: null }
    ],
    findBadgeCountLeaderboard: async () => []
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  const entry = result.friends.studyTime[0];
  assert.strictEqual(entry.displayName, null);
  assert.strictEqual(entry.isSelf, false);
});

test('getLeaderboards - should include requesting user even with no friends', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => [],
    findStudyTimeLeaderboard: async () => [
      { user_id: MOCK_USER_ID, total_minutes: 100, full_name: 'Solo' }
    ],
    findBadgeCountLeaderboard: async () => []
  });

  const service = createLeaderboardService(mockRepo);
  const result = await service.getLeaderboards(MOCK_USER_ID, 7);

  assert.strictEqual(result.friends.studyTime.length, 1);
  assert.strictEqual(result.friends.studyTime[0].isSelf, true);
});

test('getLeaderboards - should throw error if repository fails', async () => {
  const mockRepo = createMockRepository({
    findAcceptedFriendsForUser: async () => {
      throw new Error('Database connection failed');
    }
  });

  const service = createLeaderboardService(mockRepo);

  await assert.rejects(
    async () => service.getLeaderboards(MOCK_USER_ID, 7),
    { message: /Failed to fetch leaderboards/ }
  );
});

