/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/sessions.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-11-19
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Versioned router for session-related endpoints. Provides endpoints to create,
 *  update, list, and summarize study sessions. Business logic lives within the
 *  sessions controller to keep routing lightweight and testable.
 *
 *  Endpoints
 *  ---------
 *  • POST   /api/v1/sessions           → start a new session
 *  • PATCH  /api/v1/sessions/:id       → update/complete an existing session
 *  • GET    /api/v1/sessions           → list sessions with optional filters
 *  • GET    /api/v1/sessions/summary   → provide aggregated study metrics
 *
 *  Design Principles
 *  -----------------
 *  • Maintain separation of concerns (routing vs. controller logic).
 *  • Support API versioning via /api/v1 prefix for forward compatibility.
 *  • Keep module free of validation/auth concerns; those live in middleware.
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
