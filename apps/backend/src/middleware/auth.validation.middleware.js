/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/middleware/auth.validation.middleware.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express middleware responsible for validating request payloads prior to
 *  reaching authentication controllers. Preventing malformed data early keeps
 *  controller logic focused on business concerns and reduces duplication.
 *
 *  Features
 *  --------
 *  • Ensures required fields are present for signup requests.
 *  • Validates email format via centralized regex.
 *  • Enforces a minimum password length requirement.
 *
 *  Design Principles
 *  -----------------
 *  • Fail fast with descriptive errors for a better developer experience.
 *  • Reuse shared STRINGS constants for consistency and testability.
 *  • Keep middleware composable for future expansion (e.g., login validation).
 *
 *  TODOs
 *  -----
 *  • [EXTENSIBILITY] Add validators for additional auth routes as needed.
 *  • [SECURITY] Integrate rate limiting / CAPTCHA for signup abuse prevention.
 *
 *  @module middleware/auth.validation.middleware
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { handleError } from '../utils/server.utils.js';
import STRINGS from '../config/strings.config.js';

export const validateSignup = (req, res, next) => {
  const { email, password, full_name: fullName } = req.body;

  if (!email || !password || !fullName) {
    handleError(res, 400, STRINGS.VALIDATION.MISSING_REQUIRED_FIELDS);
    return;
  }

  const emailRegex = STRINGS.VALIDATION.EMAIL_REGEX;
  if (!emailRegex.test(email)) {
    handleError(res, 400, STRINGS.VALIDATION.INVALID_EMAIL_FORMAT);
    return;
  }

  if (typeof password !== 'string' || password.length < 8) {
    handleError(res, 400, STRINGS.VALIDATION.PASSWORD_CHAR_REQUIREMENTS);
    return;
  }

  next();
};

export default {
  validateSignup,
};
