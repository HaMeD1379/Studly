/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/middleware/profile.validation.middleware.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-02
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express middleware responsible for validating profile update request payloads
 *  prior to reaching profile controllers. Ensures authentication tokens are
 *  present and profile data meets validation requirements.
 *
 *  Features
 *  --------
 *  • Validates user_id is present in request body.
 *  • Ensures access_token is provided in Authorization header (Bearer format).
 *  • Requires refresh_token in request body for session management.
 *  • Validates bio length does not exceed 200 characters.
 *  • Allows optional full_name updates with no specific validation.
 *
 *  Design Principles
 *  -----------------
 *  • Fail fast with descriptive errors for a better developer experience.
 *  • Reuse shared STRINGS constants for consistency and testability.
 *  • Keep middleware composable and focused on profile-specific validation.
 *
 *  TODOs
 *  -----
 *  • [EXTENSIBILITY] Add validators for profile photo upload when implemented.
 *  • [SECURITY] Consider adding rate limiting for profile update operations.
 *
 *  @module middleware/profile.validation.middleware
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { handleError } from "../utils/server.utils.js";
import STRINGS from "../config/strings.config.js";

export const validateProfileUpdate = (req, res, next) => {
  const { user_id: userId, bio, refresh_token: refreshToken } = req.body;
  const accessToken = req.headers.authorization;

  if (!userId) {
    handleError(res, 400, STRINGS.VALIDATION.MISSING_USER_ID);
    return;
  }

  if (!accessToken || !accessToken.startsWith("Bearer ")) {
    handleError(res, 400, STRINGS.VALIDATION.MISSING_ACCESS_TOKEN);
    return;
  }

  if (!refreshToken) {
    handleError(res, 400, STRINGS.VALIDATION.MISSING_REFRESH_TOKEN);
    return;
  }

  if (bio !== undefined && typeof bio === "string" && bio.length > 200) {
    handleError(res, 400, STRINGS.VALIDATION.INVALID_BIO_LENGTH);
    return;
  }

  next();
};

export default {
  validateProfileUpdate,
};
