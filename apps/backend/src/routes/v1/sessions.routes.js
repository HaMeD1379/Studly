/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/sessions.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-16
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
 *  • PATCH /sessions/:sessionId → mark a session as complete.
 *  • GET /sessions → list sessions with optional query filters (userId, status, limit).
 *  • GET /sessions/summary → provide aggregated study metrics.
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
  getSessionsSummary,
} from '../../controllers/sessions.controller.js';

const router = Router();

router.post('/', startSession);
router.patch('/:sessionId', completeSession);
router.get('/', listSessions);
router.get('/summary', getSessionsSummary);

export default router;
