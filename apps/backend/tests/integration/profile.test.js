/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/profile.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-01
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  End-to-end coverage for the profile router using the native node:test
 *  runner. The suite spins up the Express application, overrides Supabase client
 *  methods with deterministic mocks, and performs HTTP requests via fetch.
 *
 *  Features
 *  --------
 *  • Covers profile update flow with full_name and bio updates.
 *  • Exercises success paths, validation failures, and Supabase error branches.
 *  • Runs without third-party test libraries to keep the toolchain lightweight.
 *
 *  Design Principles
 *  -----------------
 *  • Mutate the shared Supabase client in-place and restore after each test.
 *  • Start a fresh HTTP server per test for isolation.
 *  • Use descriptive string constants pulled from STRINGS for stability.
 *
 *  TODOs
 *  -----
 *  • [MOCKING] Extract Supabase mock management into reusable helpers.
 *  • [COVERAGE] Add integration tests for profile photo upload when implemented.
 *
 *  @module tests/integration/profile
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import STRINGS from "../../src/config/strings.config.js";
import supabase from "../../src/config/supabase.client.js";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../src/index.js");

const originalFrom = supabase.from;

const baseFromMock = (tableName) => {
  if (tableName === "user_profile") {
    const state = { userId: null, updateData: null, operation: null };
    const mockObject = {
      update(data) {
        state.updateData = data;
        state.operation = "update";
        return mockObject;
      },
      eq(field, value) {
        if (field === "user_id") {
          state.userId = value;
        }
        return mockObject;
      },
      select() {
        state.operation = "select";
        // Return data after update
        if (state.operation === "select" && state.updateData) {
          const resultData = {
            email: STRINGS.MOCK.MOCK_USER_EMAIL,
            full_name:
              state.updateData.full_name ?? STRINGS.MOCK.MOCK_FULL_NAME,
            bio: state.updateData.bio ?? STRINGS.MOCK.MOCK_BIO,
          };

          return Promise.resolve({
            data:
              state.userId === STRINGS.MOCK.MOCK_FAIL_EMAIL ? [] : [resultData],
            error:
              state.userId === STRINGS.MOCK.MOCK_FAIL_EMAIL
                ? { message: "Database error" }
                : null,
          });
        }
        return mockObject;
      },
      single() {
        // Throw error for "throw-error" user to test catch block
        if (state.userId === "throw-error") {
          throw new Error("Unexpected database error");
        }
        // For testing: if user_id is "not-found", simulate not found
        if (state.userId === "not-found") {
          return Promise.resolve({
            data: null,
            error: { code: "PGRST116", message: "No rows found" },
          });
        }
        // For testing: if user_id is MOCK_FAIL_EMAIL, simulate error
        if (state.userId === STRINGS.MOCK.MOCK_FAIL_EMAIL) {
          return Promise.resolve({
            data: null,
            error: { code: "OTHER_ERROR", message: "Database error" },
          });
        }
        // For testing: if user_id is "null-bio", simulate profile with null bio
        if (state.userId === "null-bio") {
          return Promise.resolve({
            data: {
              email: STRINGS.MOCK.MOCK_USER_EMAIL,
              full_name: STRINGS.MOCK.MOCK_FULL_NAME,
              bio: null,
            },
            error: null,
          });
        }
        // Default success case
        return Promise.resolve({
          data: {
            email: STRINGS.MOCK.MOCK_USER_EMAIL,
            full_name: STRINGS.MOCK.MOCK_FULL_NAME,
            bio: STRINGS.MOCK.MOCK_BIO,
          },
          error: null,
        });
      },
    };
    return mockObject;
  }
  return originalFrom(tableName);
};

beforeEach(() => {
  supabase.from = baseFromMock;
});

afterEach(() => {
  supabase.from = originalFrom;
});

