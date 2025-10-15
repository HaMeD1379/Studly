/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/sessions.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Versioned router for session-related endpoints. Provides endpoints to start,
 *  complete, and list study sessions. Business logic lives within the
 *  sessions controller to keep routing lightweight and testable.
 *
 *  Features
 *  --------
 *  • POST /sessions → start a new session.
 *  • PATCH /sessions/:id/complete → mark a session as complete.
 *  • GET /sessions → list sessions with optional query filters.
 *
 *  Design Principles
 *  -----------------
 *  • Maintain separation of concerns (routing vs. controller logic).
 *  • Support API versioning via /api/v1 prefix for forward compatibility.
 *  • Document each endpoint for clarity and onboarding.
 *
 *  TODOs
 *  -----
 *  • [VALIDATION] Add schema validation middleware (e.g., Zod or Joi).
 *  • [AUTHZ] Protect routes once authentication layer is finalized.
 *  • [OBSERVABILITY] Add request metrics and structured logging.
 *
 *  @module routes/v1/sessions
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import {
  startSession,
  completeSession,
  listSessions,
} from '../../controllers/sessions.controller.js';

const router = Router();

router.post('/', startSession);
router.patch('/:id/complete', completeSession);
router.get('/', listSessions);

export default router;
