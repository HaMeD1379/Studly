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
 *  Integration tests for the authentication router. Supabase client calls are
 *  mocked to emulate various success and failure scenarios while exercising the
 *  Express app end-to-end via supertest.
 *
 *  Features
 *  --------
 *  • Covers signup, login, logout, forgot password, and reset password flows.
 *  • Utilizes jest.unstable_mockModule for ESM-compatible mocking.
 *  • Ensures HTTP status codes and response payloads align with STRINGS.
 *
 *  Design Principles
 *  -----------------
 *  • Keep tests hermetic by avoiding real network calls.
 *  • Reuse centralized STRINGS to minimize brittle literals.
 *  • Reset mocks between scenarios to avoid state bleed.
 *
 *  TODOs
 *  -----
 *  • [COVERAGE] Add multi-factor authentication scenarios when implemented.
 *  • [SECURITY] Exercise token validation edge cases once middleware exists.
 *
 *  @module tests/integration/authController
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import STRINGS from '../../src/config/strings.js';

await jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  __esModule: true,
  default: {
    auth: {
      signUp: jest.fn(async ({ email, password, options }) => {
        if (!email || !password) {
          return {
            data: null,
            error: {
              message: STRINGS.VALIDATION.MISSING_EMAIL_OR_PASSWORD,
            },
          };
        }
        if (email === STRINGS.MOCK.MOCK_EXISTING_USER_EMAIL) {
          return {
            data: null,
            error: {
              message: STRINGS.AUTH.USER_ALREADY_REGISTERED,
            },
          };
        }
        return {
          data: {
            user: {
              id: STRINGS.MOCK.MOCK_ID,
              email,
              user_metadata: options?.data,
            },
          },
          error: null,
        };
      }),
      signInWithPassword: jest.fn(async ({ email }) => {
        if (email === STRINGS.MOCK.MOCK_WRONG_USER_EMAIL) {
          return {
            data: null,
            error: {
              message: STRINGS.VALIDATION.INVALID_LOGIN_CREDENTIALS,
            },
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
                full_name: STRINGS.MOCK.MOCK_FULL_NAME,
              },
            },
          },
          error: null,
        };
      }),
      signOut: jest.fn(async () => ({ error: null })),
      resetPasswordForEmail: jest.fn(async (email) => {
        if (!email) {
          return {
            data: null,
            error: { message: STRINGS.VALIDATION.MISSING_EMAIL },
          };
        }
        return { data: { email }, error: null };
      }),
      updateUser: jest.fn(async ({ password }) => {
        if (!password) {
          return {
            data: null,
            error: { message: STRINGS.VALIDATION.MISSING_PASSWORD },
          };
        }
        return {
          data: {
            user: {
              id: STRINGS.MOCK.MOCK_ID,
              passwordChanged: true,
            },
          },
          error: null,
        };
      }),
    },
  },
}));

const { default: supabase } = await import('../../src/config/supabase.js');
const { default: authRoutes } = await import(
  '../../src/routes/v1/authentication.routes.js'
);

const app = express();
app.use(express.json());
app.use(STRINGS.API.AUTH_ROUTE, authRoutes);

