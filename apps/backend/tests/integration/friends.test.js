/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/friends.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Integration tests for Friends API endpoints.
 *
 *  @module tests/integration/friends
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

test("GET /api/v1/friends/count/:id - should return total friends count for a user", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          or: () => Promise.resolve({ count: 5, error: null }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/count/${mockUserId}`,
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
  assert.strictEqual(body.message, STRINGS.FRIENDS.COUNT_SUCCESS);
  assert.strictEqual(body.data.user_id, mockUserId);
  assert.strictEqual(body.data.count, 5);

  await stopServer(server);
});

test("GET /api/v1/friends/count/:id - should return friends count filtered by status", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          or: () => ({
            eq: () => Promise.resolve({ count: 3, error: null }),
          }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/count/${mockUserId}?status=2`,
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
  assert.strictEqual(body.data.count, 3);

  await stopServer(server);
});

test("GET /api/v1/friends/count/:id - should return 400 for invalid status parameter", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          or: () => ({
            eq: () => Promise.resolve({ count: 0, error: null }),
          }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/count/${mockUserId}?status=5`,
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
  assert.strictEqual(body.error, STRINGS.FRIENDS.INVALID_STATUS);

  await stopServer(server);
});

test("GET /api/v1/friends/count/:id - should handle Supabase error during count", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          or: () =>
            Promise.resolve({
              count: null,
              error: { message: "Database error" },
            }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/count/${mockUserId}`,
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

test("POST /api/v1/friends/request - should return 400 when from_user is missing", async () => {
  const { server, url } = await startServer();

  const response = await fetch(`${url}${STRINGS.API.FRIENDS_ROUTE}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MOCK_API_KEY,
    },
    body: JSON.stringify({
      to_user: "987fcdeb-51a2-43f7-8d9e-123456789abc",
    }),
  });

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, STRINGS.FRIENDS.MISSING_USERS);

  await stopServer(server);
});

test("POST /api/v1/friends/request - should return 400 when to_user is missing", async () => {
  const { server, url } = await startServer();

  const response = await fetch(`${url}${STRINGS.API.FRIENDS_ROUTE}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MOCK_API_KEY,
    },
    body: JSON.stringify({
      from_user: "123e4567-e89b-12d3-a456-426614174000",
    }),
  });

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, STRINGS.FRIENDS.MISSING_USERS);

  await stopServer(server);
});

test("POST /api/v1/friends/request - should return 400 when user tries to friend themselves", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const { server, url } = await startServer();

  const response = await fetch(`${url}${STRINGS.API.FRIENDS_ROUTE}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MOCK_API_KEY,
    },
    body: JSON.stringify({
      from_user: mockUserId,
      to_user: mockUserId,
    }),
  });

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, STRINGS.FRIENDS.CANNOT_FRIEND_SELF);

  await stopServer(server);
});

test("PATCH /api/v1/friends/status - should return 400 when from_user is missing", async () => {
  const { server, url } = await startServer();

  const response = await fetch(`${url}${STRINGS.API.FRIENDS_ROUTE}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MOCK_API_KEY,
    },
    body: JSON.stringify({
      to_user: "987fcdeb-51a2-43f7-8d9e-123456789abc",
      status: 2,
    }),
  });

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, STRINGS.FRIENDS.MISSING_FIELDS);

  await stopServer(server);
});

test("PATCH /api/v1/friends/status - should return 400 for invalid status value", async () => {
  const { server, url } = await startServer();

  const response = await fetch(`${url}${STRINGS.API.FRIENDS_ROUTE}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MOCK_API_KEY,
    },
    body: JSON.stringify({
      from_user: "123e4567-e89b-12d3-a456-426614174000",
      to_user: "987fcdeb-51a2-43f7-8d9e-123456789abc",
      status: 1,
    }),
  });

  const body = await response.json();

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.error, STRINGS.FRIENDS.INVALID_STATUS_UPDATE);

  await stopServer(server);
});

test("GET /api/v1/friends/pending/:id - should return pending friend requests for a user", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
  const mockPendingRequests = [
    {
      id: "req-1",
      from_user: "user-1",
      to_user: mockUserId,
      status: 1,
      updated_at: "2025-11-23T00:00:00Z",
    },
    {
      id: "req-2",
      from_user: "user-2",
      to_user: mockUserId,
      status: 1,
      updated_at: "2025-11-23T01:00:00Z",
    },
  ];

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          eq: (field, value) => {
            if (field === "to_user" && value === mockUserId) {
              return {
                eq: (field2, value2) => {
                  if (field2 === "status" && value2 === 1) {
                    return Promise.resolve({
                      data: mockPendingRequests,
                      error: null,
                    });
                  }
                  return Promise.resolve({ data: [], error: null });
                },
              };
            }
            return {
              eq: () => Promise.resolve({ data: [], error: null }),
            };
          },
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/pending/${mockUserId}`,
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
  assert.strictEqual(body.message, STRINGS.FRIENDS.PENDING_REQUESTS_SUCCESS);
  assert.strictEqual(body.data.user_id, mockUserId);
  assert.strictEqual(body.data.pending_requests.length, 2);
  assert.strictEqual(body.data.pending_requests[0].from_user, "user-1");
  assert.strictEqual(body.data.pending_requests[1].from_user, "user-2");

  await stopServer(server);
});

test("GET /api/v1/friends/pending/:id - should return empty array when no pending requests", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/pending/${mockUserId}`,
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
  assert.strictEqual(body.data.pending_requests.length, 0);

  await stopServer(server);
});

test("GET /api/v1/friends/pending/:id - should handle Supabase error", async () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  supabase.from = (table) => {
    if (table === "friends") {
      return {
        select: () => ({
          eq: () => ({
            eq: () =>
              Promise.resolve({
                data: null,
                error: { message: "Database connection error" },
              }),
          }),
        }),
      };
    }
    return originalFrom(table);
  };

  const { server, url } = await startServer();

  const response = await fetch(
    `${url}${STRINGS.API.FRIENDS_ROUTE}/pending/${mockUserId}`,
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
  assert.strictEqual(body.error, "Database connection error");

  await stopServer(server);
});
