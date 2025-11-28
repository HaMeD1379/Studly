/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/feed.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-27
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Integration tests for Feed API endpoints.
 *
 *  @module tests/integration/feed
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import STRINGS from "../../src/config/strings.config.js";
import supabase from "../../src/config/supabase.client.js";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../src/index.js");

const MOCK_API_KEY = "test-api-key";
const originalFrom = supabase.from.bind(supabase);

const restoreSupabase = () => {
  supabase.from = originalFrom;
};

beforeEach(() => {
  process.env.INTERNAL_API_TOKEN = MOCK_API_KEY;
  supabase.from = originalFrom;
});

afterEach(() => {
  restoreSupabase();
});

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });

const stopServer = (server) =>
  new Promise((resolve) => {
    server.close(resolve);
  });

test("GET /api/v1/feed/:timestamp - should return combined feed with badges and sessions", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";
  const mockUserBadges = [
    {
      badge_id: "badge-1-uuid",
      user_id: "user-1-uuid",
      earned_at: "2025-11-27T10:30:00Z",
    },
  ];
  const mockSessions = [
    {
      id: "session-1-uuid",
      user_id: "user-2-uuid",
      start_time: "2025-11-27T09:00:00Z",
      end_time: "2025-11-27T10:00:00Z",
      subject: "Mathematics",
      session_type: 1,
      total_time: 60,
      inserted_at: "2025-11-27T09:15:00Z",
    },
  ];
  const mockUsers = [
    {
      user_id: "user-1-uuid",
      full_name: "John Doe",
      email: "john@example.com",
    },
    {
      user_id: "user-2-uuid",
      full_name: "Jane Smith",
      email: "jane@example.com",
    },
  ];
  const mockBadges = [
    {
      badge_id: "badge-1-uuid",
      name: "First Study Session",
      description: "Complete your first study session",
      icon_url: "https://example.com/icon.png",
      category: "achievement",
      criteria_type: "session_count",
      threshold: 1,
    },
  ];

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: mockUserBadges, error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: mockSessions, error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockUsers, error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockBadges, error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 2);
  assert.strictEqual(body.data.feed.length, 2);

  // Should be sorted oldest to newest
  assert.strictEqual(body.data.feed[0].type, "session");
  assert.strictEqual(body.data.feed[0].timestamp, "2025-11-27T09:15:00Z");
  assert.strictEqual(body.data.feed[1].type, "badge");
  assert.strictEqual(body.data.feed[1].timestamp, "2025-11-27T10:30:00Z");

  // Validate session structure
  assert.strictEqual(body.data.feed[0].user.user_id, "user-2-uuid");
  assert.strictEqual(body.data.feed[0].user.full_name, "Jane Smith");
  assert.strictEqual(body.data.feed[0].session.id, "session-1-uuid");
  assert.strictEqual(body.data.feed[0].session.subject, "Mathematics");

  // Validate badge structure
  assert.strictEqual(body.data.feed[1].user.user_id, "user-1-uuid");
  assert.strictEqual(body.data.feed[1].user.full_name, "John Doe");
  assert.strictEqual(body.data.feed[1].badge.name, "First Study Session");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should return empty feed when no data", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  supabase.from = (table) => {
    if (table === "user_badge" || table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 0);
  assert.strictEqual(body.data.feed.length, 0);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should return 400 for invalid timestamp", async () => {
  const invalidTimestamp = "invalid-timestamp";

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${invalidTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, STRINGS.FEED.INVALID_TIMESTAMP);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle Supabase error", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () =>
            Promise.resolve({
              data: null,
              error: { message: "Database error" },
            }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, "Database error");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle null data from Supabase", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  supabase.from = (table) => {
    if (table === "user_badge" || table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: null, error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 0);
  assert.strictEqual(body.data.feed.length, 0);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle unexpected errors", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  supabase.from = () => {
    throw new Error("Unexpected database error");
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 500);
  assert.strictEqual(body.error, STRINGS.SERVER.INTERNAL_ERROR);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle sessions query error", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () =>
            Promise.resolve({
              data: null,
              error: { message: "Sessions query failed" },
            }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, "Sessions query failed");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle user profile query error", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () =>
            Promise.resolve({
              data: null,
              error: { message: "User profile fetch failed" },
            }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, "User profile fetch failed");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle badge query error", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "John Doe",
    email: "john@example.com",
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () =>
            Promise.resolve({
              data: null,
              error: { message: "Badge fetch failed" },
            }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, "Badge fetch failed");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should return only badges when no sessions", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "John Doe",
    email: "john@example.com",
  };

  const mockBadgeData = {
    badge_id: "badge-1",
    name: "First Badge",
    description: "Badge description",
    icon_url: "http://example.com/badge.png",
    category: "achievement",
    criteria_type: "session_count",
    threshold: 1,
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockBadgeData], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  assert.strictEqual(body.data.feed.length, 1);
  assert.strictEqual(body.data.feed[0].type, "badge");
  assert.deepStrictEqual(body.data.feed[0].user, mockUser);
  assert.deepStrictEqual(body.data.feed[0].badge, mockBadgeData);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should return only sessions when no badges", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockSession = {
    id: "session-1",
    user_id: "user-1",
    start_time: "2025-11-27T09:00:00Z",
    end_time: "2025-11-27T10:00:00Z",
    subject: "Math",
    session_type: "focus",
    total_time: 60,
    inserted_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "Jane Doe",
    email: "jane@example.com",
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockSession], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  assert.strictEqual(body.data.feed.length, 1);
  assert.strictEqual(body.data.feed[0].type, "session");
  assert.deepStrictEqual(body.data.feed[0].user, mockUser);
  assert.strictEqual(body.data.feed[0].session.id, mockSession.id);
  assert.strictEqual(body.data.feed[0].session.subject, mockSession.subject);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should limit results to 100 items", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  // Create 150 badges (should be limited to 100)
  const mockBadges = Array.from({ length: 150 }, (_, i) => ({
    badge_id: `badge-${i}`,
    user_id: `user-${i}`,
    earned_at: `2025-11-27T${String(10 + Math.floor(i / 60)).padStart(
      2,
      "0"
    )}:${String(i % 60).padStart(2, "0")}:00Z`,
  }));

  const mockUsers = Array.from({ length: 150 }, (_, i) => ({
    user_id: `user-${i}`,
    full_name: `User ${i}`,
    email: `user${i}@example.com`,
  }));

  const mockBadgeData = Array.from({ length: 150 }, (_, i) => ({
    badge_id: `badge-${i}`,
    name: `Badge ${i}`,
    description: `Description ${i}`,
    icon_url: `http://example.com/badge${i}.png`,
    category: "achievement",
    criteria_type: "session_count",
    threshold: i + 1,
  }));

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: mockBadges, error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockUsers, error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockBadgeData, error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 100); // Should be limited to 100
  assert.strictEqual(body.data.feed.length, 100);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle missing user data gracefully", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockBadgeData = {
    badge_id: "badge-1",
    name: "First Badge",
    description: "Badge description",
    icon_url: "http://example.com/badge.png",
    category: "achievement",
    criteria_type: "session_count",
    threshold: 1,
  };

  // Return empty user array (user not found)
  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [], error: null }), // No users found
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockBadgeData], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  // User data should be empty strings when user not found
  assert.strictEqual(body.data.feed[0].user.full_name, "");
  assert.strictEqual(body.data.feed[0].user.email, "");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle missing badge data gracefully", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "John Doe",
    email: "john@example.com",
  };

  // Return empty badge array (badge not found)
  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [], error: null }), // No badges found
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  // Badge data should be empty strings/0 when badge not found
  assert.strictEqual(body.data.feed[0].badge.name, "");
  assert.strictEqual(body.data.feed[0].badge.description, "");
  assert.strictEqual(body.data.feed[0].badge.threshold, 0);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle null sessions data", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: null, error: null }), // Null data
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 0);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle null badge data", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "John Doe",
    email: "john@example.com",
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: null, error: null }), // Null badge data
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  // Should handle null badge data gracefully
  assert.strictEqual(body.data.feed[0].badge.name, "");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle null users data", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockBadgeData = {
    badge_id: "badge-1",
    name: "First Badge",
    description: "Badge description",
    icon_url: "http://example.com/badge.png",
    category: "achievement",
    criteria_type: "session_count",
    threshold: 1,
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: null, error: null }), // Null user data
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockBadgeData], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  // Should handle null user data gracefully
  assert.strictEqual(body.data.feed[0].user.full_name, "");
  assert.strictEqual(body.data.feed[0].user.email, "");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle empty badgeIds array", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockSession = {
    id: "session-1",
    user_id: "user-1",
    start_time: "2025-11-27T09:00:00Z",
    end_time: "2025-11-27T10:00:00Z",
    subject: "Math",
    session_type: 1,
    total_time: 60,
    inserted_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "Jane Doe",
    email: "jane@example.com",
  };

  let badgeQueryCalled = false;

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }), // No badges
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockSession], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    if (table === "badge") {
      badgeQueryCalled = true;
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.message, STRINGS.FEED.GET_SUCCESS);
  assert.strictEqual(body.data.count, 1);
  assert.strictEqual(body.data.feed[0].type, "session");
  // Badge query should NOT be called when badgeIds is empty
  assert.strictEqual(badgeQueryCalled, false);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should use actual values when user and badge data exist", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "John Doe",
    email: "john@example.com",
  };

  const mockBadgeData = {
    badge_id: "badge-1",
    name: "Test Badge",
    description: "Test Description",
    icon_url: "http://test.com/icon.png",
    category: "test",
    criteria_type: "test_type",
    threshold: 5,
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockBadgeData], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  // Verify actual values are used, not fallback empty strings
  assert.strictEqual(body.data.feed[0].user.full_name, "John Doe");
  assert.strictEqual(body.data.feed[0].user.email, "john@example.com");
  assert.strictEqual(body.data.feed[0].badge.name, "Test Badge");
  assert.strictEqual(body.data.feed[0].badge.description, "Test Description");
  assert.strictEqual(
    body.data.feed[0].badge.icon_url,
    "http://test.com/icon.png"
  );
  assert.strictEqual(body.data.feed[0].badge.category, "test");
  assert.strictEqual(body.data.feed[0].badge.criteria_type, "test_type");
  assert.strictEqual(body.data.feed[0].badge.threshold, 5);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should use actual session values when user data exists", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockSession = {
    id: "session-1",
    user_id: "user-1",
    start_time: "2025-11-27T09:00:00Z",
    end_time: "2025-11-27T10:00:00Z",
    subject: "Physics",
    session_type: 2,
    total_time: 90,
    inserted_at: "2025-11-27T10:00:00Z",
  };

  const mockUser = {
    user_id: "user-1",
    full_name: "Jane Smith",
    email: "jane@test.com",
  };

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockSession], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockUser], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  // Verify actual session values are used
  assert.strictEqual(body.data.feed[0].user.full_name, "Jane Smith");
  assert.strictEqual(body.data.feed[0].user.email, "jane@test.com");
  assert.strictEqual(body.data.feed[0].session.id, "session-1");
  assert.strictEqual(body.data.feed[0].session.subject, "Physics");
  assert.strictEqual(body.data.feed[0].session.session_type, 2);
  assert.strictEqual(body.data.feed[0].session.total_time, 90);

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should handle mixed null and empty array data", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadge = {
    badge_id: "badge-1",
    user_id: "user-1",
    earned_at: "2025-11-27T10:00:00Z",
  };

  const mockBadgeData = {
    badge_id: "badge-1",
    name: "Badge Name",
    description: "Badge Desc",
    icon_url: "http://icon.png",
    category: "cat",
    criteria_type: "type",
    threshold: 10,
  };

  // Mix of null and empty arrays
  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [mockBadge], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: null, error: null }), // null
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [], error: null }), // empty array
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: [mockBadgeData], error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.data.count, 1);
  // Should handle null sessions (using || []) and empty users gracefully
  assert.strictEqual(body.data.feed[0].type, "badge");
  assert.strictEqual(body.data.feed[0].user.full_name, "");
  assert.strictEqual(body.data.feed[0].badge.name, "Badge Name");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should properly map multiple badges with all data present", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockBadges = [
    {
      badge_id: "badge-1",
      user_id: "user-1",
      earned_at: "2025-11-27T10:00:00Z",
    },
    {
      badge_id: "badge-2",
      user_id: "user-2",
      earned_at: "2025-11-27T11:00:00Z",
    },
  ];

  const mockUsers = [
    {
      user_id: "user-1",
      full_name: "User One",
      email: "user1@test.com",
    },
    {
      user_id: "user-2",
      full_name: "User Two",
      email: "user2@test.com",
    },
  ];

  const mockBadgeData = [
    {
      badge_id: "badge-1",
      name: "Badge One",
      description: "Desc One",
      icon_url: "http://icon1.png",
      category: "cat1",
      criteria_type: "type1",
      threshold: 1,
    },
    {
      badge_id: "badge-2",
      name: "Badge Two",
      description: "Desc Two",
      icon_url: "http://icon2.png",
      category: "cat2",
      criteria_type: "type2",
      threshold: 2,
    },
  ];

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: mockBadges, error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockUsers, error: null }),
        }),
      };
    }
    if (table === "badge") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockBadgeData, error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.data.count, 2);
  // Verify all array mapping worked correctly
  assert.strictEqual(body.data.feed[0].badge.name, "Badge One");
  assert.strictEqual(body.data.feed[0].user.full_name, "User One");
  assert.strictEqual(body.data.feed[1].badge.name, "Badge Two");
  assert.strictEqual(body.data.feed[1].user.full_name, "User Two");

  await stopServer(server);
});