const request = async (method, path, body = null, customHeaders = {}) => {
  const port = Math.floor(Math.random() * (65535 - 3001) + 3001);
  const server = app.listen(port);

  try {
    const url = `http://localhost:${port}${path}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.INTERNAL_API_TOKEN || "test-token",
        ...customHeaders,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();
    const parsedBody = text ? JSON.parse(text) : {};

    return {
      status: response.status,
      body: parsedBody,
    };
  } finally {
    server.close();
  }
};

test(STRINGS.TEST.PROFILE_UPDATE_SUCCESS, async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    user_id: STRINGS.MOCK.MOCK_ID,
    full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
    bio: STRINGS.MOCK.MOCK_UPDATED_BIO,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.message, STRINGS.PROFILE.UPDATE_SUCCESS);
  assert.equal(response.body.data.user_id, STRINGS.MOCK.MOCK_ID);
  assert.equal(response.body.data.email, STRINGS.MOCK.MOCK_USER_EMAIL);
  assert.equal(
    response.body.data.full_name,
    STRINGS.MOCK.MOCK_UPDATED_FULL_NAME
  );
  assert.equal(response.body.data.bio, STRINGS.MOCK.MOCK_UPDATED_BIO);
});

test(STRINGS.TEST.PROFILE_UPDATE_MISSING_USER_ID, async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.MISSING_USER_ID);
});

test(STRINGS.TEST.PROFILE_UPDATE_INVALID_BIO, async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    user_id: STRINGS.MOCK.MOCK_ID,
    bio: STRINGS.MOCK.MOCK_LONG_BIO,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.INVALID_BIO_LENGTH);
});

test(STRINGS.TEST.PROFILE_UPDATE_FULL_NAME_ONLY, async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    user_id: STRINGS.MOCK.MOCK_ID,
    full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.body.data.full_name,
    STRINGS.MOCK.MOCK_UPDATED_FULL_NAME
  );
  assert.equal(response.body.data.email, STRINGS.MOCK.MOCK_USER_EMAIL);
});

test(STRINGS.TEST.PROFILE_UPDATE_BIO_ONLY, async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    user_id: STRINGS.MOCK.MOCK_ID,
    bio: STRINGS.MOCK.MOCK_UPDATED_BIO,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.bio, STRINGS.MOCK.MOCK_UPDATED_BIO);
  assert.equal(response.body.data.email, STRINGS.MOCK.MOCK_USER_EMAIL);
});

test(STRINGS.TEST.PROFILE_UPDATE_SUPABASE_ERROR, async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    user_id: STRINGS.MOCK.MOCK_FAIL_EMAIL,
    full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Database error");
});

test("should handle Supabase bio update error", async () => {
  const response = await request("PATCH", STRINGS.API.PROFILE_UPDATE, {
    user_id: STRINGS.MOCK.MOCK_FAIL_EMAIL,
    bio: STRINGS.MOCK.MOCK_UPDATED_BIO,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Database error");
});

// GET /api/v1/profile/:id tests
test(STRINGS.TEST.PROFILE_GET_SUCCESS, async () => {
  const response = await request(
    "GET",
    `${STRINGS.API.PROFILE_DATA}/${STRINGS.MOCK.MOCK_ID}`
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.message, STRINGS.PROFILE.GET_SUCCESS);
  assert.equal(response.body.data.user_id, STRINGS.MOCK.MOCK_ID);
  assert.equal(response.body.data.email, STRINGS.MOCK.MOCK_USER_EMAIL);
  assert.equal(response.body.data.full_name, STRINGS.MOCK.MOCK_FULL_NAME);
  assert.equal(response.body.data.bio, STRINGS.MOCK.MOCK_BIO);
});

test(STRINGS.TEST.PROFILE_GET_NOT_FOUND, async () => {
  const response = await request(
    "GET",
    `${STRINGS.API.PROFILE_DATA}/not-found`
  );

  assert.equal(response.status, 404);
  assert.equal(response.body.error, STRINGS.PROFILE.USER_NOT_FOUND);
});

test(STRINGS.TEST.PROFILE_GET_SUPABASE_ERROR, async () => {
  const response = await request(
    "GET",
    `${STRINGS.API.PROFILE_DATA}/${STRINGS.MOCK.MOCK_FAIL_EMAIL}`
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Database error");
});

test("should handle unexpected retrieval error", async () => {
  const response = await request(
    "GET",
    `${STRINGS.API.PROFILE_DATA}/throw-error`
  );

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});

test("should return empty string bio when bio is not set", async () => {
  const response = await request("GET", `${STRINGS.API.PROFILE_DATA}/null-bio`);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, STRINGS.PROFILE.GET_SUCCESS);
  assert.equal(response.body.data.user_id, "null-bio");
  assert.equal(response.body.data.email, STRINGS.MOCK.MOCK_USER_EMAIL);
  assert.equal(response.body.data.full_name, STRINGS.MOCK.MOCK_FULL_NAME);
  assert.equal(response.body.data.bio, "");
});

// Search endpoint tests
test("GET /api/v1/profile/search - should return 400 when search string is missing", async () => {
  const response = await request("GET", "/api/v1/profile/search");

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Search string is required");
});

test("GET /api/v1/profile/search - should return 400 when search string is empty", async () => {
  const response = await request("GET", "/api/v1/profile/search?str=");

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Search string is required");
});

test("GET /api/v1/profile/search - should return matching profiles", async () => {
  // Override mock for search functionality
  const originalMock = supabase.from;
  supabase.from = (tableName) => {
    if (tableName === "user_profile") {
      return {
        select: () => ({
          or: () =>
            Promise.resolve({
              data: [
                {
                  user_id: "user-1",
                  email: "john@example.com",
                  full_name: "John Doe",
                  bio: "Test bio",
                },
              ],
              error: null,
            }),
        }),
      };
    }
    return originalMock(tableName);
  };

  const response = await request("GET", "/api/v1/profile/search?str=john");

  assert.equal(response.status, 200);
  assert.equal(response.body.message, "Profiles found successfully");
  assert.equal(response.body.data.count, 1);
  assert.equal(response.body.data.results[0].email, "john@example.com");

  supabase.from = originalMock;
});

test("GET /api/v1/profile/search - should return empty array when no matches found", async () => {
  const originalMock = supabase.from;
  supabase.from = (tableName) => {
    if (tableName === "user_profile") {
      return {
        select: () => ({
          or: () =>
            Promise.resolve({
              data: [],
              error: null,
            }),
        }),
      };
    }
    return originalMock(tableName);
  };

  const response = await request(
    "GET",
    "/api/v1/profile/search?str=nonexistent"
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.data.count, 0);
  assert.deepEqual(response.body.data.results, []);

  supabase.from = originalMock;
});

test("GET /api/v1/profile/search - should handle Supabase errors", async () => {
  const originalMock = supabase.from;
  supabase.from = (tableName) => {
    if (tableName === "user_profile") {
      return {
        select: () => ({
          or: () =>
            Promise.resolve({
              data: null,
              error: { message: "Database search error" },
            }),
        }),
      };
    }
    return originalMock(tableName);
  };

  const response = await request("GET", "/api/v1/profile/search?str=test");

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Database search error");

  supabase.from = originalMock;
});
