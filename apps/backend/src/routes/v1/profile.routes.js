/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/profile.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-01
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Maps profile-related HTTP endpoints to their controller handlers.
 *  This router lives under /api/v1/profile and coordinates middleware validation
 *  prior to invoking the Supabase-backed controller logic.
 *
 *  Features
 *  --------
 *  • PATCH endpoint for updating user profile (full_name and bio).
 *  • Validation middleware for input sanitization.
 *  • Versioned routing for future backwards compatibility.
 *
 *  Design Principles
 *  -----------------
 *  • Maintain thin routing layer with no business logic.
 *  • Reuse versioned namespace for future backwards compatibility.
 *  • Compose middleware per-endpoint for readability and testability.
 *
 *  TODOs
 *  -----
 *  • [SECURITY] Add authentication guards to verify user ownership.
 *  • [DOCS] Generate OpenAPI specs from these route definitions.
 *  • [RATE LIMITING] Apply per-endpoint rate limiting to curb abuse.
 *
 *  @module routes/v1/profile
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { Router } from "express";
import {
  updateProfile,
  getProfileData,
} from "../../controllers/profile.controller.js";
import { validateProfileUpdate } from "../../middleware/profile.validation.middleware.js";

const router = Router();

router.patch("/update", validateProfileUpdate, updateProfile);
router.get("/:id", getProfileData);

export default router;
