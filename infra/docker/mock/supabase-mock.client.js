/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: infra/docker/mock/supabase-mock.client.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaezadeh
 *  Comments: Generated partially with GPT-5 and commented by GPT
 *  Last-Updated: 2025-11-20
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  In-memory, minimal Supabase-compatible client used for "mock DB mode".
 *  Provides auth methods and CRUD-like table access matching the schema defined
 *  in infra/docker/db/init/01_schema.sql: user_profile, sessions, badge,
 *  user_badge, and friends tables to support local, self-contained runs.
 *
 *  Notes
 *  -----
 *  • Auth changes to enable mock DB mode (signup/login/reset/update) were also
 *    generated as part of this module.
 *  • Kept under infra/docker to avoid polluting apps/backend.
 *  • Schema synchronized with infra/docker/db/init/01_schema.sql
 *
 *  @module infra/docker/mock/supabase-mock.client
 * ────────────────────────────────────────────────────────────────────────────────
 */

// Mock Supabase client for self-contained Docker images (in-memory)
// Lives under infra/docker/mock to keep apps/backend clean.
// Only implements the subset of features used by our backend.

import crypto from 'node:crypto';

// In-memory stores (simple JS arrays/objects). No persistence between process runs.
// This mirrors the tables from infra/docker/db/init/01_schema.sql
const tables = {
  // user_profile: basic profile info keyed by Supabase auth user id
  user_profile: [],
  // sessions: study sessions for a given user
  sessions: [],
  // badge: catalog of badges that can be earned
  badge: [],
  // user_badge: join table between users and badges they have earned
  user_badge: [],
  // friends: friend relationships between users
  friends: [],
};

// Utility
const nowIso = () => new Date().toISOString();
const genId = () => crypto.randomUUID();

function clone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}

function applySelection(row, selection) {
  // Apply a simple projection similar to supabase-js select('*' | 'col1,col2')
  // Nested selects like badge:badge_id(...) are handled separately.
  if (!selection || selection === '*' || selection.trim() === '') return clone(row);
  const cols = selection
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const out = {};
  for (const col of cols) {
    if (col.includes(':')) continue; // skip join alias here (handled elsewhere)
    if (col in row) out[col] = row[col];
  }
  return out;
}

class QueryBuilder {
  constructor(tableName) {
    // Simple query builder that mimics supabase-js chaining for the subset we use.
    // It records intent and evaluates in _execute() when awaited.
    this.tableName = tableName;
    this._selection = '*';
    this._filters = [];
    this._order = null; // { column, ascending }
    this._mode = 'select'; // 'select' | 'insert' | 'update' | 'upsert'
    this._payload = null;
    this._single = false;
    this._maybeSingle = false;
    this._joinBadge = false; // for user_badge selection with nested badge
    this._onConflict = null;
  }

  // Behavior: await query resolves to { data, error }.
  // Implement thenable to let callers `await client.from('x').select('*')` directly.
  then(resolve, reject) {
    try {
      const result = this._execute();
      return resolve(result);
    } catch (e) {
      return resolve({ data: null, error: { message: e.message } });
    }
  }

  select(selection = '*') {
    // Support nested join selection for user_badge -> badge via PostgREST-like syntax.
    // e.g., select(`user_id,badge:badge_id(...)`)
    this._selection = selection;
    if (this.tableName === 'user_badge' && typeof selection === 'string' && selection.includes('badge:')) {
      this._joinBadge = true;
    }
    return this;
  }

  insert(payload) {
    // Insert one or many rows (array or object), returning inserted rows.
    this._mode = 'insert';
    this._payload = payload;
    return this;
  }

  upsert(payload, options = {}) {
    // Upsert by a single conflict column (onConflict) to support user_profile upsert.
    // If a matching row exists, merge payload into it; otherwise insert.
    this._mode = 'upsert';
    this._payload = payload;
    this._onConflict = options.onConflict || null;
    return this;
  }

  update(payload) {
    // Update rows matched by filters; sets updated_at if present on the table.
    this._mode = 'update';
    this._payload = payload;
    return this;
  }

  eq(column, value) {
    this._filters.push((row) => row[column] === value);
    return this;
  }

  gte(column, value) {
    this._filters.push((row) => (row[column] ?? null) >= value);
    return this;
  }

  lte(column, value) {
    this._filters.push((row) => (row[column] ?? null) <= value);
    return this;
  }

  not(column, operator, value) {
    if (operator === 'is') {
      this._filters.push((row) => (row[column] ?? null) !== value);
    }
    return this;
  }

  order(column, { ascending = true } = {}) {
    this._order = { column, ascending };
    return this;
  }

  single() {
    this._single = true;
    this._maybeSingle = false;
    return this;
  }

  maybeSingle() {
    this._maybeSingle = true;
    this._single = false;
    return this;
  }

  _applyFilters(rows) {
    return this._filters.length ? rows.filter((r) => this._filters.every((f) => f(r))) : rows;
  }

