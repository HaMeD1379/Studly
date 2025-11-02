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

const parseLimit = (value) => {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('limit must be a positive integer');
  }
  return parsed;
};

const normalizeTimestamp = (value, fieldName) => {
  const millis = Date.parse(value);
  if (Number.isNaN(millis)) {
    throw new Error(`${fieldName} must be a valid ISO 8601 timestamp`);
  }
  return new Date(millis).toISOString();
};

const parsePositiveNumber = (value, fieldName) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return numeric;
};

const parseNonNegativeNumber = (value, fieldName) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return numeric;
};

const computeTotalMinutes = (startIso, endIso) => {
  const diff = Date.parse(endIso) - Date.parse(startIso);
  if (!Number.isFinite(diff) || diff < 0) {
    throw new Error('endTime must occur after startTime');
  }
  return Math.round((diff / 60_000) * 1000) / 1000;
};

const validateDateString = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') {
    throw new Error(`${fieldName} cannot be null or empty`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
  }
  return value;
};

/**
 * Factory for sessions controller — allows injecting a mock service in tests.
 * @param {object} service - Sessions service with createSession, completeSession, listSessions
 * @returns {{startSession: Function, completeSession: Function, listSessions: Function}}
 */
export const createSessionsController = (
  service = sessionsService
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
      const {
        userId,
        subject,
        sessionType,
        startTime,
        endTime,
        sessionGoal,
        totalMinutes,
        date,
      } = req.body ?? {};

      if (!userId) return res.status(400).json({ error: 'userId is required' });
      if (!subject) return res.status(400).json({ error: 'subject is required' });
      if (sessionType === undefined)
        return res.status(400).json({ error: 'sessionType is required' });
      if (!startTime) return res.status(400).json({ error: 'startTime is required' });
      if (!endTime) return res.status(400).json({ error: 'endTime is required' });

      let parsedSessionType;
      let normalizedStart;
      let normalizedEnd;
      let normalizedTotalMinutes = totalMinutes;

      try {
        parsedSessionType = parsePositiveNumber(sessionType, 'sessionType');
        normalizedStart = normalizeTimestamp(startTime, 'startTime');
        normalizedEnd = normalizeTimestamp(endTime, 'endTime');

        if (normalizedTotalMinutes === undefined) {
          normalizedTotalMinutes = computeTotalMinutes(normalizedStart, normalizedEnd);
        } else if (normalizedTotalMinutes === null) {
          normalizedTotalMinutes = null;
        } else {
          normalizedTotalMinutes = parseNonNegativeNumber(
            normalizedTotalMinutes,
            'totalMinutes',
          );
        }

        validateDateString(date, 'date');
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }

      const sessionToCreate = {
        userId,
        subject,
        sessionType: parsedSessionType,
        sessionGoal: sessionGoal ?? null,
        startTime: normalizedStart,
        endTime: normalizedEnd,
        totalMinutes: normalizedTotalMinutes,
        date,
      };

      const session = await service.createSession(sessionToCreate);
      return res.status(201).json({ session });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * PATCH /:sessionId
   * Update a session.
   * Expected params: { sessionId }
   * Expected body: {
   *   subject?: string,
   *   sessionType?: number,
   *   startTime?: ISOString,
   *   endTime?: ISOString,
   *   sessionGoal?: string,
   *   totalMinutes?: number | null,
   *   date?: YYYY-MM-DD
   * }
   * Response: 200 OK { session } | 404 if not found
   */
  const completeSession = async (req, res, next) => {
    try {
      const { sessionId } = req.params ?? {};
      const {
        subject,
        sessionType,
        startTime,
        endTime,
        sessionGoal,
        totalMinutes,
        date,
      } = req.body ?? {};

      if (!sessionId)
        return res.status(400).json({ error: 'sessionId is required' });

      if (
        subject === undefined &&
        sessionType === undefined &&
        startTime === undefined &&
        endTime === undefined &&
        sessionGoal === undefined &&
        totalMinutes === undefined &&
        date === undefined
      ) {
        return res
          .status(400)
          .json({ error: 'At least one field must be provided to update a session' });
      }

      let parsedSessionType;
      let normalizedStart = startTime;
      let normalizedEnd = endTime;
      let normalizedTotal = totalMinutes;

      try {
        if (sessionType !== undefined) {
          parsedSessionType = parsePositiveNumber(sessionType, 'sessionType');
        }

        if (startTime !== undefined) {
          normalizedStart = normalizeTimestamp(startTime, 'startTime');
        }

        if (endTime !== undefined) {
          normalizedEnd = normalizeTimestamp(endTime, 'endTime');
        }

        if (normalizedTotal !== undefined) {
          if (normalizedTotal === null) {
            normalizedTotal = null;
          } else {
            normalizedTotal = parseNonNegativeNumber(normalizedTotal, 'totalMinutes');
          }
        }

        if (date !== undefined) {
          validateDateString(date, 'date');
        }
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }

      if (
        normalizedTotal === undefined &&
        normalizedStart !== undefined &&
        normalizedEnd !== undefined
      ) {
        try {
          normalizedTotal = computeTotalMinutes(normalizedStart, normalizedEnd);
        } catch (durationError) {
          return res.status(400).json({ error: durationError.message });
        }
      }

      const updates = {};
      if (subject !== undefined) updates.subject = subject;
      if (parsedSessionType !== undefined) updates.sessionType = parsedSessionType;
      if (sessionGoal !== undefined) updates.sessionGoal = sessionGoal ?? null;
      if (normalizedStart !== undefined) updates.startTime = normalizedStart;
      if (normalizedEnd !== undefined) updates.endTime = normalizedEnd;
      if (normalizedTotal !== undefined) updates.totalMinutes = normalizedTotal;
      if (date !== undefined) updates.date = date;

      const session = await service.completeSession(sessionId, updates);
      if (!session) return res.status(404).json({ error: 'Session not found' });

      return res.status(200).json({ session });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /
   * List sessions for a user (optionally filtered by subject/type/date range).
   * Expected query: ?userId=...&subject=...&sessionType=...&from=...&to=...&limit=...
   * Response: 200 OK { sessions: [] }
   */
  const listSessions = async (req, res, next) => {
    try {
      const { userId, subject, sessionType, from, to, limit } = req.query ?? {};
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

      let parsedSessionType;
      let normalizedFrom = from;
      let normalizedTo = to;
      try {
        if (sessionType !== undefined) {
          parsedSessionType = parsePositiveNumber(sessionType, 'sessionType');
        }
        if (from !== undefined) {
          normalizedFrom = normalizeTimestamp(from, 'from');
        }
        if (to !== undefined) {
          normalizedTo = normalizeTimestamp(to, 'to');
        }
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }

      const sessions = await service.listSessions({
        userId,
        subject,
        sessionType: parsedSessionType,
        from: normalizedFrom,
        to: normalizedTo,
        limit: parsedLimit,
      });
      return res.status(200).json({ sessions });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * GET /summary
   * Aggregates total minutes and session counts for dashboards.
   * Expected query: ?userId=...&from=...&to=...&sessionType=...
   * Response: 200 OK { totalMinutesStudied, sessionsLogged }
   */
  const getSessionsSummary = async (req, res, next) => {
    try {
      const { userId, from, to, sessionType } = req.query ?? {};
      if (!userId) {
        return res
          .status(400)
          .json({ error: 'userId query parameter is required' });
      }

      let parsedSessionType;
      let normalizedFrom = from;
      let normalizedTo = to;
      try {
        if (sessionType !== undefined) {
          parsedSessionType = parsePositiveNumber(sessionType, 'sessionType');
        }
        if (from !== undefined) {
          normalizedFrom = normalizeTimestamp(from, 'from');
        }
        if (to !== undefined) {
          normalizedTo = normalizeTimestamp(to, 'to');
        }
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }

      const summary = await service.summarizeSessionsByDate({
        userId,
        from: normalizedFrom,
        to: normalizedTo,
        sessionType: parsedSessionType,
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
