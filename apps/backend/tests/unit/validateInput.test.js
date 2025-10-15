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
 *  Node.js test coverage for the signup validation middleware. Validates that
 *  malformed payloads result in early failures and that well-formed payloads
 *  progress to the next middleware in the chain.
 *
 *  Features
 *  --------
 *  • Exercises required field validation.
 *  • Confirms email format and password length policies.
 *  • Ensures next() executes when the payload is correct.
 *
 *  Design Principles
 *  -----------------
 *  • Use native node:test runner to avoid external dependencies.
 *  • Keep expectations explicit with strict equality checks.
 *
 *  TODOs
 *  -----
 *  • [VALIDATION] Extend middleware with configurable password strength rules.
 *
 *  @module tests/unit/validateInput
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { validateSignup } from '../../src/middleware/validateInput.js';
import STRINGS from '../../src/config/strings.js';

const createMockContext = () => {
  const resPayloads = [];
  const resStatuses = [];
  return {
    req: { body: {} },
    res: {
      status(code) {
        resStatuses.push(code);
        return this;
      },
      json(payload) {
        resPayloads.push(payload);
        return payload;
      },
    },
    nextCalls: [],
    get outputs() {
      return { resPayloads, resStatuses, nextCalls: this.nextCalls };
    },
    next(arg) {
      this.nextCalls.push(arg ?? 'called');
    },
  };
};

test(STRINGS.TEST.VALIDATE_MISSING_FIELDS, () => {
  const ctx = createMockContext();
  ctx.req.body = {
    email: STRINGS.MOCK.MOCK_EMPTY_STRING,
    password: STRINGS.MOCK.MOCK_EMPTY_STRING,
    full_name: STRINGS.MOCK.MOCK_EMPTY_STRING,
  };

  validateSignup(ctx.req, ctx.res, ctx.next.bind(ctx));

  const { resPayloads, resStatuses, nextCalls } = ctx.outputs;
  assert.deepStrictEqual(resStatuses, [400]);
  assert.deepStrictEqual(resPayloads, [
    { error: STRINGS.VALIDATION.MISSING_REQUIRED_FIELDS },
  ]);
  assert.equal(nextCalls.length, 0);
});

test(STRINGS.TEST.VALIDATE_INVALID_EMAIL, () => {
  const ctx = createMockContext();
  ctx.req.body = {
    email: STRINGS.MOCK.MOCK_INVALID_EMAIL,
    password: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
  };

  validateSignup(ctx.req, ctx.res, ctx.next.bind(ctx));

  const { resPayloads, resStatuses, nextCalls } = ctx.outputs;
  assert.deepStrictEqual(resStatuses, [400]);
  assert.deepStrictEqual(resPayloads, [
    { error: STRINGS.VALIDATION.INVALID_EMAIL_FORMAT },
  ]);
  assert.equal(nextCalls.length, 0);
});

test(STRINGS.TEST.VALIDATE_SHORT_PASSWORD, () => {
  const ctx = createMockContext();
  ctx.req.body = {
    email: STRINGS.MOCK.MOCK_VALID_EMAIL,
    password: STRINGS.MOCK.MOCK_INVALID_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
  };

  validateSignup(ctx.req, ctx.res, ctx.next.bind(ctx));

  const { resPayloads, resStatuses, nextCalls } = ctx.outputs;
  assert.deepStrictEqual(resStatuses, [400]);
  assert.deepStrictEqual(resPayloads, [
    { error: STRINGS.VALIDATION.PASSWORD_CHAR_REQUIREMENTS },
  ]);
  assert.equal(nextCalls.length, 0);
});

test(STRINGS.TEST.VALIDATE_SUCCESS, () => {
  const ctx = createMockContext();
  ctx.req.body = {
    email: STRINGS.MOCK.MOCK_VALID_EMAIL,
    password: STRINGS.MOCK.MOCK_NEW_STRONG_PASSWORD,
    full_name: STRINGS.MOCK.MOCK_NEW_USER_FULL_NAME,
  };

  validateSignup(ctx.req, ctx.res, ctx.next.bind(ctx));

  const { resStatuses, resPayloads, nextCalls } = ctx.outputs;
  assert.equal(resStatuses.length, 0);
  assert.equal(resPayloads.length, 0);
  assert.deepStrictEqual(nextCalls, ['called']);
});