  _applyOrder(rows) {
    if (!this._order) return rows;
    const { column, ascending } = this._order;
    return [...rows].sort((a, b) => {
      const av = a[column];
      const bv = b[column];
      if (av === bv) return 0;
      if (av == null) return ascending ? -1 : 1;
      if (bv == null) return ascending ? 1 : -1;
      return ascending ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }

  _execute() {
    // Special-case information_schema.columns to satisfy column discovery in sessions.service.
    // We return the columns for public.sessions as defined in infra/docker/db/init/01_schema.sql
    if (this.tableName === 'information_schema.columns') {
      const defaultCols = [
        'id',
        'user_id',
        'start_time',
        'end_time',
        'date',
        'subject',
        'session_type',
        'inserted_at',
        'updated_at',
        'session_goal',
        'total_time',
      ];
      let rows = defaultCols.map((c) => ({
        column_name: c,
        table_schema: 'public',
        table_name: 'sessions',
      }));
      // Apply filters if any
      rows = this._applyFilters(rows);
      return { data: rows, error: null };
    }

    const store = tables[this.tableName];
    if (!store) return { data: [], error: null };

    const doInsert = (row) => {
      // Normalize defaults for known tables (ids and timestamps) to match schema.
      // Schema: infra/docker/db/init/01_schema.sql
      const r = { ...row };

      // sessions table defaults
      if (this.tableName === 'sessions') {
        r.id = r.id || genId();
        r.date = r.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        r.inserted_at = r.inserted_at || nowIso();
        r.updated_at = r.updated_at || nowIso();
      }

      // badge table defaults
      if (this.tableName === 'badge') {
        r.badge_id = r.badge_id || genId();
        r.created_at = r.created_at || nowIso();
      }

      // user_badge table defaults
      if (this.tableName === 'user_badge') {
        r.earned_at = r.earned_at || nowIso();
      }

      // friends table defaults
      if (this.tableName === 'friends') {
        r.id = r.id || genId();
        r.updated_at = r.updated_at || nowIso();
      }

      // user_profile has no defaults beyond what's provided

      store.push(r);
      return r;
    };

    if (this._mode === 'insert') {
      const rows = Array.isArray(this._payload) ? this._payload : [this._payload];
      const inserted = rows.map((r) => doInsert(r));
      const out = this._single ? inserted[0] : inserted;
      return { data: clone(out), error: null };
    }

    if (this._mode === 'upsert') {
      const rows = Array.isArray(this._payload) ? this._payload : [this._payload];
      const out = rows.map((r) => {
        if (this._onConflict) {
          const existingIdx = store.findIndex((row) => row[this._onConflict] === r[this._onConflict]);
          if (existingIdx >= 0) {
            store[existingIdx] = { ...store[existingIdx], ...r };
            return store[existingIdx];
          }
        }
        return doInsert(r);
      });
      return { data: clone(this._single ? out[0] : out), error: null };
    }

    if (this._mode === 'update') {
      let rows = this._applyFilters(store);
      if (!rows.length) {
        if (this._maybeSingle) return { data: null, error: null };
        return { data: null, error: { message: 'No rows found' } };
      }
      rows = rows.map((r) => Object.assign(r, this._payload, { updated_at: nowIso() }));
      const out = this._single || this._maybeSingle ? rows[0] : rows;
      return { data: clone(out), error: null };
    }

    // SELECT
    let rows = this._applyFilters(store);

    // Handle join for user_badge -> badge (attach nested badge object)
    if (this.tableName === 'user_badge' && this._joinBadge) {
      rows = rows.map((r) => {
        const badge = tables.badge.find((b) => b.badge_id === r.badge_id) || null;
        return { ...r, badge };
      });
    }

    rows = this._applyOrder(rows);

    if (this._single) {
      const row = rows[0];
      if (!row) return { data: null, error: { message: 'No rows found' } };
      return { data: applySelection(row, this._selection), error: null };
    }

    if (this._maybeSingle) {
      const row = rows[0] || null;
      return { data: row ? applySelection(row, this._selection) : null, error: null };
    }

    const data = rows.map((r) => applySelection(r, this._selection));
    return { data, error: null };
  }
}

function createMockClient() {
  // Expose minimal supabase-js surface used by our code: { auth, from }
  return {
    // Minimal auth API used by backend controllers.
    auth: createAuthApi(),
    from(table) {
      return new QueryBuilder(table);
    },
  };
}

function createAuthApi() {
  // Minimal in-memory user registry for mock auth flows.
  // Tokens are mock strings; do NOT use in production.
  // No email verification; intended for local demos/tests only.

  const users = new Map(); // email -> { id, email, password, user_metadata }

  const buildSession = (user) => ({
    access_token: `mock.${user.id}`,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: `mock-refresh.${user.id}`,
    user: { id: user.id, email: user.email, user_metadata: user.user_metadata || {} },
  });

  return {
    async signUp({ email, password, options }) {
      if (!email || !password) return { data: null, error: { message: 'invalid_request' } };
      if (users.has(email)) return { data: null, error: { message: 'User already registered' } };
      const user = {
        id: genId(),
        email,
        password,
        user_metadata: options?.data || {},
      };
      users.set(email, user);
      return { data: { user, session: buildSession(user) }, error: null };
    },

    async signInWithPassword({ email, password }) {
      const user = users.get(email);
      if (!user || user.password !== password) {
        return { data: null, error: { message: 'Invalid login credentials' } };
      }
      return { data: { user, session: buildSession(user) }, error: null };
    },

    async signOut() {
      return { error: null };
    },

    async resetPasswordForEmail(email, _opts) {
      if (!email) return { data: null, error: { message: 'invalid_request' } };
      // No-op in mock; pretend mail sent
      return { data: { sent: true }, error: null };
    },

    async updateUser({ password }) {
      // No-op; just say ok
      return { data: { updated: Boolean(password) }, error: null };
    },
  };
}

const supabase = createMockClient();
// Expose internal tables for test suites that seed data directly (e.g., sessions).
supabase.tables = tables;
export default supabase;

