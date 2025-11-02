/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/integration/sessions.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-16
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Integration coverage for the sessions API router. The suite boots the Express
 *  application, overrides the Supabase client with an in-memory stub, and drives
 *  HTTP requests end-to-end using the built-in fetch implementation.
 *
 *  Features
 *  --------
 *  • Covers create, update, list, and summary flows for study sessions.
 *  • Exercises validation failures alongside Supabase error propagation.
 *  • Ensures timestamps and numeric fields (sessionType/totalMinutes) survive the
 *    HTTP boundary.
 *
 *  Design Principles
 *  -----------------
 *  • Reset stub state before each test for isolation.
 *  • Keep the mock minimal yet representative of real Supabase chaining.
 *  • Prefer descriptive test names for quick diagnosis.
 *
 *  TODOs
 *  -----
 *  • [AUTHZ] Add authenticated user context once auth middleware is wired.
 *  • [LOAD] Expand coverage for pagination edge cases (e.g., deep offsets).
 *
 *  @module tests/integration/sessions
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import supabase from '../../src/config/supabase.js';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../../src/index.js');

const originalFrom = supabase.from;

let sessionCounter = 1;
const sessionStore = [];
const behaviors = {
  insertError: null,
  updateError: null,
  listError: null,
  summaryError: null,
};

const resetBehaviors = () => {
  behaviors.insertError = null;
  behaviors.updateError = null;
  behaviors.listError = null;
  behaviors.summaryError = null;
};

const resetStore = () => {
  sessionStore.length = 0;
  sessionCounter = 1;
};

const makeRow = (payload) => {
  const now = new Date().toISOString();
  const row = {
    id: `session-${sessionCounter++}`,
    user_id: payload.user_id,
    subject: payload.subject,
    session_type: payload.session_type,
    start_time: payload.start_time,
    end_time: payload.end_time,
    total_time: payload.total_time ?? null,
    date: payload.date ?? now.slice(0, 10),
    session_goal: payload.session_goal ?? null,
    inserted_at: now,
    updated_at: now,
  };
  sessionStore.push(row);
  return row;
};

const applyFilters = (rows, filters) => {
  let result = [...rows];

  for (const { column, value } of filters.eq) {
    result = result.filter((row) => row[column] === value);
  }

  for (const { column, value } of filters.gte) {
    result = result.filter((row) => {
      if (!row[column]) return false;
      return row[column] >= value;
    });
  }

  for (const { column, value } of filters.lte) {
    result = result.filter((row) => {
      if (!row[column]) return false;
      return row[column] <= value;
    });
  }

  if (filters.order) {
    const { column, options } = filters.order;
    result.sort((a, b) => {
      const left = a[column];
      const right = b[column];
      if (left === right) return 0;
      if (left === null) return options?.nullsFirst ? -1 : 1;
      if (right === null) return options?.nullsFirst ? 1 : -1;
      if (left < right) return options?.ascending ? -1 : 1;
      return options?.ascending ? 1 : -1;
    });
  }

  if (typeof filters.limit === 'number') {
    result = result.slice(0, filters.limit);
  }

  return result;
};

const selectColumns = (rows, columns) => {
  if (columns === '*') {
    return rows.map((row) => ({ ...row }));
  }

  const fields = columns.split(',').map((part) => part.trim());
  return rows.map((row) => {
    return fields.reduce((acc, field) => {
      acc[field] = row[field] ?? null;
      return acc;
    }, {});
  });
};

