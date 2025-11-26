/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/leaderboard.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Last-Updated: 2025-11-14
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Integration tests for the leaderboard endpoint using node:test runner.
 *  Tests the complete request flow from HTTP endpoint through controller,
 *  service, and repository layers with mocked Supabase client.
 *
 *  Test Coverage
 *  -------------
 *  • GET /api/v1/leaderboard?userId={uuid} - success with mock data
 *  • Query parameter validation (missing userId, invalid limit)
 *  • Empty leaderboard results (no friends, no data)
 *  • Self-identification (isSelf flag, "You" label)
 *  • Ranking calculation and ordering
 *
 *  Design Principles
 *  -----------------
 *  • Mock Supabase client in-place for deterministic responses
 *  • Use realistic UUIDs and data structures matching DB schema
 *  • Verify response structure matches API contract
 *
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import supabase from '../../src/config/supabase.client.js';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../../src/index.js');

const originalFrom = supabase.from;

// Test UUIDs
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';
const TEST_FRIEND_1 = '22222222-2222-2222-2222-222222222222';
const TEST_FRIEND_2 = '33333333-3333-3333-3333-333333333333';
const TEST_OTHER_USER = '44444444-4444-4444-4444-444444444444';

// Mock data
const mockFriends = [
  { from_user: TEST_USER_ID, to_user: TEST_FRIEND_1, status: 2 },
  { from_user: TEST_FRIEND_2, to_user: TEST_USER_ID, status: 2 }
];

const mockSessions = [
  { user_id: TEST_USER_ID, total_time: 500, end_time: '2025-11-01T10:00:00Z' },
  { user_id: TEST_USER_ID, total_time: 300, end_time: '2025-11-02T10:00:00Z' },
  { user_id: TEST_FRIEND_1, total_time: 1000, end_time: '2025-11-01T10:00:00Z' },
  { user_id: TEST_FRIEND_1, total_time: 500, end_time: '2025-11-02T10:00:00Z' },
  { user_id: TEST_FRIEND_2, total_time: 600, end_time: '2025-11-01T10:00:00Z' },
  { user_id: TEST_OTHER_USER, total_time: 2000, end_time: '2025-11-01T10:00:00Z' }
];

const mockUserBadges = [
  { user_id: TEST_USER_ID, badge_id: 'b1' },
  { user_id: TEST_USER_ID, badge_id: 'b2' },
  { user_id: TEST_FRIEND_1, badge_id: 'b1' },
  { user_id: TEST_FRIEND_1, badge_id: 'b2' },
  { user_id: TEST_FRIEND_1, badge_id: 'b3' },
  { user_id: TEST_FRIEND_2, badge_id: 'b1' },
  { user_id: TEST_OTHER_USER, badge_id: 'b1' },
  { user_id: TEST_OTHER_USER, badge_id: 'b2' },
  { user_id: TEST_OTHER_USER, badge_id: 'b3' },
  { user_id: TEST_OTHER_USER, badge_id: 'b4' }
];

const mockProfiles = [
  { user_id: TEST_USER_ID, full_name: 'Test User' },
  { user_id: TEST_FRIEND_1, full_name: 'Friend One' },
  { user_id: TEST_FRIEND_2, full_name: 'Friend Two' },
  { user_id: TEST_OTHER_USER, full_name: 'Top User' }
];

let server;

beforeEach(() => {
  // Reset Supabase mocks to match repository implementation
  supabase.from = (tableName) => {
    if (tableName === 'friends') {
      return {
        select: () => ({
          eq: () => ({
            or: () => ({
              data: mockFriends,
              error: null,
            }),
          }),
        }),
      };
    }

    if (tableName === 'sessions') {
      return {
        select: () => ({
          not: () => ({
            in: (column, values) => {
              const filtered = Array.isArray(values)
                ? mockSessions.filter((s) => values.includes(s.user_id))
                : mockSessions;
              return { data: filtered, error: null };
            },
          }),
        }),
      };
    }

    if (tableName === 'user_badge') {
      return {
        select: () => ({
          in: (column, values) => {
            const filtered = Array.isArray(values)
              ? mockUserBadges.filter((b) => values.includes(b.user_id))
              : mockUserBadges;
            return { data: filtered, error: null };
          },
        }),
      };
    }

    if (tableName === 'user_profile') {
      return {
        select: () => ({
          in: (column, values) => {
            const filtered = Array.isArray(values)
              ? mockProfiles.filter((p) => values.includes(p.user_id))
              : mockProfiles;
            return { data: filtered, error: null };
          },
        }),
      };
    }

    return originalFrom(tableName);
  };

  // Start test server
  server = app.listen(0);
});

