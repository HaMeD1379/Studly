/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.service.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit coverage for the Sessions service. The new schema returned by the
 *  frontend now expects millisecond-based timestamps and durations, so these
 *  tests focus on verifying the service:
 *   • Maps canonical payloads to the Supabase column names that exist today.
 *   • Translates Supabase rows back into the frontend contract.
 *   • Applies in-memory filtering/sorting when Supabase cannot natively do so.
 *   • Surfaces descriptive errors when Supabase rejects the request.
 *
 *  Implementation Notes
 *  --------------------
 *  • We pass a fixed list of session columns to the service factory so that it
 *    does not attempt to query `information_schema.columns` in tests.
 *  • Supabase builders are mocked with lightweight objects that implement a
 *    `then` method, allowing `await` to work exactly as the real client.
 *  • Durations are stored in milliseconds on the database, mirroring the new
 *    frontend contract.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { createSessionsService } from '../../src/services/sessions.service.js';

const SESSION_COLUMNS = [
  'id',
  'user_id',
  'subject',
  'status',
  'start_study_timestamp',
  'end_study_timestamp',
  'session_length_millis',
  'target_duration_millis',
  'notes',
  'created_at',
  'updated_at',
];

const createAwaitable = (result) => Promise.resolve(result);

describe('sessions.service', () => {
  describe('createSession', () => {
    it('maps canonical payloads into Supabase columns and returns frontend shape', async () => {
      const createdRow = {
        id: 'session-1',
        user_id: 'user-1',
        subject: 'Math',
        status: 'in_progress',
        start_study_timestamp: '2024-01-01T00:00:00.000Z',
        target_duration_millis: 1_800_000,
        session_length_millis: null,
        end_study_timestamp: null,
        notes: null,
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
        startTimestamp: '2024-01-01T00:00:00.000Z',
        targetDurationMillis: 1_800_000,
        status: 'in_progress',
      });

      assert.deepEqual(insert.lastPayload, {
        user_id: 'user-1',
        subject: 'Math',
        status: 'in_progress',
        start_study_timestamp: '2024-01-01T00:00:00.000Z',
        target_duration_millis: 1_800_000,
      });
      assert.equal(result.id, 'session-1');
      assert.equal(result.userId, 'user-1');
      assert.equal(result.targetDurationMillis, 1_800_000);
      assert.equal(result.sessionLength, null);
      assert.equal(result.endStudyTimestamp, null);
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
            startTimestamp: '2024-01-02T00:00:00.000Z',
            targetDurationMillis: 900_000,
            status: 'in_progress',
          }),
        /Failed to create session: constraint violation/,
      );
    });
  });

  describe('completeSession', () => {
    it('updates Supabase columns using millisecond payloads', async () => {
      const updatedRow = {
        id: 'session-1',
        user_id: 'user-1',
        status: 'completed',
        end_study_timestamp: '2024-01-01T00:10:00.000Z',
        session_length_millis: 600_000,
        target_duration_millis: 1_800_000,
        notes: 'Great focus',
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
        status: 'completed',
        endStudyTimestamp: '2024-01-01T00:10:00.000Z',
        sessionLengthMillis: 600_000,
        notes: 'Great focus',
      });

      assert.deepEqual(update.lastPayload, {
        status: 'completed',
        end_study_timestamp: '2024-01-01T00:10:00.000Z',
        session_length_millis: 600_000,
        notes: 'Great focus',
      });
      assert.deepEqual(eq.mock.calls[0].arguments, ['id', 'session-1']);
      assert.equal(result.sessionLength, 600_000);
      assert.equal(result.targetDurationMillis, 1_800_000);
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
        status: 'completed',
        endStudyTimestamp: '2024-01-01T00:10:00.000Z',
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
            status: 'completed',
            endStudyTimestamp: '2024-01-01T00:10:00.000Z',
          }),
        /Failed to complete session: permission denied/,
      );
    });
  });

  describe('listSessions', () => {
    const createSelectBuilder = (rows, error = null) => {
      const result = { data: rows, error };
      const builder = createAwaitable(result);
      builder.select = mock.fn(() => builder);
      builder.eq = mock.fn(() => builder);
      return builder;
    };

    it('applies filters, performs in-memory range filtering, and sorts by end time', async () => {
      const rows = [
        {
          id: 'session-1',
          user_id: 'user-1',
          subject: 'Math',
          status: 'completed',
          end_study_timestamp: '2024-01-02T00:00:00.000Z',
          session_length_millis: 600_000,
          target_duration_millis: 1_800_000,
          notes: 'Great focus',
        },
        {
          id: 'session-2',
          user_id: 'user-1',
          subject: 'Physics',
          status: 'completed',
          end_study_timestamp: '2024-01-01T00:00:00.000Z',
          session_length_millis: 300_000,
          target_duration_millis: 1_200_000,
          notes: null,
        },
      ];

      const builder = createSelectBuilder(rows);
      const from = mock.fn(() => builder);

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const result = await service.listSessions({
        userId: 'user-1',
        subject: 'Math',
        status: 'completed',
        endedAfter: '2024-01-01T12:00:00.000Z',
        endedBefore: '2024-01-03T00:00:00.000Z',
        limit: 1,
      });

      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['subject', 'Math']);
      assert.deepEqual(builder.eq.mock.calls[2].arguments, ['status', 'completed']);
      assert.equal(result.length, 1);
      assert.equal(result[0].id, 'session-1');
      assert.equal(result[0].sessionLength, 600_000);
      assert.equal(result[0].targetDurationMillis, 1_800_000);
    });

    it('propagates Supabase errors', async () => {
      const builder = createSelectBuilder(null, { message: 'timeout' });
      const from = mock.fn(() => builder);

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      await assert.rejects(() => service.listSessions({ userId: 'user-1' }), /Failed to list sessions: timeout/);
    });
  });

  describe('summarizeSessionsByDate', () => {
    const createSelectBuilder = (rows, error = null) => {
      const result = { data: rows, error };
      const builder = createAwaitable(result);
      builder.select = mock.fn(() => builder);
      builder.eq = mock.fn(() => builder);
      return builder;
    };

    it('sums millisecond durations and counts filtered sessions', async () => {
      const rows = [
        {
          user_id: 'user-1',
          status: 'completed',
          end_study_timestamp: '2024-01-02T00:00:00.000Z',
          session_length_millis: 600_000,
        },
        {
          user_id: 'user-1',
          status: 'completed',
          end_study_timestamp: '2024-01-01T12:00:00.000Z',
          session_length_millis: 300_000,
        },
        {
          user_id: 'user-1',
          status: 'cancelled',
          end_study_timestamp: '2024-01-02T06:00:00.000Z',
          session_length_millis: 100_000,
        },
      ];

      const builder = createSelectBuilder(rows);
      const from = mock.fn(() => builder);

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      const summary = await service.summarizeSessionsByDate({
        userId: 'user-1',
        from: '2024-01-01T18:00:00.000Z',
        to: '2024-01-03T00:00:00.000Z',
        status: 'completed',
      });

      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['status', 'completed']);
      assert.equal(summary.totalTimeStudied, 600_000);
      assert.equal(summary.timesStudied, 1);
    });

    it('throws a descriptive error when Supabase fails', async () => {
      const builder = createSelectBuilder(null, { message: 'boom' });
      const from = mock.fn(() => builder);

      const client = { from };
      const service = createSessionsService(client, { sessionColumns: SESSION_COLUMNS });

      await assert.rejects(
        () => service.summarizeSessionsByDate({ userId: 'user-1', status: 'completed' }),
        /Failed to summarize sessions: boom/,
      );
    });
  });
});
