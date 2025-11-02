/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.service.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit coverage for the Sessions service using the study-session schema defined
 *  in Supabase. The suite validates that:
 *   • API payloads map to the `sessions` table columns (start/end timestamps,
 *     numeric session types, total minutes).
 *   • Supabase rows are normalised back into the API contract.
 *   • Filters for type/date/limit propagate correctly to Supabase builders and
 *     fall back to in-memory filtering when necessary.
 *   • Aggregations convert Supabase responses into dashboard-friendly numbers.
 *
 *  Implementation Notes
 *  --------------------
 *  • We provide a deterministic column list to avoid information_schema lookups.
 *  • Supabase builders are mocked with lightweight awaitables so we can assert on
 *    the chained method calls (eq/gte/lte/select/maybeSingle).
 *  • Numeric comparisons use Number(...) to mirror production coercion logic.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { createSessionsService } from '../../src/services/sessions.service.js';

const SESSION_COLUMNS = [
  'id',
  'user_id',
  'subject',
  'session_type',
  'start_time',
  'end_time',
  'total_time',
  'date',
  'session_goal',
  'inserted_at',
  'updated_at',
];

const createAwaitable = (result) => Promise.resolve(result);

const createSelectBuilder = (rows, error = null) => {
  const result = { data: rows, error };
  const builder = createAwaitable(result);
  builder.select = mock.fn(() => builder);
  builder.eq = mock.fn(() => builder);
  builder.gte = mock.fn(() => builder);
  builder.lte = mock.fn(() => builder);
  return builder;
};

