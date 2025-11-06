/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/authController.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  End-to-end coverage for the authentication router using the native node:test
 *  runner. The suite spins up the Express application, overrides Supabase client
 *  methods with deterministic mocks, and performs HTTP requests via fetch.
 *
 *  Features
 *  --------
 *  • Covers signup, login, logout, forgot password, and reset password flows.
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
 *  • [COVERAGE] Add integration tests for authenticated session routes.
 *
 *  @module tests/integration/authController
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import STRINGS from "../../src/config/strings.config.js";
import supabase from "../../src/config/supabase.client.js";

process.env.NODE_ENV = "test";
const { default: app } = await import("../../src/index.js");

const originalAuth = { ...supabase.auth };

const baseMocks = () => ({
  async signUp({ email, password, options }) {
    if (!email || !password) {
      return {
        data: null,
        error: { message: STRINGS.VALIDATION.MISSING_EMAIL_OR_PASSWORD },
      };
    }

    return {
      data: {
        session: {
          access_token: STRINGS.MOCK.MOCK_TOKEN,
          refresh_token: STRINGS.MOCK.MOCK_REFRESH,
        },
        user: {
          id: STRINGS.MOCK.MOCK_ID,
          email,
          user_metadata: {
            full_name: options?.data?.full_name ?? null,
          },
        },
      },
      error: null,
    };
  },
  async signInWithPassword({ email }) {
    return {
      data: {
        session: {
          access_token: STRINGS.MOCK.MOCK_TOKEN,
          refresh_token: STRINGS.MOCK.MOCK_REFRESH,
        },
        user: {
          id: STRINGS.MOCK.MOCK_ID,
          email,
          user_metadata: { full_name: STRINGS.MOCK.MOCK_FULL_NAME },
        },
      },
      error: null,
    };
  },
  async signOut() {
    return { error: null };
  },
  async resetPasswordForEmail(email) {
    if (!email) {
      return {
        data: null,
        error: { message: STRINGS.VALIDATION.MISSING_EMAIL },
      };
    }

    return { data: { email }, error: null };
  },
  async updateUser({ password }) {
    if (!password) {
      return {
        data: null,
        error: { message: STRINGS.VALIDATION.MISSING_PASSWORD },
      };
    }

    return {
      data: { user: { id: STRINGS.MOCK.MOCK_ID, passwordChanged: true } },
      error: null,
    };
  },
});

const restoreAuth = () => Object.assign(supabase.auth, originalAuth);

beforeEach(() => {
  Object.assign(supabase.auth, baseMocks());
});

afterEach(() => {
  restoreAuth();
});

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });

const stopServer = (server) =>
  new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });

