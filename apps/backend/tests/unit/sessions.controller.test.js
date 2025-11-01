/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.controller.test.js
 * 
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the Sessions controller using Node's built-in test runner.
 *  Verifies:
 *   • Input validation (400) conditions
 *   • Happy-path success responses (201/200)
 *   • Not found mapping (404)
 *   • Error propagation to `next` for centralized error handling
 *   • Query parsing for pagination and summary helpers
 *   • Badge integration on session completion
 *
 *  Notes
 *  -----
 *  • We inject a mock "service" to isolate controller behavior (DI-friendly).
 *  • Response object is a minimal stub with `status` and `json` to capture outputs.
 *  • Badge service is mocked to test badge checking integration.
 *
 *  TODOs
 *  -----
 *  • [SCHEMA] Add tests once schema validation (Zod/Joi) replaces inline checks.
 *  • [OBSERVABILITY] When logging is added, verify correlation IDs are passed.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { createSessionsController } from '../../src/controllers/sessions.controller.js';

/**
 * Create a minimal Express-like response stub.
 * Captures status code and JSON body for assertions.
 */
const createMockResponse = () => {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this; // allow chaining like Express (res.status(...).json(...))
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
};

/**
 * Create mock services (sessions + badges)
 */
const createMockServices = () => {
  return {
    sessionsService: {
      createSession: mock.fn(),
      completeSession: mock.fn(),
      listSessions: mock.fn(),
      summarizeSessionsByDate: mock.fn(),
    },
    badgesService: {
      checkAndAwardBadges: mock.fn(),
    },
  };
};