describe('sessions.service', () => {
  describe('createSession', () => {
    it('maps canonical payloads into Supabase columns and returns frontend shape', async () => {
      const createdRow = {
        id: 'session-1',
        user_id: 'user-1',
        subject: 'Math',
        session_type: 1,
        start_time: '2024-01-01T00:00:00.000Z',
        end_time: '2024-01-01T01:00:00.000Z',
        total_time: 60,
        session_goal: 'Practice problems',
        inserted_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T01:00:00.000Z',
      };

      const single = mock.fn(async () => ({ data: createdRow, error: null }));
      const select = mock.fn(() => ({ single }));
      const insert = mock.fn((payload) => {
        insert.lastPayload = payload;
        return { select };
      });
      const from = mock.fn((table) => {
        assert.equal(table, 'sessions');
        return { insert };
      });

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const result = await service.createSession({
        userId: 'user-1',
        subject: 'Math',
        sessionType: 1,
        startTime: '2024-01-01T00:00:00.000Z',
        endTime: '2024-01-01T01:00:00.000Z',
        totalMinutes: 60,
        sessionGoal: 'Practice problems',
        date: '2024-01-01',
      });

      assert.deepEqual(insert.lastPayload, {
        user_id: 'user-1',
        subject: 'Math',
        session_type: 1,
        start_time: '2024-01-01T00:00:00.000Z',
        end_time: '2024-01-01T01:00:00.000Z',
        total_time: 60,
        session_goal: 'Practice problems',
        date: '2024-01-01',
      });
      assert.equal(result.id, 'session-1');
      assert.equal(result.userId, 'user-1');
      assert.equal(result.sessionType, 1);
      assert.equal(result.totalMinutes, 60);
      assert.equal(result.startTime, '2024-01-01T00:00:00.000Z');
      assert.equal(result.endTime, '2024-01-01T01:00:00.000Z');
    });

    it('throws a descriptive error when Supabase rejects the insert', async () => {
      const single = mock.fn(async () => ({ data: null, error: { message: 'constraint violation' } }));
      const select = mock.fn(() => ({ single }));
      const insert = mock.fn(() => ({ select }));
      const from = mock.fn(() => ({ insert }));

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      await assert.rejects(
        () =>
          service.createSession({
            userId: 'user-1',
            subject: 'Physics',
            sessionType: 2,
            startTime: '2024-01-02T00:00:00.000Z',
            endTime: '2024-01-02T01:00:00.000Z',
          }),
        /Failed to create session: constraint violation/,
      );
    });
  });

  describe('completeSession', () => {
    it('updates Supabase columns and normalises the response', async () => {
      const updatedRow = {
        id: 'session-1',
        user_id: 'user-1',
        subject: 'Math',
        session_type: 2,
        start_time: '2024-01-01T00:00:00.000Z',
        end_time: '2024-01-01T02:00:00.000Z',
        total_time: 120,
        session_goal: 'Review chapter',
      };

      const maybeSingle = mock.fn(async () => ({ data: updatedRow, error: null }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn((payload) => {
        update.lastPayload = payload;
        return { eq };
      });
      const from = mock.fn(() => ({ update }));

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const result = await service.completeSession('session-1', {
        sessionType: 2,
        endTime: '2024-01-01T02:00:00.000Z',
        totalMinutes: 120,
        sessionGoal: 'Review chapter',
      });

      assert.deepEqual(update.lastPayload, {
        session_type: 2,
        end_time: '2024-01-01T02:00:00.000Z',
        total_time: 120,
        session_goal: 'Review chapter',
      });
      assert.deepEqual(eq.mock.calls[0].arguments, ['id', 'session-1']);
      assert.equal(result.totalMinutes, 120);
      assert.equal(result.sessionGoal, 'Review chapter');
      assert.equal(result.sessionType, 2);
    });

    it('returns null when no session matches the provided id', async () => {
      const maybeSingle = mock.fn(async () => ({ data: null, error: null }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn(() => ({ eq }));
      const from = mock.fn(() => ({ update }));

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const result = await service.completeSession('missing-id', {
        endTime: '2024-01-01T02:00:00.000Z',
      });

      assert.equal(result, null);
    });

    it('throws a descriptive error when Supabase update fails', async () => {
      const maybeSingle = mock.fn(async () => ({ data: null, error: { message: 'permission denied' } }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn(() => ({ eq }));
      const from = mock.fn(() => ({ update }));

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      await assert.rejects(
        () =>
          service.completeSession('session-1', {
            endTime: '2024-01-01T02:00:00.000Z',
          }),
        /Failed to complete session: permission denied/,
      );
    });
  });

  describe('listSessions', () => {
    it('applies filters, performs range filtering, and sorts by end time', async () => {
      const rows = [
        {
          id: 'session-1',
          user_id: 'user-1',
          subject: 'History',
          session_type: 1,
          start_time: '2024-01-01T00:00:00.000Z',
          end_time: '2024-01-01T01:00:00.000Z',
          total_time: 60,
        },
        {
          id: 'session-2',
          user_id: 'user-1',
          subject: 'History',
          session_type: 1,
          start_time: '2024-01-02T00:00:00.000Z',
          end_time: '2024-01-02T02:30:00.000Z',
          total_time: 150,
        },
        {
          id: 'session-3',
          user_id: 'user-2',
          subject: 'History',
          session_type: 1,
          start_time: '2024-01-01T00:00:00.000Z',
          end_time: '2024-01-01T00:30:00.000Z',
          total_time: 30,
        },
      ];

      const builder = createSelectBuilder(rows);
      const from = mock.fn(() => builder);
      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const result = await service.listSessions({
        userId: 'user-1',
        subject: 'History',
        sessionType: 1,
        from: '2024-01-01T12:00:00.000Z',
        to: '2024-01-03T00:00:00.000Z',
        limit: 1,
      });

      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['subject', 'History']);
      assert.deepEqual(builder.eq.mock.calls[2].arguments, ['session_type', 1]);
      assert.ok(builder.gte.mock.calls.length >= 1);
      assert.ok(builder.lte.mock.calls.length >= 1);

      assert.equal(result.length, 1);
      assert.equal(result[0].id, 'session-2');
      assert.equal(result[0].totalMinutes, 150);
    });

    it('surfaces Supabase list errors', async () => {
      const builder = createSelectBuilder(null, { message: 'list exploded' });
      const from = mock.fn(() => builder);
      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      await assert.rejects(
        () => service.listSessions({ userId: 'user-1' }),
        /Failed to list sessions: list exploded/,
      );
    });
  });

  describe('summarizeSessionsByDate', () => {
    it('aggregates total minutes and session counts', async () => {
      const rows = [
        {
          id: 'session-1',
          user_id: 'user-1',
          session_type: 2,
          end_time: '2024-01-01T01:00:00.000Z',
          total_time: 60,
        },
        {
          id: 'session-2',
          user_id: 'user-1',
          session_type: 2,
          end_time: '2024-01-02T03:00:00.000Z',
          total_time: 180,
        },
      ];

      const builder = createSelectBuilder(rows);
      const from = mock.fn(() => builder);
      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const summary = await service.summarizeSessionsByDate({
        userId: 'user-1',
        sessionType: 2,
        from: '2024-01-01T00:00:00.000Z',
        to: '2024-01-03T00:00:00.000Z',
      });

      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['session_type', 2]);
      assert.ok(builder.gte.mock.calls.length >= 1);
      assert.ok(builder.lte.mock.calls.length >= 1);

      assert.equal(summary.totalMinutesStudied, 240);
      assert.equal(summary.sessionsLogged, 2);
    });

    it('surfaces Supabase errors during aggregation', async () => {
      const builder = createSelectBuilder(null, { message: 'summary exploded' });
      const from = mock.fn(() => builder);
      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      await assert.rejects(
        () => service.summarizeSessionsByDate({ userId: 'user-1' }),
        /Failed to summarize sessions: summary exploded/,
      );
    });
  });
});
