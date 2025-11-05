// Mock Supabase client for self-contained Docker images (in-memory)
// Lives under infra/docker/mock to keep apps/backend clean.
// Only implements the subset of features used by our backend.

import crypto from 'node:crypto';

// In-memory stores (simple JS arrays/objects)
const tables = {
  sessions: [],
  badge: [],
  user_badge: [],
  user_profile: [],
};

// Utility
const nowIso = () => new Date().toISOString();
const genId = () => crypto.randomUUID();

function clone(obj) {
  return obj == null ? obj : JSON.parse(JSON.stringify(obj));
}

function applySelection(row, selection) {
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

  // Behavior: await query resolves to { data, error }
  then(resolve, reject) {
    try {
      const result = this._execute();
      return resolve(result);
    } catch (e) {
      return resolve({ data: null, error: { message: e.message } });
    }
  }

  select(selection = '*') {
    this._selection = selection;
    if (this.tableName === 'user_badge' && typeof selection === 'string' && selection.includes('badge:')) {
      this._joinBadge = true;
    }
    return this;
  }

  insert(payload) {
    this._mode = 'insert';
    this._payload = payload;
    return this;
  }

  upsert(payload, options = {}) {
    this._mode = 'upsert';
    this._payload = payload;
    this._onConflict = options.onConflict || null;
    return this;
  }

  update(payload) {
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
    // Special-case information_schema.columns for compatibility
    if (this.tableName === 'information_schema.columns') {
      const defaultCols = [
        'id',
        'user_id',
        'subject',
        'session_type',
        'start_time',
        'end_time',
        'date',
        'session_goal',
        'total_time',
        'inserted_at',
        'updated_at',
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
      const r = { ...row };
      if (this.tableName === 'sessions') {
        r.id = r.id || genId();
        r.inserted_at = r.inserted_at || nowIso();
        r.updated_at = r.updated_at || nowIso();
      }
      if (this.tableName === 'badge') {
        r.badge_id = r.badge_id || genId();
        r.created_at = r.created_at || nowIso();
      }
      if (this.tableName === 'user_badge') {
        r.earned_at = r.earned_at || nowIso();
      }
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

    // Handle join for user_badge -> badge
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
  return {
    // Minimal auth API used by backend controllers.
    auth: createAuthApi(),
    from(table) {
      return new QueryBuilder(table);
    },
  };
}

function createAuthApi() {
  // Minimal in-memory users registry
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
export default supabase;

