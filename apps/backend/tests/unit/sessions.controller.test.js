/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.controller.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-16
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the Sessions controller using Node’s built-in test runner.
 *  Verifies:
 *   • Input validation (400) conditions
 *   • Happy-path success responses (201/200)
 *   • Not found mapping (404)
 *   • Error propagation to `next` for centralized error handling
 *   • Query parsing for pagination and summary helpers
 *
 *  Notes
 *  -----
 *  • We inject a mock "service" to isolate controller behavior (DI-friendly).
 *  • Response object is a minimal stub with `status` and `json` to capture outputs.
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

describe('sessions.controller', () => {
  describe('startSession', () => {
    it('returns 400 when userId is missing', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
      const req = { body: { subject: 'Math' } };
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId is required' });
      assert.equal(service.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 400 when subject is missing', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
      const req = { body: { userId: 'user-1' } };
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'subject is required' });
      assert.equal(service.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('maps milliseconds to minutes before delegating to the service', async () => {
      const createdSession = { id: 'session-1', subject: 'Biology' };
      const service = {
        createSession: mock.fn(async (payload) => ({ ...createdSession, ...payload })),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
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
      assert.equal(service.createSession.mock.calls.length, 1);
      const payload = service.createSession.mock.calls[0].arguments[0];
      assert.equal(payload.target_duration_minutes, 30);
      assert.equal(payload.started_at, '2024-01-01T00:00:00.000Z');
      assert.equal(payload.status, 'in_progress');
      assert.equal(payload.user_id, 'user-1');
    });

    it('forwards service errors to next', async () => {
      const error = new Error('database offline');
      const service = {
        createSession: mock.fn(async () => {
          throw error;
        }),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
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
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = { params: {}, body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' } };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'sessionId is required' });
      assert.equal(service.completeSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 400 when endStudyTimestamp is missing', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = { params: { sessionId: 'session-1' }, body: {} };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'endStudyTimestamp is required' });
      assert.equal(service.completeSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 404 when the service cannot find the session', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(async () => null),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = {
        params: { sessionId: 'missing-session' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.body, { error: 'Session not found' });
      assert.equal(service.completeSession.mock.calls.length, 1);
      assert.equal(next.mock.calls.length, 0);
    });

    it('maps milliseconds to minutes before completing the session', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(async () => ({ id: 'session-1', status: 'completed' })),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
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
      const callArgs = service.completeSession.mock.calls[0].arguments;
      assert.equal(callArgs[0], 'session-1');
      assert.deepEqual(callArgs[1], {
        ended_at: '2024-01-01T00:10:00.000Z',
        duration_minutes: 10,
        notes: 'Felt productive',
        status: 'completed',
      });
    });

    it('forwards errors to next', async () => {
      const error = new Error('update failed');
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(async () => {
          throw error;
        }),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = {
        params: { sessionId: 'session-1' },
        body: { endStudyTimestamp: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(req, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('listSessions', () => {
    it('requires the userId query parameter', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { listSessions } = createSessionsController(service);
      const req = { query: {} };
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(service.listSessions.mock.calls.length, 0);
    });

    it('returns 400 when limit is not a positive integer', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { listSessions } = createSessionsController(service);
      const req = { query: { userId: 'user-1', limit: 'zero' } };
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'limit must be a positive integer' });
      assert.equal(service.listSessions.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('passes filter params through to the service', async () => {
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(async () => [{ id: 'session-1' }]),
        summarizeSessionsByDate: mock.fn(),
      };
      const { listSessions } = createSessionsController(service);
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
      assert.deepEqual(service.listSessions.mock.calls[0].arguments[0], {
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
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(async () => {
          throw error;
        }),
        summarizeSessionsByDate: mock.fn(),
      };
      const { listSessions } = createSessionsController(service);
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
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(),
      };
      const { getSessionsSummary } = createSessionsController(service);
      const req = { query: {} };
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(req, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(service.summarizeSessionsByDate.mock.calls.length, 0);
    });

    it('returns summary data from the service', async () => {
      const summary = { totalTimeStudied: 3_600_000, timesStudied: 2 };
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(async () => summary),
      };
      const { getSessionsSummary } = createSessionsController(service);
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
      assert.deepEqual(service.summarizeSessionsByDate.mock.calls[0].arguments[0], {
        userId: 'user-1',
        from: '2024-01-01',
        to: '2024-01-07',
        status: 'completed',
      });
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next', async () => {
      const error = new Error('summary failed');
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
        summarizeSessionsByDate: mock.fn(async () => {
          throw error;
        }),
      };
      const { getSessionsSummary } = createSessionsController(service);
      const req = { query: { userId: 'user-1' } };
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(req, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });
});