const createSelectBuilder = (columns) => {
  const filters = {
    eq: [],
    gte: [],
    lte: [],
    limit: undefined,
    order: null,
  };

  const resolve = () => {
    if (columns === '*' && behaviors.listError) {
      return { data: null, error: { message: behaviors.listError } };
    }

    if (columns !== '*' && behaviors.summaryError) {
      return { data: null, error: { message: behaviors.summaryError } };
    }

    const rows = applyFilters(sessionStore, filters);
    return { data: selectColumns(rows, columns), error: null };
  };

  const execute = () => resolve();

  const builder = Promise.resolve().then(execute);

  builder.eq = (column, value) => {
    filters.eq.push({ column, value });
    return builder;
  };
  builder.gte = (column, value) => {
    filters.gte.push({ column, value });
    return builder;
  };
  builder.lte = (column, value) => {
    filters.lte.push({ column, value });
    return builder;
  };
  builder.limit = (value) => {
    filters.limit = value;
    return builder;
  };
  builder.order = (column, options) => {
    filters.order = { column, options };
    const result = execute();
    return Promise.resolve(result);
  };

  return builder;
};

const installSupabaseStub = () => {
  supabase.from = (table) => {
    if (table !== 'sessions') {
      throw new Error(`Unexpected table requested: ${table}`);
    }

    return {
      insert(values) {
        return {
          select() {
            return {
              async single() {
                if (behaviors.insertError) {
                  return { data: null, error: { message: behaviors.insertError } };
                }
                const row = makeRow(values);
                return { data: row, error: null };
              },
            };
          },
        };
      },
      update(updates) {
        return {
          eq(column, value) {
            return {
              select() {
                return {
                  async maybeSingle() {
                    if (behaviors.updateError) {
                      return { data: null, error: { message: behaviors.updateError } };
                    }

                    const session = sessionStore.find((row) => row[column] === value);
                    if (!session) return { data: null, error: null };

                    Object.assign(session, updates, { updated_at: new Date().toISOString() });
                    return { data: { ...session }, error: null };
                  },
                };
              },
            };
          },
        };
      },
      select(columns = '*') {
        return createSelectBuilder(columns);
      },
    };
  };
};

const restoreSupabase = () => {
  supabase.from = originalFrom;
};

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });

const stopServer = (server) =>
  new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });

