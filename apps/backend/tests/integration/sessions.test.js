/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/sessions.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-11-19
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  End-to-end coverage for the Sessions API using the native node:test runner.
 *  The suite exercises the full HTTP stack (Express app, routing, controller,
 *  service, and Supabase mock client) for all session endpoints:
 *
 *    • POST   /api/v1/sessions           → create a new session
 *    • PATCH  /api/v1/sessions/:id       → update/complete an existing session
 *    • GET    /api/v1/sessions           → list sessions for a user
 *    • GET    /api/v1/sessions/summary   → aggregate study metrics
 *
 *  Design Notes
 *  ------------
 *  • Reuses the shared Supabase mock client to avoid hitting real infra.
 *  • Seeds and resets the in-memory sessions table per test for isolation.
 *  • Uses a lightweight HTTP client helper to start/stop the Express app.
 *
 *  @module tests/integration/sessions
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import STRINGS from '../../src/config/strings.config.js';
import supabase from '../../src/config/supabase.client.js';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../../src/index.js');

const getSessionsTable = () => {
  // @ts-ignore — test-only mutation of supabase mock internals
  supabase.tables = supabase.tables || {};
  supabase.tables.sessions = supabase.tables.sessions || [];
  return supabase.tables.sessions;
};

const resetSessionsTable = () => {
  const table = getSessionsTable();
  table.length = 0;
};

const seedSessionRow = (overrides = {}) => {
  const table = getSessionsTable();
  const row = {
    id: overrides.id ?? `session-${table.length + 1}`,
    user_id: overrides.user_id ?? 'user-1',
    subject: Object.prototype.hasOwnProperty.call(overrides, 'subject')
      ? overrides.subject
      : 'Math',
    session_type: overrides.session_type ?? 1,
    start_time: overrides.start_time ?? '2025-01-01T00:00:00.000Z',
    end_time: overrides.end_time ?? '2025-01-01T01:00:00.000Z',
    total_time: overrides.total_time ?? 60,
    date: overrides.date ?? '2025-01-01',
    session_goal: overrides.session_goal ?? null,
    inserted_at: overrides.inserted_at ?? '2025-01-01T00:00:00.000Z',
    updated_at: overrides.updated_at ?? '2025-01-01T01:00:00.000Z',
  };

  table.push(row);
  return row;
};

let server;

beforeEach(() => {
  resetSessionsTable();
  // Start test server
  server = app.listen(0);
});

afterEach(() => {
  // Close server
  if (server) {
    server.close();
  }
});

const request = async (method, path, options = {}) => {
  const token = process.env.INTERNAL_API_TOKEN ?? STRINGS.MOCK.INTERNAL_API_TOKEN;
  const port = server.address().port;

  let fullUrl = `http://localhost:${port}${path}`;
  const { query, body } = options;

  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) fullUrl += `?${qs}`;
  }

  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-api-key': token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = undefined;
  }

  return { status: response.status, body: parsed };
};

test('POST /api/v1/sessions - should create a session and return the persisted payload', async () => {
  const response = await request('POST', STRINGS.API.SESSIONS_ROUTE, {
    body: {
      userId: 'user-1',
      subject: 'Math',
      sessionType: 1,
      startTime: '2025-01-01T00:00:00.000Z',
      endTime: '2025-01-01T01:30:00.000Z',
      sessionGoal: 'Integration test run',
    },
  });

  assert.equal(response.status, 201);
  assert.ok(response.body.session?.id, 'session id should be set');
  assert.equal(response.body.session.userId, 'user-1');
  assert.equal(response.body.session.subject, 'Math');
  assert.equal(response.body.session.totalMinutes, 90);
});

test('PATCH /api/v1/sessions/:id - should update an existing session and recalculate totalMinutes', async () => {
  const seeded = seedSessionRow({
    id: 'session-123',
    user_id: 'user-1',
    subject: 'Biology',
    total_time: 60,
  });

  const response = await request('PATCH', `${STRINGS.API.SESSIONS_ROUTE}/${seeded.id}`, {
    body: {
      startTime: '2025-01-01T00:00:00.000Z',
      endTime: '2025-01-01T02:00:00.000Z',
      sessionGoal: 'Extended study',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.session.id, 'session-123');
  assert.equal(response.body.session.totalMinutes, 120);
  assert.equal(response.body.session.sessionGoal, 'Extended study');
});

test('GET /api/v1/sessions - should list sessions for a user with filters applied', async () => {
  // Seed multiple sessions; only some should be returned
  seedSessionRow({ id: 's-1', user_id: 'user-1', subject: 'Math', total_time: 60 });
  seedSessionRow({ id: 's-2', user_id: 'user-1', subject: 'Math', total_time: 120 });
  seedSessionRow({ id: 's-3', user_id: 'user-2', subject: 'History', total_time: 30 });

  const response = await request('GET', STRINGS.API.SESSIONS_ROUTE, {
    query: {
      userId: 'user-1',
      subject: 'Math',
    },
  });

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.sessions));
  assert.equal(response.body.sessions.length, 2);
  assert.deepEqual(
    response.body.sessions.map((s) => s.id).sort(),
    ['s-1', 's-2'],
  );
});

test('GET /api/v1/sessions/summary - should return aggregate metrics and subject breakdown', async () => {
  // 2 Math (60 + 120), 1 History (30), 1 subjectless (15)
  seedSessionRow({ user_id: 'user-1', subject: 'Math', total_time: 60 });
  seedSessionRow({ user_id: 'user-1', subject: 'Math', total_time: 120 });
  seedSessionRow({ user_id: 'user-1', subject: 'History', total_time: 30 });
  seedSessionRow({ user_id: 'user-1', subject: null, total_time: 15 });

  const response = await request('GET', `${STRINGS.API.SESSIONS_ROUTE}/summary`, {
    query: {
      userId: 'user-1',
    },
  });

  assert.equal(response.status, 200);

  const { totalMinutesStudied, sessionsLogged, subjectSummaries, averageMinutesPerSession } =
    response.body;

  assert.equal(totalMinutesStudied, 225);
  assert.equal(sessionsLogged, 4);

  assert.deepEqual(subjectSummaries, [
    { subject: 'Math', totalMinutesStudied: 180, sessionsLogged: 2 },
    { subject: 'History', totalMinutesStudied: 30, sessionsLogged: 1 },
  ]);

  assert.equal(averageMinutesPerSession, 225 / 4);
});

test('GET /api/v1/sessions/summary - should return 400 when userId is missing', async () => {
  const response = await request('GET', `${STRINGS.API.SESSIONS_ROUTE}/summary`);
  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: 'userId query parameter is required',
  });
});

