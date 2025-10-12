/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/sessions.controller.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-11
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express controller factory for Sessions. Orchestrates request validation,
 *  mapping between API payloads and DB fields, and delegates data operations to
 *  the sessions service.
 *
 *  Endpoints (paired with router):
 *  • startSession(req, res)        → POST   /         : create a new session
 *  • completeSession(req, res)     → PATCH  /:id/complete : mark session complete
 *  • listSessions(req, res)        → GET    /         : list sessions by user
 *
 *  Design Notes
 *  ------------
 *  • Separation of concerns: keeps DB logic in the service layer.
 *  • Dependency injection: accepts a service for easy Jest mocking.
 *  • Defensive programming: explicit 4xx responses for client issues.
 *
 *  TODOs
 *  -----
 *  • [VALIDATION] Replace inline checks with schema validation (Zod/Joi).
 *  • [AUTHZ] Enforce authentication/authorization once roles are defined.
 *  • [OBSERVABILITY] Add structured logging (reqId, userId) and metrics.
 *  • [ERROR-MAPPING] Map known service errors to consistent HTTP codes.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import sessionsService from '../services/sessions.service.js';

/**
 * Factory for sessions controller — allows injecting a mock service in tests.
 * @param {object} service - Sessions service with createSession, completeSession, listSessions
 * @returns {{startSession: Function, completeSession: Function, listSessions: Function}}
 */
export const createSessionsController = (service = sessionsService) => {
  /**
   * POST /
   * Start a new session.
   * Expected body: { userId: string, subject: string, startedAt?: ISOString, targetDurationMinutes?: number }
   * Response: 201 Created { session }
   */
  const startSession = async (req, res, next) => {
    try {
      const { userId, subject, startedAt, targetDurationMinutes } = req.body ?? {};

      // Basic input checks — replace with schema validation later
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      if (!subject) return res.status(400).json({ error: 'subject is required' });

      // Map API payload → DB fields (snake_case)
      const sessionToCreate = {
        user_id: userId,
        subject,
        started_at: startedAt ?? new Date().toISOString(), // default to now
        target_duration_minutes: targetDurationMinutes ?? null,
        status: 'in_progress',
      };

      const session = await service.createSession(sessionToCreate);
      return res.status(201).json({ session });
    } catch (error) {
      // Let centralized error middleware handle logging/formatting
      return next(error);
    }
  };

  /**
   * PATCH /:id/complete
   * Complete a session.
   * Expected params: { id }
   * Expected body: { endedAt: ISOString, durationMinutes?: number, notes?: string }
   * Response: 200 OK { session } | 404 if not found
   */
  const completeSession = async (req, res, next) => {
    try {
      const { id } = req.params ?? {};
      const { endedAt, durationMinutes, notes } = req.body ?? {};

      if (!id) return res.status(400).json({ error: 'session id is required' });
      if (!endedAt) return res.status(400).json({ error: 'endedAt is required' });

      // TODO[VALIDATION]: Validate id format (UUID/ObjectId) and ISO date for endedAt.
      // Construct partial update payload for the DB
      const updates = {
        ended_at: endedAt,
        duration_minutes: durationMinutes ?? null,
        notes: notes ?? null,
        status: 'completed',
      };

      const session = await service.completeSession(id, updates);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      return res.status(200).json({ session });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /
   * List sessions for a user (optionally filtered by subject).
   * Expected query: ?userId=...&subject=...
   * Response: 200 OK { sessions: [] }
   */
  const listSessions = async (req, res, next) => {
    try {
      const { userId, subject } = req.query ?? {};
      if (!userId) {
        return res.status(400).json({ error: 'userId query parameter is required' });
      }

      // Delegate filtering to service (keeps controller thin)
      const sessions = await service.listSessions({ userId, subject });
      return res.status(200).json({ sessions });
    } catch (error) {
      return next(error);
    }
  };

  return { startSession, completeSession, listSessions };
};

// Default instance for production wiring
const defaultController = createSessionsController();

// Named exports for router
export const { startSession, completeSession, listSessions } = defaultController;

// Default export for direct imports
export default defaultController;