const request = async (method, path, body) => {
  const { server, url } = await startServer();

  try {
    const response = await fetch(`${url}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let parsed;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }

    return { status: response.status, body: parsed };
  } finally {
    await stopServer(server);
  }
};

beforeEach(() => {
  resetStore();
  resetBehaviors();
  installSupabaseStub();
});

afterEach(() => {
  restoreSupabase();
  resetStore();
  resetBehaviors();
});

test('POST /api/v1/sessions creates a session with computed totalMinutes', async () => {
  const response = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Math',
    sessionType: 1,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T01:00:00.000Z',
    sessionGoal: 'Practice problems',
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.session.userId, 'user-1');
  assert.equal(response.body.session.sessionType, 1);
  assert.equal(response.body.session.totalMinutes, 60);
  assert.equal(response.body.session.sessionGoal, 'Practice problems');
});

test('POST /api/v1/sessions requires mandatory fields', async () => {
  const response = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Math',
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T01:00:00.000Z',
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'sessionType is required');
});

test('POST /api/v1/sessions validates timestamp inputs', async () => {
  const response = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Math',
    sessionType: 1,
    startTime: 'invalid',
    endTime: '2024-01-01T01:00:00.000Z',
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /startTime must be a valid ISO 8601 timestamp/);
});

test('POST /api/v1/sessions surfaces Supabase errors', async () => {
  behaviors.insertError = 'insert blew up';

  const response = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Biology',
    sessionType: 2,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T01:00:00.000Z',
  });

  assert.equal(response.status, 500);
  assert.match(String(response.body), /Error: Failed to create session: insert blew up/);
});

test('PATCH /api/v1/sessions/:id updates a session and returns new payload', async () => {
  const start = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Chemistry',
    sessionType: 1,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T00:30:00.000Z',
  });

  const sessionId = start.body.session.id;

  const complete = await request('PATCH', `/api/v1/sessions/${sessionId}`, {
    endTime: '2024-01-01T01:30:00.000Z',
    totalMinutes: 90,
    sessionType: 2,
  });

  assert.equal(complete.status, 200);
  assert.equal(complete.body.session.totalMinutes, 90);
  assert.equal(complete.body.session.sessionType, 2);
  assert.equal(complete.body.session.endTime, '2024-01-01T01:30:00.000Z');
});

test('PATCH /api/v1/sessions/:id requires at least one field', async () => {
  const start = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Chemistry',
    sessionType: 1,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T00:45:00.000Z',
  });

  const response = await request('PATCH', `/api/v1/sessions/${start.body.session.id}`, {});

  assert.equal(response.status, 400);
  assert.equal(
    response.body.error,
    'At least one field must be provided to update a session',
  );
});

test('PATCH /api/v1/sessions/:id returns 404 when missing', async () => {
  const response = await request('PATCH', '/api/v1/sessions/session-missing', {
    endTime: '2024-01-01T01:00:00.000Z',
  });

  assert.equal(response.status, 404);
  assert.equal(response.body.error, 'Session not found');
});

test('PATCH /api/v1/sessions/:id propagates Supabase failures', async () => {
  behaviors.updateError = 'update exploded';

  const start = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Physics',
    sessionType: 1,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T00:20:00.000Z',
  });

  const response = await request('PATCH', `/api/v1/sessions/${start.body.session.id}`, {
    endTime: '2024-01-01T00:45:00.000Z',
  });

  assert.equal(response.status, 500);
  assert.match(String(response.body), /Error: Failed to complete session: update exploded/);
});

test('GET /api/v1/sessions lists sessions ordered by completion time', async () => {
  const first = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'History',
    sessionType: 1,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T00:30:00.000Z',
  });
  const second = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'History',
    sessionType: 1,
    startTime: '2024-01-01T01:00:00.000Z',
    endTime: '2024-01-01T01:45:00.000Z',
  });

  await request('PATCH', `/api/v1/sessions/${first.body.session.id}`, {
    endTime: '2024-01-01T02:00:00.000Z',
    totalMinutes: 120,
  });
  await request('PATCH', `/api/v1/sessions/${second.body.session.id}`, {
    endTime: '2024-01-01T03:00:00.000Z',
    totalMinutes: 120,
  });

  const response = await request(
    'GET',
    '/api/v1/sessions?userId=user-1&subject=History&sessionType=1&from=2024-01-01T00:00:00.000Z&to=2024-01-02T00:00:00.000Z&limit=1',
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.sessions.length, 1);
  assert.equal(response.body.sessions[0].id, second.body.session.id);
});

test('GET /api/v1/sessions enforces numeric limit', async () => {
  const response = await request('GET', '/api/v1/sessions?userId=user-1&limit=zero');

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'limit must be a positive integer');
});

test('GET /api/v1/sessions surfaces Supabase list errors', async () => {
  behaviors.listError = 'list exploded';
  const response = await request('GET', '/api/v1/sessions?userId=user-1');

  assert.equal(response.status, 500);
  assert.match(String(response.body), /Error: Failed to list sessions: list exploded/);
});

test('GET /api/v1/sessions/summary returns aggregate metrics', async () => {
  const start = await request('POST', '/api/v1/sessions', {
    userId: 'user-1',
    subject: 'Art',
    sessionType: 2,
    startTime: '2024-01-01T00:00:00.000Z',
    endTime: '2024-01-01T00:45:00.000Z',
  });
  await request('PATCH', `/api/v1/sessions/${start.body.session.id}`, {
    totalMinutes: 45,
  });

  const response = await request(
    'GET',
    '/api/v1/sessions/summary?userId=user-1&sessionType=2&from=2024-01-01T00:00:00.000Z&to=2024-01-02T00:00:00.000Z',
  );

  assert.equal(response.status, 200);
  assert.equal(response.body.totalMinutesStudied, 45);
  assert.equal(response.body.sessionsLogged, 1);
});

test('GET /api/v1/sessions/summary surfaces Supabase summary errors', async () => {
  behaviors.listError = 'summary exploded';
  const response = await request('GET', '/api/v1/sessions/summary?userId=user-1');

  assert.equal(response.status, 500);
  assert.match(String(response.body), /Error: Failed to summarize sessions: summary exploded/);
});
