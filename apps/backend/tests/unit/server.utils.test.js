/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/server.utils.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Node.js test runner coverage for the shared server utility helpers. Exercises
 *  both success and error helpers to ensure consistent HTTP response shapes.
 *
 *  Features
 *  --------
 *  • Validates the success helper logs and serialises payloads correctly.
 *  • Confirms the error helper applies defaults when arguments are omitted.
 *  • Uses lightweight manual mocks to avoid external testing dependencies.
 *
 *  Design Principles
 *  -----------------
 *  • Prefer native tooling (node:test) to eliminate third-party dependencies.
 *  • Keep mocks explicit for transparency and debuggability.
 *  • Restore any mutated globals after each assertion to prevent bleed-over.
 *
 *  TODOs
 *  -----
 *  • [OBSERVABILITY] Replace console.log with structured logging in helpers.
 *  • [ROBUSTNESS] Extend helpers with error codes and tracing metadata.
 *
 *  @module tests/unit/server.utils
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test from "node:test";
import assert from "node:assert/strict";

import { handleError, handleSuccess } from "../../src/utils/server.utils.js";
import STRINGS from "../../src/config/strings.config.js";

const createMockResponse = () => {
  const calls = { status: [], json: [] };
  return {
    calls,
    status(code) {
      calls.status.push(code);
      return this;
    },
    json(payload) {
      calls.json.push(payload);
      return payload;
    },
  };
};

test(STRINGS.TEST.SERVER_UTILS_SUCCESS, () => {
  const mockRes = createMockResponse();

  handleSuccess(mockRes, 200, STRINGS.GENERAL.OK, {
    foo: STRINGS.GENERAL.BAR,
  });

  assert.deepStrictEqual(mockRes.calls.status, [200]);
  assert.deepStrictEqual(mockRes.calls.json, [
    { message: STRINGS.GENERAL.OK, data: { foo: STRINGS.GENERAL.BAR } },
  ]);
});

test(STRINGS.TEST.SERVER_UTILS_SUCCESS_NULL_DATA, () => {
  const mockRes = createMockResponse();
  handleSuccess(mockRes, 201, STRINGS.GENERAL.CREATED, null);

  assert.deepStrictEqual(mockRes.calls.status, [201]);
  assert.deepStrictEqual(mockRes.calls.json, [
    { message: STRINGS.GENERAL.CREATED, data: null },
  ]);
});

test(STRINGS.TEST.SERVER_UTILS_SUCCESS_UNDEFINED_DATA, () => {
  const mockRes = createMockResponse();

  handleSuccess(mockRes, 200, STRINGS.GENERAL.OK);

  assert.deepStrictEqual(mockRes.calls.status, [200]);
  assert.deepStrictEqual(mockRes.calls.json, [
    { message: STRINGS.GENERAL.OK, data: null },
  ]);
});

test(STRINGS.TEST.SERVER_UTILS_ERROR_EXPLICIT, () => {
  const mockRes = createMockResponse();

  handleError(mockRes, 404, STRINGS.GENERAL.NOT_FOUND);

  assert.deepStrictEqual(mockRes.calls.status, [404]);
  assert.deepStrictEqual(mockRes.calls.json, [
    { error: STRINGS.GENERAL.NOT_FOUND },
  ]);
});

test(STRINGS.TEST.SERVER_UTILS_ERROR_DEFAULTS, () => {
  const mockRes = createMockResponse();

  handleError(mockRes);

  assert.deepStrictEqual(mockRes.calls.status, [500]);
  assert.deepStrictEqual(mockRes.calls.json, [
    { error: STRINGS.SERVER.INTERNAL_ERROR },
  ]);
});
