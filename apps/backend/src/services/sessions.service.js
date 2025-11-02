/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/services/sessions.service.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-16
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Service layer responsible for all database operations on the `sessions` table
 *  using the Supabase client. This module isolates data persistence logic from
 *  controller logic, enabling easier testing and dependency injection.
 *
 *  Functions
 *  ----------
 *  • createSession(session)         → inserts a new session record
 *  • completeSession(id, updates)   → updates an existing session (marks complete)
 *  • listSessions(filters)          → retrieves sessions (optionally filtered)
 *  • summarizeSessionsByDate(query) → aggregates study metrics for dashboards
 *
 *  Design Principles
 *  -----------------
 *  • Encapsulates direct DB access, promoting Separation of Concerns.
 *  • Uses dependency injection for testability (custom mock Supabase client).
 *  • Throws meaningful errors for controller-level handling.
 *
 *  TODOs
 *  -----
 *  • [VALIDATION] Ensure data types and required fields validated pre-insert/update.
 *  • [LOGGING] Add structured logging for DB operations.
 *  • [TRANSACTIONS] Consider wrapping multi-step operations in transactions.
 *
 *  @module services/sessions
 *  @see ../controllers/sessions.controller.js
 * ────────────────────────────────────────────────────────────────────────────────
 */

import supabase from '../config/supabase.client.js'; // Initialized Supabase client instance