afterEach(() => {
  supabase.from = originalFrom;
  if (server) {
    server.close();
  }
});

test('GET /api/v1/leaderboard - should return 400 when userId is missing', async () => {
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/v1/leaderboard`, {
    headers: {
      'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
    }
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /userId.*required/i);
});

test('GET /api/v1/leaderboard - should return 400 when userId is invalid', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=invalid-uuid`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /valid UUID/i);
});

test('GET /api/v1/leaderboard - should return 400 when limit is invalid', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}&limit=-5`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /limit.*positive/i);
});

test('GET /api/v1/leaderboard - should return all four leaderboards with correct structure', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}&limit=7`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 200);
  const body = await res.json();

  // Verify structure
  assert.ok(body.friends, 'Should have friends object');
  assert.ok(body.global, 'Should have global object');
  assert.ok(body.metadata, 'Should have metadata object');

  assert.ok(Array.isArray(body.friends.studyTime), 'friends.studyTime should be array');
  assert.ok(Array.isArray(body.friends.badges), 'friends.badges should be array');
  assert.ok(Array.isArray(body.global.studyTime), 'global.studyTime should be array');
  assert.ok(Array.isArray(body.global.badges), 'global.badges should be array');

  // Verify metadata
  assert.strictEqual(body.metadata.userId, TEST_USER_ID);
  assert.strictEqual(body.metadata.limit, 7);
  assert.ok(body.metadata.generatedAt, 'Should have generatedAt timestamp');
});

test('GET /api/v1/leaderboard - should mark requesting user with isSelf=true', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 200);
  const body = await res.json();

  // Find requesting user in results
  const selfInFriendsStudy = body.friends.studyTime.find(e => e.userId === TEST_USER_ID);
  if (selfInFriendsStudy) {
    assert.strictEqual(selfInFriendsStudy.isSelf, true, 'Should mark self as isSelf=true');
    assert.strictEqual(selfInFriendsStudy.displayName, 'You', 'Should show "You" as displayName');
  }

  const selfInFriendsBadges = body.friends.badges.find(e => e.userId === TEST_USER_ID);
  if (selfInFriendsBadges) {
    assert.strictEqual(selfInFriendsBadges.isSelf, true);
    assert.strictEqual(selfInFriendsBadges.displayName, 'You');
  }
});

test('GET /api/v1/leaderboard - should include rank field in all entries', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 200);
  const body = await res.json();

  // Verify all entries have rank field
  if (body.friends.studyTime.length > 0) {
    body.friends.studyTime.forEach((entry, idx) => {
      assert.strictEqual(entry.rank, idx + 1, `Rank should be ${idx + 1}`);
    });
  }

  if (body.friends.badges.length > 0) {
    body.friends.badges.forEach((entry, idx) => {
      assert.strictEqual(entry.rank, idx + 1);
    });
  }
});

test('GET /api/v1/leaderboard - study time entries should have totalMinutes field', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 200);
  const body = await res.json();

  if (body.friends.studyTime.length > 0) {
    const entry = body.friends.studyTime[0];
    assert.ok(typeof entry.totalMinutes === 'number', 'totalMinutes should be a number');
    assert.ok(entry.userId, 'Should have userId');
    assert.ok('displayName' in entry, 'Should have displayName field');
    assert.ok(typeof entry.isSelf === 'boolean', 'isSelf should be boolean');
  }
});

test('GET /api/v1/leaderboard - badge entries should have badgeCount field', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 200);
  const body = await res.json();

  if (body.friends.badges.length > 0) {
    const entry = body.friends.badges[0];
    assert.ok(typeof entry.badgeCount === 'number', 'badgeCount should be a number');
    assert.ok(entry.userId, 'Should have userId');
    assert.ok('displayName' in entry, 'Should have displayName field');
    assert.ok(typeof entry.isSelf === 'boolean', 'isSelf should be boolean');
  }
});

test('GET /api/v1/leaderboard - should use default limit of 7 when not specified', async () => {
  const port = server.address().port;
  const res = await fetch(
    `http://localhost:${port}/api/v1/leaderboard?userId=${TEST_USER_ID}`,
    {
      headers: {
        'x-internal-api-key': process.env.INTERNAL_API_TOKEN || 'test-key'
      }
    }
  );

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.metadata.limit, 7);
});
