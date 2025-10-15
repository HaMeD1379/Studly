/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/serverUtils.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the serverUtils helpers. Ensures both success and error
 *  response helpers behave consistently and log as expected.
 *
 *  Features
 *  --------
 *  • Verifies success responses include payload and status.
 *  • Verifies error responses default to generic server error when omitted.
 *  • Uses jest spies to silence console noise during test execution.
 *
 *  Design Principles
 *  -----------------
 *  • Keep tests deterministic by relying on shared STRINGS constants.
 *  • Reset mocks between runs to avoid bleed-over state.
 *  • Cover default parameter branches for regression safety.
 *
 *  TODOs
 *  -----
 *  • [COVERAGE] Add tests for future helpers introduced in serverUtils.
 *
 *  @module tests/unit/serverUtils
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { jest } from '@jest/globals';
import { handleError, handleSuccess } from '../../src/utils/serverUtils.js';
import STRINGS from '../../src/config/strings.js';

describe(STRINGS.GENERAL.SERVER_UTILS_JS, () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, STRINGS.GENERAL.ERROR).mockImplementation(() => {});
    jest.spyOn(console, STRINGS.GENERAL.LOG).mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it(STRINGS.TEST.SERVER_UTILS_SUCCESS, () => {
    handleSuccess(mockRes, 200, STRINGS.GENERAL.OK, {
      foo: STRINGS.GENERAL.BAR,
    });
    expect(console.log).toHaveBeenCalledWith(STRINGS.GENERAL.OK);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: STRINGS.GENERAL.OK,
      data: { foo: STRINGS.GENERAL.BAR },
    });
  });

  it(STRINGS.TEST.SERVER_UTILS_SUCCESS_NULL_DATA, () => {
    handleSuccess(mockRes, 201, STRINGS.GENERAL.CREATED, null);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: STRINGS.GENERAL.CREATED,
      data: null,
    });
  });

  it(STRINGS.TEST.SERVER_UTILS_SUCCESS_UNDEFINED_DATA, () => {
    handleSuccess(mockRes, 200, STRINGS.GENERAL.OK);
    expect(console.log).toHaveBeenCalledWith(STRINGS.GENERAL.OK);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: STRINGS.GENERAL.OK,
      data: null,
    });
  });

  it(STRINGS.TEST.SERVER_UTILS_ERROR_EXPLICIT, () => {
    handleError(mockRes, 404, STRINGS.GENERAL.NOT_FOUND);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: STRINGS.GENERAL.NOT_FOUND,
    });
  });

  it(STRINGS.TEST.SERVER_UTILS_ERROR_DEFAULTS, () => {
    handleError(mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: STRINGS.SERVER.INTERNAL_ERROR,
    });
  });
});
