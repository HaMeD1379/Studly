/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/sessions.controller.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Express controller factory for Sessions. Orchestrates request validation,
 *  mapping between API payloads and DB fields, and delegates data operations to
 *  the sessions service.
 *
 *  Endpoints (paired with router):
 *  • startSession(req, res)        → POST   /           : create a new session
 *  • completeSession(req, res)     → PATCH  /:sessionId : mark session complete
 *  • listSessions(req, res)        → GET    /           : list sessions by user
 *  • getSessionsSummary(req, res)  → GET    /summary    : aggregate study stats
 *
 *  Design Notes
 *  ------------
 *  • Separation of concerns: keeps DB logic in the service layer.
 *  • Dependency injection: accepts a service for easy Jest mocking.
 *  • Defensive programming: explicit 4xx responses for client issues.
 *  • Badge integration: Auto-checks for newly earned badges after completing session.
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
import badgesService from '../services/badges.service.js';

const MILLIS_IN_MINUTE = 60_000;

const millisToMinutes = (millis) => {
  if (millis === null || millis === undefined) return null;
  return Math.round((millis / MILLIS_IN_MINUTE) * 1000) / 1000;
};

const parseLimit = (value) => {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('limit must be a positive integer');
  }
  return parsed;
};

/**
 * Factory for sessions controller — allows injecting a mock service in tests.
 * @param {object} service - Sessions service with createSession, completeSession, listSessions
 * @param {object} badgeService - Badges service for checking earned badges
 * @returns {{startSession: Function, completeSession: Function, listSessions: Function}}
 */
export const createSessionsController = (
  service = sessionsService,
  badgeService = badgesService
) => {
  /**
   * POST /
   * Start a new session.
   * Expected body: {
   *   userId: string,
   *   subject: string,
   *   startTimestamp?: ISOString,
   *   targetDurationMillis?: number
   * }
   * Response: 201 Created { session }
   */
  const startSession = async (req, res, next) => {
    try {
      const { userId, subject, startTimestamp, targetDurationMillis } = req.body ?? {};

      if (!userId) return res.status(400).json({ error: 'userId is required' });
      if (!subject) return res.status(400).json({ error: 'subject is required' });

      const sessionToCreate = {
        user_id: userId,
        subject,
        started_at: startTimestamp ?? new Date().toISOString(),
        target_duration_minutes: millisToMinutes(targetDurationMillis),
        status: 'in_progress',
      };

      const session = await service.createSession(sessionToCreate);
      return res.status(201).json({ session });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * PATCH /:sessionId
   * Complete a session.
   * Expected params: { sessionId }
   * Expected body: {
   *   endStudyTimestamp: ISOString,
   *   sessionLengthMillis?: number,
   *   notes?: string,
   *   status?: string
   * }
   * Response: 200 OK { session, newBadgesEarned: [] } | 404 if not found
   * 
   * Automatically checks for newly earned badges after completing session
   */
  const completeSession = async (req, res, next) => {
    try {
      const { sessionId } = req.params ?? {};
      const { endStudyTimestamp, sessionLengthMillis, notes, status } =
        req.body ?? {};

      if (!sessionId)
        return res.status(400).json({ error: 'sessionId is required' });
      if (!endStudyTimestamp)
        return res.status(400).json({ error: 'endStudyTimestamp is required' });

      const updates = {
        ended_at: endStudyTimestamp,
        duration_minutes: millisToMinutes(sessionLengthMillis),
        notes: notes ?? null,
        status: status ?? 'completed',
      };

      const session = await service.completeSession(sessionId, updates);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      // ============================================================================
      // BADGE INTEGRATION: Check for newly earned badges, uses new logic from badge api that was made
      // ============================================================================
      // Only check badges if session was successfully completed (not cancelled/paused)
      if (session.status === 'completed' && session.userId) {
        try {
          const newBadges = await badgeService.checkAndAwardBadges(session.userId);
          
          // Return session data + newly earned badges
          return res.status(200).json({ 
            session,
            newBadgesEarned: newBadges,
            badgeCount: newBadges.length
          });
        } catch (badgeError) {
          // Don't fail the entire request if badge check fails
          // Log the error for debugging but still return the session
          console.error('[Badge Check Error]', {
            userId: session.userId,
            sessionId: session.id,
            error: badgeError.message
          });
          
          // Return session without badge info
          return res.status(200).json({ 
            session,
            newBadgesEarned: [],
            badgeCount: 0,
            badgeCheckFailed: true
          });
        }
      }

      // If session wasn't completed (e.g., cancelled), just return the session
      return res.status(200).json({ session });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /
   * List sessions for a user (optionally filtered by subject/status/time range).
   * Expected query: ?userId=...&subject=...&status=...&limit=...
   * Response: 200 OK { sessions: [] }
   */
  const listSessions = async (req, res, next) => {
    try {
      const { userId, subject, status, limit, endedAfter, endedBefore } =
        req.query ?? {};
      if (!userId) {
        return res
          .status(400)
          .json({ error: 'userId query parameter is required' });
      }

      let parsedLimit;
      try {
        parsedLimit = parseLimit(limit);
      } catch (parseError) {
        return res.status(400).json({ error: parseError.message });
      }

      const sessions = await service.listSessions({
        userId,
        subject,
        status,
        endedAfter,
        endedBefore,
        limit: parsedLimit,
      });
      return res.status(200).json({ sessions });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /summary
   * Aggregates study time and session counts for dashboards.
   * Expected query: ?userId=...&from=...&to=...
   * Response: 200 OK { totalTimeStudied, timesStudied }
   */
  const getSessionsSummary = async (req, res, next) => {
    try {
      const { userId, from, to, status } = req.query ?? {};
      if (!userId) {
        return res
          .status(400)
          .json({ error: 'userId query parameter is required' });
      }

      const summary = await service.summarizeSessionsByDate({
        userId,
        from,
        to,
        status: status ?? 'completed',
      });

      return res.status(200).json(summary);
    } catch (error) {
      return next(error);
    }
  };

  return { startSession, completeSession, listSessions, getSessionsSummary };
};

// Default instance for production wiring
const defaultController = createSessionsController();

// Named exports for router
export const { startSession, completeSession, listSessions, getSessionsSummary } =
  defaultController;

// Default export for direct imports
export default defaultController;
