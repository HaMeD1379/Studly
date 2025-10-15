/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.service.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-16
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the Sessions service layer. These tests exercise the query
 *  builder interactions with a mocked Supabase client to ensure:
 *    • Correct table/column names are used
 *    • Happy-path records are returned to callers with camelCase conversions
 *    • Failures throw descriptive errors for controller middleware to handle
 *    • Aggregation helpers compute dashboard metrics in milliseconds
 *
 *  NOTE: We rely on Node's built-in test runner (`node:test`) and its mocking
 *  utilities so no additional testing frameworks are required.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { createSessionsService } from '../../src/services/sessions.service.js';

describe('sessions.service', () => {
  describe('createSession', () => {
    it('inserts into the sessions table and returns a camelCase session', async () => {
      const created = {
        id: 'session-1',
        user_id: 'user-1',
        subject: 'Math',
        status: 'in_progress',
        started_at: '2024-01-01T00:00:00.000Z',
        target_duration_minutes: 1.5,
        duration_minutes: null,
        ended_at: null,
      };

      const single = mock.fn(async () => ({ data: created, error: null }));
      const select = mock.fn(() => ({ single }));
      const insert = mock.fn(() => ({ select }));
      const from = mock.fn(() => ({ insert }));
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.createSession({ subject: 'Math' });

      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(insert.mock.calls[0].arguments[0], { subject: 'Math' });
      assert.equal(result.id, 'session-1');
      assert.equal(result.targetDurationMillis, 90_000);
      assert.equal(result.sessionLength, null);
    });

    it('throws a descriptive error when Supabase returns an error', async () => {
      const single = mock.fn(async () => ({ data: null, error: { message: 'row violates constraint' } }));
      const select = mock.fn(() => ({ single }));
      const insert = mock.fn(() => ({ select }));
      const from = mock.fn(() => ({ insert }));
      const client = { from };

      const service = createSessionsService(client);

      await assert.rejects(
        () => service.createSession({ subject: 'Physics' }),
        /Failed to create session: row violates constraint/,
      );
    });
  });

  describe('completeSession', () => {
    it('updates the targeted session and returns camelCase data', async () => {
      const updated = {
        id: 'session-1',
        user_id: 'user-1',
        status: 'completed',
        ended_at: '2024-01-01T00:10:00.000Z',
        duration_minutes: 10,
        target_duration_minutes: 30,
      };

      const maybeSingle = mock.fn(async () => ({ data: updated, error: null }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn(() => ({ eq }));
      const from = mock.fn(() => ({ update }));
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.completeSession('session-1', { status: 'completed' });

      assert.deepEqual(update.mock.calls[0].arguments[0], { status: 'completed' });
      assert.deepEqual(eq.mock.calls[0].arguments, ['id', 'session-1']);
      assert.equal(result.sessionLength, 600_000);
      assert.equal(result.targetDurationMillis, 1_800_000);
    });

    it('returns null when Supabase finds no matching session', async () => {
      const maybeSingle = mock.fn(async () => ({ data: null, error: null }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn(() => ({ eq }));
      const from = mock.fn(() => ({ update }));
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.completeSession('missing-id', { status: 'completed' });

      assert.equal(result, null);
    });

    it('throws a descriptive error when Supabase update fails', async () => {
      const maybeSingle = mock.fn(async () => ({ data: null, error: { message: 'permission denied' } }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn(() => ({ eq }));
      const from = mock.fn(() => ({ update }));
      const client = { from };

      const service = createSessionsService(client);

      await assert.rejects(
        () => service.completeSession('session-1', { status: 'completed' }),
        /Failed to complete session: permission denied/,
      );
    });
  });

  describe('listSessions', () => {
    it('applies filters, ordering, and maps rows to camelCase', async () => {
      const rows = [
        {
          id: 'session-1',
          user_id: 'user-1',
          subject: 'Math',
          status: 'completed',
          ended_at: '2024-01-02T00:00:00.000Z',
          duration_minutes: 10,
          target_duration_minutes: 30,
          notes: 'Great focus',
        },
      ];

      const order = mock.fn(async () => ({ data: rows, error: null }));
      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
        gte: mock.fn(() => builder),
        lte: mock.fn(() => builder),
        limit: mock.fn(() => builder),
        order,
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.listSessions({
        userId: 'user-1',
        subject: 'Math',
        status: 'completed',
        endedAfter: '2024-01-01T00:00:00.000Z',
        endedBefore: '2024-01-03T00:00:00.000Z',
        limit: 5,
      });

      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['subject', 'Math']);
      assert.deepEqual(builder.eq.mock.calls[2].arguments, ['status', 'completed']);
      assert.deepEqual(builder.gte.mock.calls[0].arguments, ['ended_at', '2024-01-01T00:00:00.000Z']);
      assert.deepEqual(builder.lte.mock.calls[0].arguments, ['ended_at', '2024-01-03T00:00:00.000Z']);
      assert.deepEqual(builder.limit.mock.calls[0].arguments, [5]);
      assert.deepEqual(order.mock.calls[0].arguments, ['ended_at', { ascending: false, nullsFirst: false }]);
      assert.equal(result[0].sessionLength, 600_000);
      assert.equal(result[0].targetDurationMillis, 1_800_000);
      assert.equal(result[0].notes, 'Great focus');
    });

    it('returns an empty array when Supabase yields no rows', async () => {
      const order = mock.fn(async () => ({ data: null, error: null }));
      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
        gte: mock.fn(() => builder),
        lte: mock.fn(() => builder),
        limit: mock.fn(() => builder),
        order,
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.listSessions();

      assert.deepEqual(result, []);
    });

    it('throws a descriptive error when the query fails', async () => {
      const order = mock.fn(async () => ({ data: null, error: { message: 'timeout' } }));
      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
        gte: mock.fn(() => builder),
        lte: mock.fn(() => builder),
        limit: mock.fn(() => builder),
        order,
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);

      await assert.rejects(() => service.listSessions(), /Failed to list sessions: timeout/);
    });
  });

  describe('summarizeSessionsByDate', () => {
    it('aggregates total duration in milliseconds and counts sessions', async () => {
      const rows = [
        { duration_minutes: 10, status: 'completed', ended_at: '2024-01-01T01:00:00.000Z' },
        { duration_minutes: 5.5, status: 'completed', ended_at: '2024-01-01T02:00:00.000Z' },
      ];

      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
        gte: mock.fn(() => builder),
        lte: mock.fn(() => ({ data: rows, error: null })),
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);

      const summary = await service.summarizeSessionsByDate({
        userId: 'user-1',
        from: '2024-01-01',
        to: '2024-01-02',
        status: 'completed',
      });

      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(builder.select.mock.calls[0].arguments, ['duration_minutes, ended_at, status']);
      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['status', 'completed']);
      assert.deepEqual(builder.gte.mock.calls[0].arguments, ['ended_at', '2024-01-01']);
      assert.deepEqual(builder.lte.mock.calls[0].arguments, ['ended_at', '2024-01-02']);
      assert.equal(summary.totalTimeStudied, 930_000);
      assert.equal(summary.timesStudied, 2);
    });

    it('throws a descriptive error when the summary query fails', async () => {
      const result = { data: null, error: { message: 'boom' } };
      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
        gte: mock.fn(() => builder),
        lte: mock.fn(() => builder),
        then(onFulfilled, onRejected) {
          try {
            const value = onFulfilled ? onFulfilled(result) : result;
            return Promise.resolve(value);
          } catch (error) {
            return onRejected ? Promise.resolve(onRejected(error)) : Promise.reject(error);
          }
        },
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);

      await assert.rejects(
        () => service.summarizeSessionsByDate({ userId: 'user-1' }),
        /Failed to summarize sessions: boom/,
      );
    });
  });
});