const DEFAULT_SESSION_COLUMNS = [
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

const COLUMN_ALIASES = {
  userId: ['user_id', 'userId'],
  subject: ['subject'],
  sessionType: ['session_type', 'sessionType'],
  sessionGoal: ['session_goal', 'sessionGoal', 'notes'],
  startTime: [
    'start_time',
    'started_at',
    'start_study_timestamp',
    'start_timestamp',
    'startStudyTimestamp',
  ],
  endTime: [
    'end_time',
    'ended_at',
    'end_study_timestamp',
    'end_timestamp',
    'endStudyTimestamp',
    'completed_at',
  ],
  totalMinutes: [
    'total_time',
    'total_minutes',
    'duration_minutes',
    'session_length_minutes',
  ],
  date: ['date', 'session_date'],
  createdAt: ['inserted_at', 'created_at', 'createdAt'],
  updatedAt: ['updated_at', 'updatedAt'],
};

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const toEpochMillis = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  if (isNumber(value)) return value;

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const formatTimestampForColumn = (column, value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const millis = toEpochMillis(value);
  if (millis === null) return value;

  const lower = column.toLowerCase();
  if (lower.includes('millis') || lower.endsWith('_ms')) {
    return millis;
  }

  if (lower.includes('second') || lower.endsWith('_s')) {
    return Math.round(millis / 1000);
  }

  return new Date(millis).toISOString();
};

const pickFirst = (source, candidates) => {
  for (const key of candidates) {
    if (Object.hasOwn(source, key) && source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }
  return null;
};

const parseTimestampField = (source, candidates) => {
  const value = pickFirst(source, candidates);
  if (value === null) return null;

  const millis = toEpochMillis(value);
  if (millis === null) return null;

  return new Date(millis).toISOString();
};

const parseNumericField = (source, candidates) => {
  const value = pickFirst(source, candidates);
  if (value === null) return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const mapDbSessionToApi = (session) => {
  if (!session) return session;

  const startTime = parseTimestampField(session, COLUMN_ALIASES.startTime);
  const endTime = parseTimestampField(session, COLUMN_ALIASES.endTime);
  const insertedAt = parseTimestampField(session, COLUMN_ALIASES.createdAt);
  const updatedAt = parseTimestampField(session, COLUMN_ALIASES.updatedAt);

  return {
    id: session.id,
    userId: pickFirst(session, COLUMN_ALIASES.userId),
    subject: pickFirst(session, COLUMN_ALIASES.subject),
    sessionType: parseNumericField(session, COLUMN_ALIASES.sessionType),
    sessionGoal: pickFirst(session, COLUMN_ALIASES.sessionGoal),
    startTime,
    endTime,
    date: pickFirst(session, COLUMN_ALIASES.date),
    totalMinutes: parseNumericField(session, COLUMN_ALIASES.totalMinutes),
    insertedAt,
    updatedAt,
  };
};

const buildColumnSet = (columns) => {
  if (!columns) return new Set();
  if (columns instanceof Set) return columns;
  return new Set(columns);
};

const findColumn = (columnSet, aliases) => {
  for (const candidate of aliases) {
    if (columnSet.has(candidate)) return candidate;
  }
  return null;
};

const createColumnResolver = (client, initialColumns) => {
  let cachedColumns = initialColumns ? buildColumnSet(initialColumns) : null;
  let pendingPromise = null;

  const fetchColumns = async () => {
    if (cachedColumns) return cachedColumns;
    if (pendingPromise) return pendingPromise;

    pendingPromise = (async () => {
      try {
        const builder = client.from?.('information_schema.columns');
        if (!builder || typeof builder.select !== 'function') {
          throw new Error('information_schema access unavailable');
        }

        const { data, error } = await builder
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'sessions');

        if (error || !data) {
          cachedColumns = buildColumnSet(DEFAULT_SESSION_COLUMNS);
        } else {
          cachedColumns = buildColumnSet(data.map((row) => row.column_name));
        }
      } catch (err) {
        cachedColumns = buildColumnSet(DEFAULT_SESSION_COLUMNS);
      }

      pendingPromise = null;
      return cachedColumns;
    })();

    return pendingPromise;
  };

  const reset = () => {
    cachedColumns = initialColumns ? buildColumnSet(initialColumns) : null;
    pendingPromise = null;
  };

  return { getColumns: fetchColumns, reset };
};

const buildSessionInsertPayload = (session, columnSet) => {
  const payload = {};

  const userColumn = findColumn(columnSet, COLUMN_ALIASES.userId);
  if (userColumn && session.userId !== undefined) {
    payload[userColumn] = session.userId;
  }

  const subjectColumn = findColumn(columnSet, COLUMN_ALIASES.subject);
  if (subjectColumn && session.subject !== undefined) {
    payload[subjectColumn] = session.subject;
  }

  const sessionTypeColumn = findColumn(columnSet, COLUMN_ALIASES.sessionType);
  if (sessionTypeColumn && session.sessionType !== undefined) {
    const numeric = Number(session.sessionType);
    if (Number.isFinite(numeric)) {
      payload[sessionTypeColumn] = numeric;
    }
  }

  const sessionGoalColumn = findColumn(columnSet, COLUMN_ALIASES.sessionGoal);
  if (sessionGoalColumn && session.sessionGoal !== undefined) {
    payload[sessionGoalColumn] = session.sessionGoal;
  }

  const startColumn = findColumn(columnSet, COLUMN_ALIASES.startTime);
  if (startColumn && session.startTime !== undefined) {
    payload[startColumn] = formatTimestampForColumn(startColumn, session.startTime);
  }

  const endColumn = findColumn(columnSet, COLUMN_ALIASES.endTime);
  if (endColumn && session.endTime !== undefined) {
    payload[endColumn] = formatTimestampForColumn(endColumn, session.endTime);
  }

  const totalColumn = findColumn(columnSet, COLUMN_ALIASES.totalMinutes);
  if (totalColumn && session.totalMinutes !== undefined) {
    const numeric = Number(session.totalMinutes);
    if (Number.isFinite(numeric)) {
      payload[totalColumn] = numeric;
    } else if (session.totalMinutes === null) {
      payload[totalColumn] = null;
    }
  }

  const dateColumn = findColumn(columnSet, COLUMN_ALIASES.date);
  if (dateColumn && session.date !== undefined) {
    payload[dateColumn] = session.date;
  }

  return payload;
};

const buildSessionUpdatePayload = (updates, columnSet) => {
  const payload = {};

  if (updates.subject !== undefined) {
    const subjectColumn = findColumn(columnSet, COLUMN_ALIASES.subject);
    if (subjectColumn) payload[subjectColumn] = updates.subject;
  }

  if (updates.sessionType !== undefined) {
    const sessionTypeColumn = findColumn(columnSet, COLUMN_ALIASES.sessionType);
    if (sessionTypeColumn) {
      const numeric = Number(updates.sessionType);
      if (Number.isFinite(numeric)) {
        payload[sessionTypeColumn] = numeric;
      }
    }
  }

  if (updates.sessionGoal !== undefined) {
    const goalColumn = findColumn(columnSet, COLUMN_ALIASES.sessionGoal);
    if (goalColumn) payload[goalColumn] = updates.sessionGoal;
  }

  if (updates.startTime !== undefined) {
    const startColumn = findColumn(columnSet, COLUMN_ALIASES.startTime);
    if (startColumn) {
      payload[startColumn] = formatTimestampForColumn(startColumn, updates.startTime);
    }
  }

  if (updates.endTime !== undefined) {
    const endColumn = findColumn(columnSet, COLUMN_ALIASES.endTime);
    if (endColumn) {
      payload[endColumn] = formatTimestampForColumn(endColumn, updates.endTime);
    }
  }

  if (updates.totalMinutes !== undefined) {
    const totalColumn = findColumn(columnSet, COLUMN_ALIASES.totalMinutes);
    if (totalColumn) {
      if (updates.totalMinutes === null) {
        payload[totalColumn] = null;
      } else {
        const numeric = Number(updates.totalMinutes);
        if (Number.isFinite(numeric)) {
          payload[totalColumn] = numeric;
        }
      }
    }
  }

  if (updates.date !== undefined) {
    const dateColumn = findColumn(columnSet, COLUMN_ALIASES.date);
    if (dateColumn) payload[dateColumn] = updates.date;
  }

  return payload;
};

const parseFilterTimestamp = (value) => {
  if (value === undefined || value === null) return null;
  if (isNumber(value)) return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const filterSessionsByDateRange = (sessions, { from, to }) => {
  if (!from && !to) return sessions;

  const fromMillis = parseFilterTimestamp(from);
  const toMillis = parseFilterTimestamp(to);

  return sessions.filter((session) => {
    const anchor = session.endTime ?? session.startTime ?? null;
    const anchorMillis = parseFilterTimestamp(anchor);

    if (fromMillis !== null && (anchorMillis === null || anchorMillis < fromMillis)) {
      return false;
    }

    if (toMillis !== null && (anchorMillis === null || anchorMillis > toMillis)) {
      return false;
    }

    return true;
  });
};

const sortSessionsByEndTimeDesc = (sessions) => {
  return [...sessions].sort((a, b) => {
    const left = parseFilterTimestamp(a.endTime ?? a.startTime ?? null);
    const right = parseFilterTimestamp(b.endTime ?? b.startTime ?? null);
    if (left === right) return 0;
    return (right ?? Number.NEGATIVE_INFINITY) - (left ?? Number.NEGATIVE_INFINITY);
  });
};

/**
 * Factory function for creating a session service instance.
 * Allows dependency injection of a custom client (for testing/mocking).
 *
 * @param {object} [client=supabase] - The Supabase client to use.
 * @param {object} [options] - Optional configuration overrides.
 * @param {string[]} [options.sessionColumns] - Pre-seeded list of session columns.
 * @returns {object} service - Contains CRUD functions for sessions.
 */
export const createSessionsService = (client = supabase, options = {}) => {
  const columnResolver = createColumnResolver(client, options.sessionColumns);

  /**
   * Insert a new session record into the database.
   * @param {object} session - Session object to insert (validated upstream).
   * @returns {Promise<object>} - The created session record.
   * @throws {Error} - If insertion fails.
   */
  const createSession = async (session) => {
    const columns = await columnResolver.getColumns();
    const payload = buildSessionInsertPayload(session, columns);

    const { data, error } = await client
      .from('sessions')
      .insert(payload)
      .select()
      .single(); // Expect exactly one record back

    if (error) {
      // Good practice: throw Error with clear context for controller catch
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return mapDbSessionToApi(data);
  };

  /**
   * Update a session record — typically to mark it as complete.
   * @param {string|number} sessionId - The session ID to update.
   * @param {object} updates - Key/value pairs of fields to update.
   * @returns {Promise<object|null>} - The updated session or null if not found.
   * @throws {Error} - If update fails.
   */
  const completeSession = async (sessionId, updates) => {
    const columns = await columnResolver.getColumns();
    const payload = buildSessionUpdatePayload(updates, columns);

    const { data, error } = await client
      .from('sessions')
      .update(payload)
      .eq('id', sessionId)
      .select()
      .maybeSingle(); // Returns one or null (no match)

    if (error) {
      throw new Error(`Failed to complete session: ${error.message}`);
    }

    return mapDbSessionToApi(data);
  };

  /**
   * Retrieve a list of sessions, optionally filtered by user or subject.
   * @param {object} [filters={}] - Optional filters (e.g., { userId, subject }).
   * @returns {Promise<object[]>} - Array of sessions (may be empty).
   * @throws {Error} - If query fails.
   */
  const listSessions = async (filters = {}) => {
    const columns = await columnResolver.getColumns();
    const userColumn = findColumn(columns, COLUMN_ALIASES.userId);
    const subjectColumn = findColumn(columns, COLUMN_ALIASES.subject);
    const sessionTypeColumn = findColumn(columns, COLUMN_ALIASES.sessionType);
    const endTimeColumn = findColumn(columns, COLUMN_ALIASES.endTime);

    let query = client.from('sessions').select('*');

    if (filters.userId && userColumn) query = query.eq(userColumn, filters.userId);
    if (filters.subject && subjectColumn) query = query.eq(subjectColumn, filters.subject);
    if (filters.sessionType && sessionTypeColumn)
      query = query.eq(sessionTypeColumn, filters.sessionType);

    if (filters.from && endTimeColumn) {
      query = query.gte(endTimeColumn, formatTimestampForColumn(endTimeColumn, filters.from));
    }

    if (filters.to && endTimeColumn) {
      query = query.lte(endTimeColumn, formatTimestampForColumn(endTimeColumn, filters.to));
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }

    const rows = data ?? [];
    const mapped = rows.map(mapDbSessionToApi);
    const filtered = filterSessionsByDateRange(mapped, filters);
    const sorted = sortSessionsByEndTimeDesc(filtered);

    return filters.limit ? sorted.slice(0, filters.limit) : sorted;
  };

  const summarizeSessionsByDate = async ({ userId, from, to, sessionType }) => {
    const columns = await columnResolver.getColumns();
    const userColumn = findColumn(columns, COLUMN_ALIASES.userId);
    const sessionTypeColumn = findColumn(columns, COLUMN_ALIASES.sessionType);
    const endTimeColumn = findColumn(columns, COLUMN_ALIASES.endTime);

    let query = client.from('sessions').select('*');
    if (userColumn) {
      query = query.eq(userColumn, userId);
    }
    if (sessionType && sessionTypeColumn) {
      query = query.eq(sessionTypeColumn, sessionType);
    }
    if (from && endTimeColumn) {
      query = query.gte(endTimeColumn, formatTimestampForColumn(endTimeColumn, from));
    }
    if (to && endTimeColumn) {
      query = query.lte(endTimeColumn, formatTimestampForColumn(endTimeColumn, to));
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to summarize sessions: ${error.message}`);
    }

    const rows = data ?? [];
    const mapped = rows.map(mapDbSessionToApi);
    const dateFiltered = filterSessionsByDateRange(mapped, { from, to });

    const totalMinutes = dateFiltered.reduce(
      (acc, session) => acc + (session.totalMinutes ?? 0),
      0,
    );

    return {
      totalMinutesStudied: totalMinutes,
      sessionsLogged: dateFiltered.length,
    };
  };

  // Return a service object for controllers or tests to consume
  return {
    createSession,
    completeSession,
    listSessions,
    summarizeSessionsByDate,
    __private: {
      mapDbSessionToApi,
      createColumnResolver,
      buildSessionInsertPayload,
      buildSessionUpdatePayload,
      filterSessionsByDateRange,
      sortSessionsByEndTimeDesc,
      columnResolver,
    },
  };
};

// Default export: production instance using the configured Supabase client
const defaultService = createSessionsService();
export default defaultService;
