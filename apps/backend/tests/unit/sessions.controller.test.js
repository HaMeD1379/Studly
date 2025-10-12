/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.controller.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-11
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the Sessions controller using Node’s built-in test runner.
 *  Verifies:
 *   • Input validation (400) conditions
 *   • Happy-path success responses (201/200)
 *   • Not found mapping (404)
 *   • Error propagation to `next` for centralized error handling
 *
 *  Notes
 *  -----
 *  • We inject a mock "service" to isolate controller behavior (DI-friendly).
 *  • Response object is a minimal stub with `status` and `json` to capture outputs.
 *
 *  TODOs
 *  -----
 *  • [NEGATIVE] Add tests for missing `subject` and missing `endedAt` paths.
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
  const res = {
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
  return res;
};

describe('sessions.controller', () => {
  // ────────────────────────────────────────────────────────────────────────────
  // startSession
  // ────────────────────────────────────────────────────────────────────────────
  describe('startSession', () => {
    it('returns 400 when userId is missing', async () => {
      // Arrange: service methods mocked but should not be called for invalid input
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
      const req = { body: { subject: 'Math' } };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await startSession(req, res, next);

      // Assert
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId is required' });
      assert.equal(service.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('creates a session and returns 201', async () => {
      // Arrange
      const createdSession = { id: 'session-1' };
      const service = {
        // Echo back a merged payload to simulate DB-returned record
        createSession: mock.fn(async (payload) => ({ ...createdSession, ...payload })),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
      const req = {
        body: {
          userId: 'user-1',
          subject: 'Biology',
          startedAt: '2024-01-01T00:00:00.000Z',
          targetDurationMinutes: 50,
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await startSession(req, res, next);

      // Assert
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.session.user_id, 'user-1');
      assert.equal(res.body.session.subject, 'Biology');
      assert.equal(res.body.session.status, 'in_progress');
      assert.equal(res.body.session.target_duration_minutes, 50);
      assert.equal(service.createSession.mock.calls.length, 1);
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next', async () => {
      // Arrange
      const error = new Error('database offline');
      const service = {
        createSession: mock.fn(async () => {
          throw error;
        }),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
      };
      const { startSession } = createSessionsController(service);
      const req = { body: { userId: 'user-1', subject: 'Math' } };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await startSession(req, res, next);

      // Assert
      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // completeSession
  // ────────────────────────────────────────────────────────────────────────────
  describe('completeSession', () => {
    it('returns 400 when session id missing', async () => {
      // Arrange
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = { params: {}, body: { endedAt: '2024-01-01T00:10:00.000Z' } };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await completeSession(req, res, next);

      // Assert
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'session id is required' });
      assert.equal(service.completeSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 404 when session not found', async () => {
      // Arrange
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(async () => null), // service returns null when no match
        listSessions: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = {
        params: { id: 'missing-session' },
        body: { endedAt: '2024-01-01T00:10:00.000Z' },
      };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await completeSession(req, res, next);

      // Assert
      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.body, { error: 'Session not found' });
      assert.equal(service.completeSession.mock.calls.length, 1);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 200 with updated session data', async () => {
      // Arrange
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(async () => ({ id: 'session-1', status: 'completed' })),
        listSessions: mock.fn(),
      };
      const { completeSession } = createSessionsController(service);
      const req = {
        params: { id: 'session-1' },
        body: {
          endedAt: '2024-01-01T00:10:00.000Z',
          durationMinutes: 10,
          notes: 'Felt productive',
        },
      };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await completeSession(req, res, next);

      // Assert (status & body)
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { session: { id: 'session-1', status: 'completed' } });

      // Assert (service call payload mapping camelCase → snake_case)
      assert.equal(service.completeSession.mock.calls.length, 1);
      const callArgs = service.completeSession.mock.calls[0].arguments;
      assert.equal(callArgs[0], 'session-1');
      assert.deepEqual(callArgs[1], {
        ended_at: '2024-01-01T00:10:00.000Z',
        duration_minutes: 10,
        notes: 'Felt productive',
        status: 'completed',
      });

      assert.equal(next.mock.calls.length, 0);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // listSessions
  // ────────────────────────────────────────────────────────────────────────────
  describe('listSessions', () => {
    it('requires the userId query parameter', async () => {
      // Arrange
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(),
      };
      const { listSessions } = createSessionsController(service);
      const req = { query: {} }; // missing userId
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await listSessions(req, res, next);

      // Assert
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(service.listSessions.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns sessions from the service', async () => {
      // Arrange
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(async () => [{ id: 'session-1' }]),
      };
      const { listSessions } = createSessionsController(service);
      const req = { query: { userId: 'user-1', subject: 'Math' } };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await listSessions(req, res, next);

      // Assert
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, { sessions: [{ id: 'session-1' }] });
      assert.equal(service.listSessions.mock.calls.length, 1);
      const callArgs = service.listSessions.mock.calls[0].arguments[0];
      assert.deepEqual(callArgs, { userId: 'user-1', subject: 'Math' });
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards errors to next', async () => {
      // Arrange
      const error = new Error('query failed');
      const service = {
        createSession: mock.fn(),
        completeSession: mock.fn(),
        listSessions: mock.fn(async () => {
          throw error;
        }),
      };
      const { listSessions } = createSessionsController(service);
      const req = { query: { userId: 'user-1' } };
      const res = createMockResponse();
      const next = mock.fn();

      // Act
      await listSessions(req, res, next);

      // Assert
      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });
});
