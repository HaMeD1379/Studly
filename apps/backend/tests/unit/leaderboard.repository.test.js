/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/leaderboard.repository.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Purpose: Unit tests for leaderboard repository self-inclusion logic
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createLeaderboardRepository } from '../../src/repositories/leaderboard.repository.js';

const MOCK_USER_1 = '11111111-1111-1111-1111-111111111111';
const MOCK_USER_2 = '22222222-2222-2222-2222-222222222222';
const MOCK_USER_3 = '33333333-3333-3333-3333-333333333333';
const MOCK_USER_4 = '44444444-4444-4444-4444-444444444444';

test('findStudyTimeLeaderboard - should include ensureUserId even if outside top N', async () => {
  const mockClient = {
    from: (tableName) => {
      if (tableName === 'sessions') {
        return {
          select: () => ({
            not: () => ({
              data: [
                { user_id: MOCK_USER_1, total_time: 1000 },
                { user_id: MOCK_USER_2, total_time: 800 },
                { user_id: MOCK_USER_3, total_time: 600 },
                { user_id: MOCK_USER_4, total_time: 100 }
              ],
              error: null
            })
          })
        };
      }

      if (tableName === 'user_profile') {
        return {
          select: () => ({
            in: () => ({
              data: [
                { user_id: MOCK_USER_1, bio: 'Top User' },
                { user_id: MOCK_USER_2, bio: 'Second User' },
                { user_id: MOCK_USER_3, bio: 'Third User' },
                { user_id: MOCK_USER_4, bio: 'Bottom User' }
              ],
              error: null
            })
          })
        };
      }

      return { select: () => ({ data: [], error: null }) };
    }
  };

  const repo = createLeaderboardRepository(mockClient);
  const result = await repo.findStudyTimeLeaderboard({
    userIds: null,
    limit: 3,
    ensureUserId: MOCK_USER_4
  });

  // Should have 4 entries: top 3 + MOCK_USER_4
  assert.strictEqual(result.length, 4, 'Should include ensureUserId even outside top N');

  // Verify top 3 are in order
  assert.strictEqual(result[0].user_id, MOCK_USER_1);
  assert.strictEqual(result[1].user_id, MOCK_USER_2);
  assert.strictEqual(result[2].user_id, MOCK_USER_3);

  // Verify MOCK_USER_4 is appended
  assert.strictEqual(result[3].user_id, MOCK_USER_4);
  assert.strictEqual(result[3].total_minutes, 100);
});

test('findStudyTimeLeaderboard - should not duplicate ensureUserId if already in top N', async () => {
  const mockClient = {
    from: (tableName) => {
      if (tableName === 'sessions') {
        return {
          select: () => ({
            not: () => ({
              data: [
                { user_id: MOCK_USER_1, total_time: 1000 },
                { user_id: MOCK_USER_2, total_time: 800 },
                { user_id: MOCK_USER_3, total_time: 600 }
              ],
              error: null
            })
          })
        };
      }

      if (tableName === 'user_profile') {
        return {
          select: () => ({
            in: () => ({
              data: [
                { user_id: MOCK_USER_1, bio: 'Top User' },
                { user_id: MOCK_USER_2, bio: 'Second User' },
                { user_id: MOCK_USER_3, bio: 'Third User' }
              ],
              error: null
            })
          })
        };
      }

      return { select: () => ({ data: [], error: null }) };
    }
  };

  const repo = createLeaderboardRepository(mockClient);
  const result = await repo.findStudyTimeLeaderboard({
    userIds: null,
    limit: 3,
    ensureUserId: MOCK_USER_2
  });

  // Should have exactly 3 entries (no duplication)
  assert.strictEqual(result.length, 3, 'Should not duplicate ensureUserId if in top N');
  assert.strictEqual(result[1].user_id, MOCK_USER_2);
});

test('findBadgeCountLeaderboard - should include ensureUserId even if outside top N', async () => {
  const mockClient = {
    from: (tableName) => {
      if (tableName === 'user_badge') {
        return {
          select: () => ({
            data: [
              { user_id: MOCK_USER_1 },
              { user_id: MOCK_USER_1 },
              { user_id: MOCK_USER_1 },
              { user_id: MOCK_USER_2 },
              { user_id: MOCK_USER_2 },
              { user_id: MOCK_USER_3 },
              { user_id: MOCK_USER_4 }
            ],
            error: null
          })
        };
      }

      if (tableName === 'user_profile') {
        return {
          select: () => ({
            in: () => ({
              data: [
                { user_id: MOCK_USER_1, bio: 'Top User' },
                { user_id: MOCK_USER_2, bio: 'Second User' },
                { user_id: MOCK_USER_3, bio: 'Third User' },
                { user_id: MOCK_USER_4, bio: 'Bottom User' }
              ],
              error: null
            })
          })
        };
      }

      return { select: () => ({ data: [], error: null }) };
    }
  };

  const repo = createLeaderboardRepository(mockClient);
  const result = await repo.findBadgeCountLeaderboard({
    userIds: null,
    limit: 2,
    ensureUserId: MOCK_USER_4
  });

  // Should have 3 entries: top 2 + MOCK_USER_4
  assert.strictEqual(result.length, 3, 'Should include ensureUserId even outside top N');

  // Verify top 2
  assert.strictEqual(result[0].user_id, MOCK_USER_1);
  assert.strictEqual(result[0].badge_count, 3);
  assert.strictEqual(result[1].user_id, MOCK_USER_2);
  assert.strictEqual(result[1].badge_count, 2);

  // Verify MOCK_USER_4 is appended
  assert.strictEqual(result[2].user_id, MOCK_USER_4);
  assert.strictEqual(result[2].badge_count, 1);
});

test('findBadgeCountLeaderboard - should handle ensureUserId with no data', async () => {
  const mockClient = {
    from: (tableName) => {
      if (tableName === 'user_badge') {
        return {
          select: () => ({
            data: [
              { user_id: MOCK_USER_1 },
              { user_id: MOCK_USER_2 }
            ],
            error: null
          })
        };
      }

      if (tableName === 'user_profile') {
        return {
          select: () => ({
            in: () => ({
              data: [
                { user_id: MOCK_USER_1, bio: 'Top User' },
                { user_id: MOCK_USER_2, bio: 'Second User' }
              ],
              error: null
            })
          })
        };
      }

      return { select: () => ({ data: [], error: null }) };
    }
  };

  const repo = createLeaderboardRepository(mockClient);
  const result = await repo.findBadgeCountLeaderboard({
    userIds: null,
    limit: 2,
    ensureUserId: MOCK_USER_4 // This user has no badges
  });

  // Should have exactly 2 entries (ensureUserId not included since they have no data)
  assert.strictEqual(result.length, 2, 'Should not include ensureUserId if they have no data');
});
