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
import * as profileController from "../../src/controllers/profile.controller.js";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../src/index.js");

const originalAuth = { ...supabase.auth };
const originalFrom = supabase.from;

// Mock state for createSupabaseClient
let shouldFailAuth = false;
let shouldThrowError = false;

const baseMocks = () => ({
  admin: {
    async updateUserById(userId, updates) {
      if (userId === STRINGS.MOCK.MOCK_FAIL_EMAIL) {
        return {
          data: null,
          error: { message: STRINGS.PROFILE.USER_NOT_FOUND },
        };
      }
      return { data: { user: { id: userId, ...updates } }, error: null };
    },
  },
});

const baseFromMock = (tableName) => {
  if (tableName === "user_profile") {
    return {
      upsert(data) {
        if (data.user_id === STRINGS.MOCK.MOCK_FAIL_EMAIL) {
          return {
            data: null,
            error: { message: "Database error" },
          };
        }
        return { data, error: null };
      },
    };
  }
  return originalFrom(tableName);
};

// Mock factory for createSupabaseClient
const mockCreateSupabaseClient = () => {
  if (shouldThrowError) {
    throw new Error("Unexpected error");
  }
  return {
    auth: {
      async setSession() {
        return { data: {}, error: null };
      },
      async updateUser(updates) {
        if (shouldFailAuth) {
          return {
            data: null,
            error: { message: STRINGS.PROFILE.USER_NOT_FOUND },
          };
        }
        return { data: { user: updates }, error: null };
      },
    },
  };
};

beforeEach(() => {
  Object.assign(supabase.auth, baseMocks());
  supabase.from = baseFromMock;
  profileController.setCreateSupabaseClient(mockCreateSupabaseClient);
  // Reset mock flags
  shouldFailAuth = false;
  shouldThrowError = false;
});

afterEach(() => {
  Object.assign(supabase.auth, originalAuth);
  supabase.from = originalFrom;
  // Reset mock flags
  shouldFailAuth = false;
  shouldThrowError = false;
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

const override = (method, impl) => {
  supabase.auth[method] = impl;
};

const overrideFrom = (impl) => {
  supabase.from = impl;
};

test(STRINGS.TEST.PROFILE_UPDATE_SUCCESS, async () => {
  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_ID,
      full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
      bio: STRINGS.MOCK.MOCK_UPDATED_BIO,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.message, STRINGS.PROFILE.UPDATE_SUCCESS);
  assert.equal(response.body.data.user_id, STRINGS.MOCK.MOCK_ID);
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
  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_ID,
      bio: STRINGS.MOCK.MOCK_LONG_BIO,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.INVALID_BIO_LENGTH);
});

test(STRINGS.TEST.PROFILE_UPDATE_FULL_NAME_ONLY, async () => {
  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_ID,
      full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.body.data.full_name,
    STRINGS.MOCK.MOCK_UPDATED_FULL_NAME
  );
  assert.equal(response.body.data.bio, undefined);
});

test(STRINGS.TEST.PROFILE_UPDATE_BIO_ONLY, async () => {
  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_ID,
      bio: STRINGS.MOCK.MOCK_UPDATED_BIO,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.data.bio, STRINGS.MOCK.MOCK_UPDATED_BIO);
  assert.equal(response.body.data.full_name, undefined);
});

test(STRINGS.TEST.PROFILE_UPDATE_SUPABASE_ERROR, async () => {
  // Set flag to make auth update fail
  shouldFailAuth = true;

  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_FAIL_EMAIL,
      full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.PROFILE.USER_NOT_FOUND);
});

test("should handle Supabase bio update error", async () => {
  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_FAIL_EMAIL,
      bio: STRINGS.MOCK.MOCK_UPDATED_BIO,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Database error");
});

test(STRINGS.TEST.PROFILE_UPDATE_UNEXPECTED_ERROR, async () => {
  // Set flag to throw unexpected error
  shouldThrowError = true;

  const response = await request(
    "PATCH",
    STRINGS.API.PROFILE_UPDATE,
    {
      user_id: STRINGS.MOCK.MOCK_ID,
      full_name: STRINGS.MOCK.MOCK_UPDATED_FULL_NAME,
      refresh_token: "mock_refresh_token",
    },
    {
      authorization: "Bearer mock_access_token",
    }
  );

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});