test("GET /api/v1/feed/:timestamp - should properly map multiple sessions with all data present", async () => {
  const mockTimestamp = "2025-11-27T00:00:00Z";

  const mockSessions = [
    {
      id: "session-1",
      user_id: "user-1",
      start_time: "2025-11-27T09:00:00Z",
      end_time: "2025-11-27T10:00:00Z",
      subject: "Math",
      session_type: 1,
      total_time: 60,
      inserted_at: "2025-11-27T10:00:00Z",
    },
    {
      id: "session-2",
      user_id: "user-2",
      start_time: "2025-11-27T11:00:00Z",
      end_time: "2025-11-27T12:00:00Z",
      subject: "Science",
      session_type: 2,
      total_time: 60,
      inserted_at: "2025-11-27T12:00:00Z",
    },
  ];

  const mockUsers = [
    {
      user_id: "user-1",
      full_name: "Student One",
      email: "student1@test.com",
    },
    {
      user_id: "user-2",
      full_name: "Student Two",
      email: "student2@test.com",
    },
  ];

  supabase.from = (table) => {
    if (table === "user_badge") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    }
    if (table === "sessions") {
      return {
        select: () => ({
          gte: () => Promise.resolve({ data: mockSessions, error: null }),
        }),
      };
    }
    if (table === "user_profile") {
      return {
        select: () => ({
          in: () => Promise.resolve({ data: mockUsers, error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FEED_ROUTE}/${mockTimestamp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MOCK_API_KEY,
      },
    }
  );

  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.data.count, 2);
  // Verify all session mapping worked correctly
  assert.strictEqual(body.data.feed[0].session.subject, "Math");
  assert.strictEqual(body.data.feed[0].user.full_name, "Student One");
  assert.strictEqual(body.data.feed[1].session.subject, "Science");
  assert.strictEqual(body.data.feed[1].user.full_name, "Student Two");

  await stopServer(server);
});