describe('sessions.controller', () => {
  describe('startSession', () => {
    it('returns 400 when userId is missing', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { startSession } = createSessionsController(sessionsService, badgesService);
      const req = { body: { subject: 'Math' } };
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId is required' });
      assert.equal(sessionsService.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 400 when subject is missing', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { startSession } = createSessionsController(sessionsService, badgesService);
      const req = { body: { userId: 'user-1' } };
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'subject is required' });
      assert.equal(sessionsService.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards canonical payload to the service', async () => {
      const createdSession = { id: 'session-1', subject: 'Biology' };
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.createSession = mock.fn(async (payload) => ({ ...createdSession, ...payload }));
      
      const { startSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        body: {
          userId: 'user-1',
          subject: 'Biology',
          startTimestamp: '2024-01-01T00:00:00.000Z',
          targetDurationMillis: 1_800_000, // 30 minutes
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(req, res, next);

      assert.equal(res.statusCode, 201);
      assert.equal(sessionsService.createSession.mock.calls.length, 1);
      const payload = sessionsService.createSession.mock.calls[0].arguments[0];
      assert.deepEqual(payload, {
        userId: 'user-1',
        subject: 'Biology',
        startTimestamp: '2024-01-01T00:00:00.000Z',
        targetDurationMillis: 1_800_000,
        status: 'in_progress',
      });
    });

    it('forwards service errors to next', async () => {
      const error = new Error('database offline');
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.createSession = mock.fn(async () => {
        throw error;
      });
      
      const { startSession } = createSessionsController(sessionsService, badgesService);
      const req = { body: { userId: 'user-1', subject: 'Math' } };
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(req, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('completeSession', () => {
    it('returns 400 when sessionId is missing', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = { params: {}, body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' } };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'sessionId is required' });
      assert.equal(sessionsService.completeSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 400 when endStudyTimestamp is missing', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = { params: { sessionId: 'session-1' }, body: {} };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'endStudyTimestamp is required' });
      assert.equal(sessionsService.completeSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 404 when the service cannot find the session', async () => {
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => null);
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'missing-session' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.body, { error: 'Session not found' });
      assert.equal(sessionsService.completeSession.mock.calls.length, 1);
      assert.equal(next.mock.calls.length, 0);
    });

    it('maps request payload into canonical service update', async () => {
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => ({
        id: 'session-1',
        userId: 'user-1',
        status: 'completed'
      }));
      badgesService.checkAndAwardBadges = mock.fn(async () => []);
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'session-1' },
        body: {
          endStudyTimestamp: '2024-01-01T00:10:00.000Z',
          sessionLengthMillis: 600_000,
          notes: 'Felt productive',
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 200);
      const callArgs = sessionsService.completeSession.mock.calls[0].arguments;
      assert.equal(callArgs[0], 'session-1');
      assert.deepEqual(callArgs[1], {
        endStudyTimestamp: '2024-01-01T00:10:00.000Z',
        sessionLengthMillis: 600_000,
        notes: 'Felt productive',
        status: 'completed',
      });
    });

    // ============================================================================
    // NEW TESTS: Badge Integration
    // ============================================================================

    it('checks for badges and returns newly earned badges on completion', async () => {
      const completedSession = { 
        id: 'session-1', 
        userId: 'user-1',
        status: 'completed' 
      };
      const newBadges = [
        {
          userId: 'user-1',
          badgeId: 'badge-1',
          earnedAt: '2024-01-01T00:10:01.000Z',
          badge: {
            name: 'First Steps',
            description: 'Complete your first study session'
          }
        }
      ];

      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => completedSession);
      badgesService.checkAndAwardBadges = mock.fn(async () => newBadges);
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'session-1' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, {
        session: completedSession,
        newBadgesEarned: newBadges,
        badgeCount: 1
      });
      assert.equal(badgesService.checkAndAwardBadges.mock.calls.length, 1);
      assert.equal(badgesService.checkAndAwardBadges.mock.calls[0].arguments[0], 'user-1');
    });

    it('returns empty badges array when no new badges earned', async () => {
      const completedSession = { 
        id: 'session-1', 
        userId: 'user-1',
        status: 'completed' 
      };

      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => completedSession);
      badgesService.checkAndAwardBadges = mock.fn(async () => []);
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'session-1' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, {
        session: completedSession,
        newBadgesEarned: [],
        badgeCount: 0
      });
      assert.equal(badgesService.checkAndAwardBadges.mock.calls.length, 1);
    });

    it('does not check badges when session status is not completed', async () => {
      const cancelledSession = { 
        id: 'session-1', 
        userId: 'user-1',
        status: 'cancelled' 
      };

      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => cancelledSession);
      badgesService.checkAndAwardBadges = mock.fn(async () => []);
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'session-1' },
        body: { 
          endStudyTimestamp: '2024-01-01T00:10:00.000Z',
          status: 'cancelled'
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { session: cancelledSession });
      // Badge check should NOT be called
      assert.equal(badgesService.checkAndAwardBadges.mock.calls.length, 0);
    });

    it('gracefully handles badge check failures without breaking session completion', async () => {
      const completedSession = { 
        id: 'session-1', 
        userId: 'user-1',
        status: 'completed' 
      };
      const badgeError = new Error('Badge service unavailable');

      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => completedSession);
      badgesService.checkAndAwardBadges = mock.fn(async () => {
        throw badgeError;
      });
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'session-1' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      // Session should still complete successfully
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, {
        session: completedSession,
        newBadgesEarned: [],
        badgeCount: 0,
        badgeCheckFailed: true
      });
      // Error should NOT be forwarded to next() - it's handled gracefully
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards session completion errors to next', async () => {
      const error = new Error('update failed');
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.completeSession = mock.fn(async () => {
        throw error;
      });
      
      const { completeSession } = createSessionsController(sessionsService, badgesService);
      const req = {
        params: { sessionId: 'session-1' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
      // Badge check should not be attempted if session completion fails
      assert.equal(badgesService.checkAndAwardBadges.mock.calls.length, 0);
    });
  });

  describe('listSessions', () => {
    it('requires the userId query parameter', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { listSessions } = createSessionsController(sessionsService, badgesService);
      const req = { query: {} };
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(sessionsService.listSessions.mock.calls.length, 0);
    });

    it('returns 400 when limit is not a positive integer', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { listSessions } = createSessionsController(sessionsService, badgesService);
      const req = { query: { userId: 'user-1', limit: 'zero' } };
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'limit must be a positive integer' });
      assert.equal(sessionsService.listSessions.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('passes filter params through to the service', async () => {
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.listSessions = mock.fn(async () => [{ id: 'session-1' }]);
      
      const { listSessions } = createSessionsController(sessionsService, badgesService);
      const req = {
        query: {
          userId: 'user-1',
          subject: 'Math',
          status: 'completed',
          limit: '5',
          endedAfter: '2024-01-01T00:00:00.000Z',
          endedBefore: '2024-01-02T00:00:00.000Z',
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { sessions: [{ id: 'session-1' }] });
      assert.deepEqual(sessionsService.listSessions.mock.calls[0].arguments[0], {
        userId: 'user-1',
        subject: 'Math',
        status: 'completed',
        endedAfter: '2024-01-01T00:00:00.000Z',
        endedBefore: '2024-01-02T00:00:00.000Z',
        limit: 5,
      });
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next', async () => {
      const error = new Error('query failed');
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.listSessions = mock.fn(async () => {
        throw error;
      });
      
      const { listSessions } = createSessionsController(sessionsService, badgesService);
      const req = { query: { userId: 'user-1' } };
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(req, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('getSessionsSummary', () => {
    it('requires userId', async () => {
      const { sessionsService, badgesService } = createMockServices();
      const { getSessionsSummary } = createSessionsController(sessionsService, badgesService);
      const req = { query: {} };
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(sessionsService.summarizeSessionsByDate.mock.calls.length, 0);
    });

    it('returns summary data from the service', async () => {
      const summary = { totalTimeStudied: 3_600_000, timesStudied: 2 };
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.summarizeSessionsByDate = mock.fn(async () => summary);
      
      const { getSessionsSummary } = createSessionsController(sessionsService, badgesService);
      const req = {
        query: {
          userId: 'user-1',
          from: '2024-01-01',
          to: '2024-01-07',
          status: 'completed',
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(req, res, next);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, summary);
      assert.deepEqual(sessionsService.summarizeSessionsByDate.mock.calls[0].arguments[0], {
        userId: 'user-1',
        from: '2024-01-01',
        to: '2024-01-07',
        status: 'completed',
      });
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next', async () => {
      const error = new Error('summary failed');
      const { sessionsService, badgesService } = createMockServices();
      sessionsService.summarizeSessionsByDate = mock.fn(async () => {
        throw error;
      });
      
      const { getSessionsSummary } = createSessionsController(sessionsService, badgesService);
      const req = { query: { userId: 'user-1' } };
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(req, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });
});
