/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/sessions.service.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Unit tests for the Sessions service layer. These tests exercise the query
 *  builder interactions with a mocked Supabase client to ensure:
 *    • Correct table/column names are used
 *    • Happy-path records are returned to callers
 *    • Failures throw descriptive errors for controller middleware to handle
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
    it('inserts into the sessions table and returns the created row', async () => {
      const created = { id: 'session-1', subject: 'Math' };

      const single = mock.fn(async () => ({ data: created, error: null }));
      const select = mock.fn(() => ({ single }));
      const insert = mock.fn(() => ({ select }));
      const from = mock.fn(() => ({ insert }));
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.createSession({ subject: 'Math' });

      assert.deepEqual(result, created);
      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(insert.mock.calls[0].arguments[0], { subject: 'Math' });
      assert.equal(single.mock.calls.length, 1);
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
        /Failed to create session: row violates constraint/
      );
    });
  });

  describe('completeSession', () => {
    it('updates the targeted session and returns the updated row', async () => {
      const updated = { id: 'session-1', status: 'completed' };

      const maybeSingle = mock.fn(async () => ({ data: updated, error: null }));
      const select = mock.fn(() => ({ maybeSingle }));
      const eq = mock.fn(() => ({ select }));
      const update = mock.fn(() => ({ eq }));
      const from = mock.fn(() => ({ update }));
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.completeSession('session-1', { status: 'completed' });

      assert.deepEqual(result, updated);
      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(update.mock.calls[0].arguments[0], { status: 'completed' });
      assert.deepEqual(eq.mock.calls[0].arguments, ['id', 'session-1']);
      assert.equal(maybeSingle.mock.calls.length, 1);
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
        /Failed to complete session: permission denied/
      );
    });
  });

  describe('listSessions', () => {
    it('applies filters and orders results by started_at descending', async () => {
      const expected = [{ id: 'session-1' }];

      const order = mock.fn(async () => ({ data: expected, error: null }));
      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
        order,
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);
      const result = await service.listSessions({ userId: 'user-1', subject: 'Math' });

      assert.deepEqual(result, expected);
      assert.equal(from.mock.calls[0].arguments[0], 'sessions');
      assert.deepEqual(builder.select.mock.calls[0].arguments, ['*']);
      assert.deepEqual(builder.eq.mock.calls[0].arguments, ['user_id', 'user-1']);
      assert.deepEqual(builder.eq.mock.calls[1].arguments, ['subject', 'Math']);
      assert.equal(order.mock.calls[0].arguments[0], 'started_at');
      assert.deepEqual(order.mock.calls[0].arguments[1], { ascending: false });
    });

    it('returns an empty array when Supabase yields no rows', async () => {
      const order = mock.fn(async () => ({ data: null, error: null }));
      const builder = {
        select: mock.fn(() => builder),
        eq: mock.fn(() => builder),
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
        order,
      };
      const from = mock.fn(() => builder);
      const client = { from };

      const service = createSessionsService(client);

      await assert.rejects(() => service.listSessions(), /Failed to list sessions: timeout/);
    });
  });
});

