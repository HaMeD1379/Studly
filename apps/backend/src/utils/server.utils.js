/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/server.utils.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Helper functions that normalize API responses for success and error cases.
 *  Centralizing response formatting keeps controllers concise and enforces a
 *  consistent contract for clients and tests alike.
 *
 *  Features
 *  --------
 *  • `handleSuccess` standardizes 2xx payload shape with optional data.
 *  • `handleError` standardizes non-2xx payloads and status codes.
 *  • Easily mockable in tests thanks to simple functional interface.
 *
 *  Design Principles
 *  -----------------
 *  • Favor pure functions that are easy to unit test.
 *  • Keep logging minimal and structured for observability.
 *  • Default to safe 500 status with generic message when details missing.
 *
 *  TODOs
 *  -----
 *  • [OBSERVABILITY] Integrate a logging abstraction instead of console usage.
 *  • [I18N] Pull copy from STRINGS to localize responses automatically.
 *
 *  @module utils/server.utils
 * ────────────────────────────────────────────────────────────────────────────────
 */

import STRINGS from "../config/strings.config.js";

export const handleError = (
  res,
  status = 500,
  message = STRINGS.SERVER.INTERNAL_ERROR
) => {
  return res.status(status).json({ error: message });
};

export const handleSuccess = (res, status, message, data = null) => {
  return res.status(status).json({ message, data });
};

export default {
  handleError,
  handleSuccess,
};