const request = async (method, path, body) => {
  const { server, url } = await startServer();

  try {
    const response = await fetch(`${url}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = undefined;
    }

    return { status: response.status, body: parsed };
  } finally {
    await stopServer(server);
  }
};

const override = (method, impl) => {
  supabase.auth[method] = impl;
};

test(STRINGS.TEST.SIGNUP_SUCCESS, async () => {
  const response = await request("POST", STRINGS.API.SIGNUP_AUTH, {
    email: STRINGS.MOCK.MOCK_NEW_EMAIL,
    password: STRINGS.MOCK.MOCK_NEW_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.user.email, STRINGS.MOCK.MOCK_NEW_EMAIL);
  assert.ok(response.body.data.session, "session should be present");
  assert.ok(
    response.body.data.session.access_token,
    "access_token should be present"
  );
});

test(STRINGS.TEST.MISSING_INPUT, async () => {
  const response = await request("POST", STRINGS.API.SIGNUP_AUTH, {
    email: STRINGS.MOCK.MOCK_EMPTY_STRING,
    password: STRINGS.MOCK.MOCK_EMPTY_STRING,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.MISSING_REQUIRED_FIELDS);
});

test(STRINGS.TEST.USER_EXISTS, async () => {
  override("signUp", async () => ({
    data: null,
    error: { message: STRINGS.AUTH.USER_ALREADY_REGISTERED },
  }));

  const response = await request("POST", STRINGS.API.SIGNUP_AUTH, {
    email: STRINGS.MOCK.MOCK_EXISTING_USER_EMAIL,
    password: STRINGS.MOCK.MOCK_EXISTING_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_EXISTING_FULL_NAME,
  });

  assert.equal(response.status, 409);
  assert.equal(response.body.error, STRINGS.AUTH.USER_ALREADY_REGISTERED);
});

test(STRINGS.TEST.OTHER_SUPABASE_SIGNUP_ERRORS, async () => {
  override("signUp", async () => ({
    data: null,
    error: { message: STRINGS.VALIDATION.INVALID_EMAIL_FORMAT },
  }));

  const response = await request("POST", STRINGS.API.SIGNUP_AUTH, {
    email: STRINGS.MOCK.MOCK_TEST_INVALID_EMAIL,
    password: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.INVALID_EMAIL_FORMAT);
});

test(STRINGS.TEST.UNEXPECT_SIGNUP_ERROR, async () => {
  override("signUp", async () => {
    throw new Error(STRINGS.GENERAL.NETWORK_CRASH);
  });

  const response = await request("POST", STRINGS.API.SIGNUP_AUTH, {
    email: STRINGS.MOCK.MOCK_FAIL_EMAIL,
    password: STRINGS.MOCK.MOCK_USER_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_FIAL_FULL_NAME,
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});

test(STRINGS.TEST.LOGIN_VALID_CREDENTIALS, async () => {
  const response = await request("POST", STRINGS.API.LOGIN_AUTH, {
    email: STRINGS.MOCK.MOCK_USER_EMAIL,
    password: STRINGS.MOCK.MOCK_NEW_PASSWORD,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.data.user.full_name, STRINGS.MOCK.MOCK_FULL_NAME);
});

test(STRINGS.TEST.LOGIN_INVALID_CREDENTIALS, async () => {
  override("signInWithPassword", async () => ({
    data: null,
    error: { message: STRINGS.VALIDATION.INVALID_LOGIN_CREDENTIALS },
  }));

  const response = await request("POST", STRINGS.API.LOGIN_AUTH, {
    email: STRINGS.MOCK.MOCK_WRONG_USER_EMAIL,
    password: STRINGS.MOCK.MOCK_BAD_PASSWORD,
  });

  assert.equal(response.status, 401);
  assert.equal(
    response.body.error,
    STRINGS.VALIDATION.INVALID_LOGIN_CREDENTIALS
  );
});

test(STRINGS.TEST.UNEXPECTED_LOGIN_ERROR, async () => {
  override("signInWithPassword", async () => {
    throw new Error(STRINGS.GENERAL.AUTH_SERVICE_CRASH);
  });

  const response = await request("POST", STRINGS.API.LOGIN_AUTH, {
    email: STRINGS.MOCK.MOCK_X_EMAIL,
    password: STRINGS.MOCK.MOCK_X_PASS,
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});

test(STRINGS.TEST.LOGOUT_SUCCESS, async () => {
  const response = await request("POST", STRINGS.API.LOGOUT_AUTH);

  assert.equal(response.status, 200);
  assert.equal(response.body.message, STRINGS.AUTH.LOGOUT_SUCCESS);
});

test(STRINGS.TEST.LOGOUT_SUPABASE_ERROR, async () => {
  override("signOut", async () => ({
    error: { message: STRINGS.AUTH.FAILED_TO_LOGOUT },
  }));

  const response = await request("POST", STRINGS.API.LOGOUT_AUTH);

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.AUTH.FAILED_TO_LOGOUT);
});

test(STRINGS.TEST.UNEXPECTED_LOGOUT_ERROR, async () => {
  override("signOut", async () => {
    throw new Error(STRINGS.GENERAL.SERVER_EXPLOSION);
  });

  const response = await request("POST", STRINGS.API.LOGOUT_AUTH);

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});

test(STRINGS.TEST.FORGOT_PASSWORD_SUCCESS, async () => {
  const response = await request("POST", STRINGS.API.FORGOT_PASSWORD_AUTH, {
    email: STRINGS.MOCK.MOCK_USER_FORGET_EMAIL,
  });

  assert.equal(response.status, 200);
  assert.equal(
    response.body.message,
    STRINGS.AUTH.PASSWORD_RESET_EMAIL_SUCCESS
  );
});

test(STRINGS.TEST.FORGOT_PASSWORD_MISSING_EMAIL, async () => {
  const response = await request("POST", STRINGS.API.FORGOT_PASSWORD_AUTH, {});

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.MISSING_EMAIL);
});

test(STRINGS.TEST.UNEXPECTED_FORGOT_PASSWORD_ERROR, async () => {
  override("resetPasswordForEmail", async () => {
    throw new Error(STRINGS.GENERAL.API_CRASH);
  });

  const response = await request("POST", STRINGS.API.FORGOT_PASSWORD_AUTH, {
    email: STRINGS.MOCK.MOCK_USER_FORGET_EMAIL,
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});

test(STRINGS.TEST.RESET_PASSWORD_SUCCESS, async () => {
  const response = await request(
    "POST",
    `${STRINGS.API.RESET_PASSWORD_AUTH}?token=${STRINGS.MOCK.MOCK_TOKEN}`,
    { newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD }
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.message, STRINGS.AUTH.PASSWORD_RESET_SUCCESS);
  assert.equal(response.body.data.user.passwordChanged, true);
});

test(STRINGS.TEST.RESET_PASSWORD_TOCKEN_MISSING, async () => {
  const response = await request("POST", STRINGS.API.RESET_PASSWORD_AUTH, {
    newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
  });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    STRINGS.VALIDATION.MISSING_RESET_PASSWORD_TOKEN
  );
});

test(STRINGS.TEST.RESET_PASSWORD_MISSING_PASSWORD, async () => {
  const response = await request(
    "POST",
    `${STRINGS.API.RESET_PASSWORD_AUTH}?token=${STRINGS.MOCK.MOCK_TOKEN}`,
    {}
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.VALIDATION.MISSING_PASSWORD);
});

test(STRINGS.TEST.RESET_PASSWORD_SUPABASE_ERROR, async () => {
  override("updateUser", async () => ({
    data: null,
    error: { message: STRINGS.GENERAL.INVALID_TOKEN_ERROR },
  }));

  const response = await request(
    "POST",
    `${STRINGS.API.RESET_PASSWORD_AUTH}?token=${STRINGS.MOCK.MOCK_TOKEN}`,
    { newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD }
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.error, STRINGS.GENERAL.INVALID_TOKEN_ERROR);
});

test(STRINGS.TEST.UNEXPECTED_RESET_PASSWORD_ERROR, async () => {
  override("updateUser", async () => {
    throw new Error(STRINGS.GENERAL.INTERNAL_FAIL);
  });

  const response = await request(
    "POST",
    `${STRINGS.API.RESET_PASSWORD_AUTH}?token=${STRINGS.MOCK.MOCK_TOKEN}`,
    { newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD }
  );

  assert.equal(response.status, 500);
  assert.equal(response.body.error, STRINGS.SERVER.INTERNAL_ERROR);
});
