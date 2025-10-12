/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/sessions.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-11
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express router that defines the Sessions API surface:
 *    • POST   /             → start a new session
 *    • PATCH  /:id/complete → mark an existing session as completed
 *    • GET    /             → list all sessions
 *
 *  This router delegates actual logic to the session controller layer:
 *  `../controllers/sessions.controller.js`
 *
 *  Design Principles
 *  -----------------
 *  • Separation of concerns — routing only, no business logic here.
 *  • Scalability — consistent pattern supports modular expansion.
 *  • Maintainability — easily testable with Jest integration and route stubs.
 *
 *  TODOs
 *  -----
 *  • [VALIDATION] Add payload validation middleware (Joi/Zod or celebrate).
 *  • [AUTHZ] Protect routes with authentication middleware.
 *  • [OBSERVABILITY] Add request logging & error tracking integration.
 *  • [DOCS] Add JSDoc or OpenAPI schema generation for these routes.
 *
 *  @module routes/sessions
 *  @see ../controllers/sessions.controller.js
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { Router } from 'express'; // Express router factory for modular route organization.
import {
  startSession,      // Controller: handles creation of a new session.
  completeSession,   // Controller: marks an existing session as complete.
  listSessions,      // Controller: returns all sessions or filtered query results.
} from '../controllers/sessions.controller.js';

const router = Router(); // Create an isolated router instance scoped to "sessions".

/**
 * @route POST /
 * @desc Start a new session.
 * @access Public (will be restricted later)
 *
 * Expected payload: JSON body describing session details (e.g., userId, courseId, timestamps)
 * Response: 201 Created with created session object.
 *
 * TODO[VALIDATION]: Validate required body fields.
 * TODO[AUTH]: Require user authentication.
 */
router.post('/', startSession);

/**
 * @route PATCH /:id/complete
 * @desc Mark a session as completed.
 * @access Public (will be restricted later)
 *
 * Path Params: :id → session identifier.
 * Response: 200 OK with updated session, or 404 if not found.
 *
 * TODO[VALIDATION]: Ensure valid :id format (UUID/ObjectId).
 */
router.patch('/:id/complete', completeSession);

/**
 * @route GET /
 * @desc Retrieve a list of sessions.
 * @access Public (will be restricted later)
 *
 * Query Params (optional): ?userId=&status=&page=&limit=
 * Response: 200 OK with array or paginated result.
 *
 * TODO[OPTIMIZE]: Add pagination, filtering, and sorting support.
 */
router.get('/', listSessions);

export default router; // Export for mounting in app.js (e.g., app.use('/api/sessions', router));
