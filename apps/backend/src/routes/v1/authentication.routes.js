/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/authentication.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Maps authentication-related HTTP endpoints to their controller handlers.
 *  This router lives under /api/v1/auth and coordinates middleware validation
 *  prior to invoking the Supabase-backed controller logic.
 *
 *  Features
 *  --------
 *  • Signup endpoint with preflight input validation middleware.
 *  • Login/logout endpoints leveraging Supabase session management.
 *  • Forgot/reset password endpoints to complete the auth lifecycle.
 *
 *  Design Principles
 *  -----------------
 *  • Maintain thin routing layer with no business logic.
 *  • Reuse versioned namespace for future backwards compatibility.
 *  • Compose middleware per-endpoint for readability and testability.
 *
 *  TODOs
 *  -----
 *  • [SECURITY] Add authentication guards to protected routes when available.
 *  • [DOCS] Generate OpenAPI specs from these route definitions.
 *  • [RATE LIMITING] Apply per-endpoint rate limiting to curb abuse.
 *
 *  @module routes/v1/authentication
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from '../../controllers/auth.controller.js';
import { validateSignup } from '../../middleware/validateInput.js';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
