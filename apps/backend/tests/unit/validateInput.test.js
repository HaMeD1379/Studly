/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/validateInput.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the signup validation middleware, ensuring that various
 *  invalid payloads short-circuit the request with appropriate error messages.
 *
 *  Features
 *  --------
 *  • Covers missing fields, invalid email, and weak password scenarios.
 *  • Confirms the happy path invokes `next()` without error.
 *  • Utilizes STRINGS constants for consistent assertions.
 *
 *  Design Principles
 *  -----------------
 *  • Keep middleware pure and easily testable with simple mocks.
 *  • Ensure each validation branch is exercised for regression safety.
 *
 *  TODOs
 *  -----
 *  • [EXTENSIBILITY] Add tests for future validators (login, password reset, etc.).
 *
 *  @module tests/unit/validateInput
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { jest } from '@jest/globals';
import { validateSignup } from '../../src/middleware/validateInput.js';
import STRINGS from '../../src/config/strings.js';

describe(STRINGS.TEST.VALIDATE_SIGNUP, () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.spyOn(console, STRINGS.GENERAL.ERROR).mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it(STRINGS.TEST.VALIDATE_MISSING_FIELDS, () => {
    req.body = {
      email: STRINGS.MOCK.MOCK_EMPTY_STRING,
      password: STRINGS.MOCK.MOCK_EMPTY_STRING,
      full_name: STRINGS.MOCK.MOCK_EMPTY_STRING,
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: STRINGS.VALIDATION.MISSING_REQUIRED_FIELDS,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it(STRINGS.TEST.VALIDATE_INVALID_EMAIL, () => {
    req.body = {
      email: STRINGS.MOCK.MOCK_INVALID_EMAIL,
      password: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
      full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: STRINGS.VALIDATION.INVALID_EMAIL_FORMAT,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it(STRINGS.TEST.VALIDATE_SHORT_PASSWORD, () => {
    req.body = {
      email: STRINGS.MOCK.MOCK_VALID_EMAIL,
      password: STRINGS.MOCK.MOCK_INVALID_PASSWORD,
      full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
    };

    validateSignup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: STRINGS.VALIDATION.PASSWORD_CHAR_REQUIREMENTS,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it(STRINGS.TEST.VALIDATE_SUCCESS, () => {
    req.body = {
      email: STRINGS.MOCK.MOCK_VALID_EMAIL,
      password: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
      full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
    };

    validateSignup(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
