/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.controller.test.js
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the Sessions controller using Node's built-in test runner.
 *  Verifies validation, payload mapping, and error propagation for the study
 *  session endpoints.
 *
 *  Notes
 *  -----
 *  • A lightweight response stub captures status codes and JSON bodies.
 *  • The sessions service is mocked to assert on the canonical payloads the
 *    controller forwards downstream.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { createSessionsController } from '../../src/controllers/sessions.controller.js';

const createMockResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const createMockService = () => ({
  createSession: mock.fn(),
  completeSession: mock.fn(),
  listSessions: mock.fn(),
  summarizeSessionsByDate: mock.fn(),
});

describe('sessions.controller', () => {
  describe('startSession', () => {
    it('validates required fields', async () => {
      const service = createMockService();
      const { startSession } = createSessionsController(service);
      const next = mock.fn();

      const cases = [
        { body: { subject: 'Math', sessionType: 1, startTime: '2024-01-01T00:00:00.000Z', endTime: '2024-01-01T00:30:00.000Z' }, error: 'userId is required' },
        { body: { userId: 'user-1', sessionType: 1, startTime: '2024-01-01T00:00:00.000Z', endTime: '2024-01-01T00:30:00.000Z' }, error: 'subject is required' },
        { body: { userId: 'user-1', subject: 'Math', startTime: '2024-01-01T00:00:00.000Z', endTime: '2024-01-01T00:30:00.000Z' }, error: 'sessionType is required' },
        { body: { userId: 'user-1', subject: 'Math', sessionType: 1, endTime: '2024-01-01T00:30:00.000Z' }, error: 'startTime is required' },
        { body: { userId: 'user-1', subject: 'Math', sessionType: 1, startTime: '2024-01-01T00:00:00.000Z' }, error: 'endTime is required' },
      ];

      for (const { body, error } of cases) {
        const res = createMockResponse();
        await startSession({ body }, res, next);
        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.body, { error });
      }
      assert.equal(service.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 400 for invalid timestamps or sessionType', async () => {
      const service = createMockService();
      const { startSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(
        {
          body: {
            userId: 'user-1',
            subject: 'Math',
            sessionType: 1,
            startTime: 'not-a-date',
            endTime: '2024-01-01T00:30:00.000Z',
          },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 400);
      assert.match(res.body.error, /startTime must be a valid ISO 8601 timestamp/);
      assert.equal(service.createSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards canonical payload to the service and computes totalMinutes', async () => {
      const service = createMockService();
      const created = { id: 'session-1' };
      service.createSession = mock.fn(async () => created);

      const { startSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(
        {
          body: {
            userId: 'user-1',
            subject: 'Biology',
            sessionType: 2,
            startTime: '2024-01-01T00:00:00.000Z',
            endTime: '2024-01-01T01:30:00.000Z',
            sessionGoal: 'Read chapter',
          },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 201);
      assert.equal(service.createSession.mock.calls.length, 1);
      assert.deepEqual(service.createSession.mock.calls[0].arguments[0], {
        userId: 'user-1',
        subject: 'Biology',
        sessionType: 2,
        sessionGoal: 'Read chapter',
        startTime: '2024-01-01T00:00:00.000Z',
        endTime: '2024-01-01T01:30:00.000Z',
        totalMinutes: 90,
        date: undefined,
      });
      assert.equal(res.body.session, created);
      assert.equal(next.mock.calls.length, 0);
    });

    it('forwards service errors to next', async () => {
      const service = createMockService();
      const error = new Error('database offline');
      service.createSession = mock.fn(async () => {
        throw error;
      });

      const { startSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await startSession(
        {
          body: {
            userId: 'user-1',
            subject: 'Math',
            sessionType: 1,
            startTime: '2024-01-01T00:00:00.000Z',
            endTime: '2024-01-01T00:30:00.000Z',
          },
        },
        res,
        next,
      );

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('completeSession', () => {
    it('validates sessionId and payload presence', async () => {
      const service = createMockService();
      const { completeSession } = createSessionsController(service);
      const next = mock.fn();

      const missingIdRes = createMockResponse();
      await completeSession({ params: {}, body: {} }, missingIdRes, next);
      assert.equal(missingIdRes.statusCode, 400);
      assert.deepEqual(missingIdRes.body, { error: 'sessionId is required' });

      const noFieldsRes = createMockResponse();
      await completeSession({ params: { sessionId: 'session-1' }, body: {} }, noFieldsRes, next);
      assert.equal(noFieldsRes.statusCode, 400);
      assert.match(noFieldsRes.body.error, /At least one field must be provided/);

      assert.equal(service.completeSession.mock.calls.length, 0);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 400 for invalid timestamp updates', async () => {
      const service = createMockService();
      const { completeSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(
        {
          params: { sessionId: 'session-1' },
          body: { endTime: 'not-a-date' },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 400);
      assert.match(res.body.error, /endTime must be a valid ISO 8601 timestamp/);
      assert.equal(service.completeSession.mock.calls.length, 0);
    });

    it('forwards updates to the service and recomputes totalMinutes when needed', async () => {
      const service = createMockService();
      const updated = { id: 'session-1', totalMinutes: 75 };
      service.completeSession = mock.fn(async () => updated);

      const { completeSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(
        {
          params: { sessionId: 'session-1' },
          body: {
            startTime: '2024-01-01T00:00:00.000Z',
            endTime: '2024-01-01T01:15:00.000Z',
            sessionGoal: 'Wrap up',
          },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 200);
      assert.equal(service.completeSession.mock.calls.length, 1);
      assert.deepEqual(service.completeSession.mock.calls[0].arguments, [
        'session-1',
        {
          startTime: '2024-01-01T00:00:00.000Z',
          endTime: '2024-01-01T01:15:00.000Z',
          sessionGoal: 'Wrap up',
          totalMinutes: 75,
        },
      ]);
      assert.equal(res.body.session, updated);
      assert.equal(next.mock.calls.length, 0);
    });

    it('returns 404 when the service cannot find the session', async () => {
      const service = createMockService();
      service.completeSession = mock.fn(async () => null);

      const { completeSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(
        {
          params: { sessionId: 'missing' },
          body: { endTime: '2024-01-01T00:30:00.000Z' },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.body, { error: 'Session not found' });
    });

    it('forwards service errors to next', async () => {
      const service = createMockService();
      const error = new Error('update failed');
      service.completeSession = mock.fn(async () => {
        throw error;
      });

      const { completeSession } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await completeSession(
        {
          params: { sessionId: 'session-1' },
          body: { endTime: '2024-01-01T00:30:00.000Z' },
        },
        res,
        next,
      );

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('listSessions', () => {
    it('requires the userId query parameter', async () => {
      const service = createMockService();
      const { listSessions } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions({ query: {} }, res, next);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(service.listSessions.mock.calls.length, 0);
    });

    it('passes filter params through to the service', async () => {
      const service = createMockService();
      service.listSessions = mock.fn(async () => []);

      const { listSessions } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions(
        {
          query: {
            userId: 'user-1',
            subject: 'Math',
            sessionType: '2',
            from: '2024-01-01T00:00:00.000Z',
            to: '2024-01-02T00:00:00.000Z',
            limit: '5',
          },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 200);
      assert.deepEqual(service.listSessions.mock.calls[0].arguments[0], {
        userId: 'user-1',
        subject: 'Math',
        sessionType: 2,
        from: '2024-01-01T00:00:00.000Z',
        to: '2024-01-02T00:00:00.000Z',
        limit: 5,
      });
    });

    it('forwards errors to next', async () => {
      const service = createMockService();
      const error = new Error('list failed');
      service.listSessions = mock.fn(async () => {
        throw error;
      });

      const { listSessions } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await listSessions({ query: { userId: 'user-1' } }, res, next);

      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });

  describe('getSessionsSummary', () => {
    it('requires userId', async () => {
      const service = createMockService();
      const { getSessionsSummary } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary({ query: {} }, res, next);
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'userId query parameter is required' });
      assert.equal(service.summarizeSessionsByDate.mock.calls.length, 0);
    });

    it('forwards parameters to the service and returns enriched summary', async () => {
      const service = createMockService();
      service.summarizeSessionsByDate = mock.fn(async () => ({
        totalMinutesStudied: 120,
        sessionsLogged: 3,
        subjectSummaries: [
          { subject: 'Math', totalMinutesStudied: 90, sessionsLogged: 2 },
          { subject: 'History', totalMinutesStudied: 30, sessionsLogged: 1 },
        ],
      }));

      const { getSessionsSummary } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(
        {
          query: {
            userId: 'user-1',
            sessionType: '3',
            from: '2024-01-01T00:00:00.000Z',
            to: '2024-01-07T00:00:00.000Z',
          },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 200);
      assert.deepEqual(service.summarizeSessionsByDate.mock.calls[0].arguments[0], {
        userId: 'user-1',
        sessionType: 3,
        from: '2024-01-01T00:00:00.000Z',
        to: '2024-01-07T00:00:00.000Z',
      });
      assert.deepEqual(res.body, {
        totalMinutesStudied: 120,
        sessionsLogged: 3,
        subjectSummaries: [
          { subject: 'Math', totalMinutesStudied: 90, sessionsLogged: 2 },
          { subject: 'History', totalMinutesStudied: 30, sessionsLogged: 1 },
        ],
        averageMinutesPerSession: 40,
      });
    });

    it('computes averageMinutesPerSession as null when there are no sessions', async () => {
      const service = createMockService();
      service.summarizeSessionsByDate = mock.fn(async () => ({
        totalMinutesStudied: 0,
        sessionsLogged: 0,
        subjectSummaries: [],
      }));

      const { getSessionsSummary } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary(
        {
          query: {
            userId: 'user-1',
          },
        },
        res,
        next,
      );

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.body, {
        totalMinutesStudied: 0,
        sessionsLogged: 0,
        subjectSummaries: [],
        averageMinutesPerSession: null,
      });
    });

    it('forwards errors to next', async () => {
      const service = createMockService();
      const error = new Error('summary failed');
      service.summarizeSessionsByDate = mock.fn(async () => {
        throw error;
      });

      const { getSessionsSummary } = createSessionsController(service);
      const res = createMockResponse();
      const next = mock.fn();

      await getSessionsSummary({ query: { userId: 'user-1' } }, res, next);
      assert.equal(next.mock.calls.length, 1);
      assert.equal(next.mock.calls[0].arguments[0], error);
    });
  });
});