describe(STRINGS.API.AUTH_ROUTES_LITERAL, () => {
  afterEach(() => jest.clearAllMocks());

  describe(STRINGS.API.SIGNUP_AUTH_POST, () => {
    it(STRINGS.TEST.SIGNUP_SUCCESS, async () => {
      const res = await request(app).post(STRINGS.API.SIGNUP_AUTH).send({
        email: STRINGS.MOCK.MOCK_NEW_EMAIL,
        password: STRINGS.MOCK.MOCK_NEW_PASSWORD,
        full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.email).toBe(STRINGS.MOCK.MOCK_NEW_EMAIL);
    });

    it(STRINGS.TEST.MISSING_INPUT, async () => {
      const res = await request(app).post(STRINGS.API.SIGNUP_AUTH).send({
        email: STRINGS.MOCK.MOCK_EMPTY_STRING,
        password: STRINGS.MOCK.MOCK_EMPTY_STRING,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(
        STRINGS.VALIDATION.MISSING_REQUIRED_FIELDS
      );
    });

    it(STRINGS.TEST.USER_EXISTS, async () => {
      const res = await request(app).post(STRINGS.API.SIGNUP_AUTH).send({
        email: STRINGS.MOCK.MOCK_EXISTING_USER_EMAIL,
        password: STRINGS.MOCK.MOCK_EXISTING_PASSWORD,
        full_name: STRINGS.MOCK.MOCK_EXISTING_FULL_NAME,
      });
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe(STRINGS.AUTH.USER_ALREADY_REGISTERED);
    });

    it(STRINGS.TEST.OTHER_SUPABASE_SIGNUP_ERRORS, async () => {
      jest.spyOn(supabase.auth, STRINGS.GENERAL.SIGN_UP).mockResolvedValueOnce({
        data: null,
        error: { message: STRINGS.VALIDATION.INVALID_EMAIL_FORMAT },
      });

      const res = await request(app).post(STRINGS.API.SIGNUP_AUTH).send({
        email: STRINGS.MOCK.MOCK_TEST_INVALID_EMAIL,
        password: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
        full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(STRINGS.VALIDATION.INVALID_EMAIL_FORMAT);
    });

    it(STRINGS.TEST.UNEXPECT_SIGNUP_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.SIGN_UP)
        .mockRejectedValueOnce(new Error(STRINGS.GENERAL.NETWORK_CRASH));

      const res = await request(app).post(STRINGS.API.SIGNUP_AUTH).send({
        email: STRINGS.MOCK.MOCK_FAIL_EMAIL,
        password: STRINGS.MOCK.MOCK_USER_PASSWORD,
        full_name: STRINGS.MOCK.MOCK_FIAL_FULL_NAME,
      });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toMatch(STRINGS.SERVER.INTERNAL_ERROR);
    });
  });

  describe(STRINGS.API.LOGIN_AUTH_POST, () => {
    it(STRINGS.TEST.LOGIN_VALID_CREDENTIALS, async () => {
      const res = await request(app).post(STRINGS.API.LOGIN_AUTH).send({
        email: STRINGS.MOCK.MOCK_USER_EMAIL,
        password: STRINGS.MOCK.MOCK_NEW_PASSWORD,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.full_name).toBe(STRINGS.MOCK.MOCK_FULL_NAME);
    });

    it(STRINGS.TEST.LOGIN_INVALID_CREDENTIALS, async () => {
      const res = await request(app).post(STRINGS.API.LOGIN_AUTH).send({
        email: STRINGS.MOCK.MOCK_WRONG_USER_EMAIL,
        password: STRINGS.MOCK.MOCK_BAD_PASSWORD,
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe(
        STRINGS.VALIDATION.INVALID_LOGIN_CREDENTIALS
      );
    });

    it(STRINGS.TEST.UNEXPECTED_LOGIN_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.SIGNIN_WITH_PASSWORD)
        .mockRejectedValueOnce(new Error(STRINGS.GENERAL.AUTH_SERVICE_CRASH));

      const res = await request(app).post(STRINGS.API.LOGIN_AUTH).send({
        email: STRINGS.MOCK.MOCK_X_EMAIL,
        password: STRINGS.MOCK.MOCK_X_PASS,
      });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toMatch(STRINGS.SERVER.INTERNAL_ERROR);
    });
  });

  describe(STRINGS.API.LOGOUT_AUTH_POST, () => {
    it(STRINGS.TEST.LOGOUT_SUCCESS, async () => {
      const res = await request(app).post(STRINGS.API.LOGOUT_AUTH);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(STRINGS.AUTH.LOGOUT_SUCCESS);
    });

    it(STRINGS.TEST.LOGOUT_SUPABASE_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.SIGN_OUT)
        .mockResolvedValueOnce({
          error: { message: STRINGS.AUTH.FAILED_TO_LOGOUT },
        });

      const res = await request(app).post(STRINGS.API.LOGOUT_AUTH);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(STRINGS.AUTH.FAILED_TO_LOGOUT);
    });

    it(STRINGS.TEST.UNEXPECTED_LOGOUT_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.SIGN_OUT)
        .mockRejectedValueOnce(new Error(STRINGS.GENERAL.SERVER_EXPLOSION));

      const res = await request(app).post(STRINGS.API.LOGOUT_AUTH);
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toMatch(STRINGS.SERVER.INTERNAL_ERROR);
    });
  });

  describe(STRINGS.API.FORGOT_PASSWORD_AUTH_POST, () => {
    it(STRINGS.TEST.FORGOT_PASSWORD_SUCCESS, async () => {
      const res = await request(app)
        .post(STRINGS.API.FORGOT_PASSWORD_AUTH)
        .send({ email: STRINGS.MOCK.MOCK_USER_FORGET_EMAIL });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(
        STRINGS.AUTH.PASSWORD_RESET_EMAIL_SUCCESS
      );
    });

    it(STRINGS.TEST.FORGOT_PASSWORD_MISSING_EMAIL, async () => {
      const res = await request(app)
        .post(STRINGS.API.FORGOT_PASSWORD_AUTH)
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(STRINGS.VALIDATION.MISSING_EMAIL);
    });

    it(STRINGS.TEST.UNEXPECTED_FORGOT_PASSWORD_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.RESET_PASSWORD_FOR_EMAIL)
        .mockRejectedValueOnce(new Error(STRINGS.GENERAL.API_CRASH));

      const res = await request(app)
        .post(STRINGS.API.FORGOT_PASSWORD_AUTH)
        .send({ email: STRINGS.MOCK.MOCK_USER_FORGET_EMAIL });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toMatch(STRINGS.SERVER.INTERNAL_ERROR);
    });
  });

  describe(STRINGS.API.RESET_PASSWORD_AUTH_POST, () => {
    it(STRINGS.TEST.RESET_PASSWORD_SUCCESS, async () => {
      const res = await request(app)
        .post(
          `${STRINGS.API.RESET_PASSWORD_AUTH_TOKEN}${STRINGS.MOCK.MOCK_TOKEN}`
        )
        .send({ newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe(STRINGS.AUTH.PASSWORD_RESET_SUCCESS);
      expect(res.body.data.user.passwordChanged).toBe(true);
    });

    it(STRINGS.TEST.RESET_PASSWORD_TOCKEN_MISSING, async () => {
      const res = await request(app)
        .post(STRINGS.API.RESET_PASSWORD_AUTH)
        .send({ newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(
        STRINGS.VALIDATION.MISSING_RESET_PASSWORD_TOKEN
      );
    });

    it(STRINGS.TEST.RESET_PASSWORD_MISSING_PASSWORD, async () => {
      const res = await request(app)
        .post(
          `${STRINGS.API.RESET_PASSWORD_AUTH_TOKEN}${STRINGS.MOCK.MOCK_TOKEN}`
        )
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(STRINGS.VALIDATION.MISSING_PASSWORD);
    });

    it(STRINGS.TEST.RESET_PASSWORD_SUPABASE_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.UPDATE_USER)
        .mockResolvedValueOnce({
          data: null,
          error: { message: STRINGS.GENERAL.INVALID_TOKEN_ERROR },
        });

      const res = await request(app)
        .post(
          `${STRINGS.API.RESET_PASSWORD_AUTH_TOKEN}${STRINGS.MOCK.MOCK_TOKEN}`
        )
        .send({ newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe(STRINGS.GENERAL.INVALID_TOKEN_ERROR);
    });

    it(STRINGS.TEST.UNEXPECTED_RESET_PASSWORD_ERROR, async () => {
      jest
        .spyOn(supabase.auth, STRINGS.GENERAL.UPDATE_USER)
        .mockRejectedValueOnce(new Error(STRINGS.GENERAL.INTERNAL_FAIL));

      const res = await request(app)
        .post(
          `${STRINGS.API.RESET_PASSWORD_AUTH_TOKEN}${STRINGS.MOCK.MOCK_TOKEN}`
        )
        .send({ newPassword: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toMatch(STRINGS.SERVER.INTERNAL_ERROR);
    });
  });
});
