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

import supabase from '../config/supabase.js'; // Initialized Supabase client instance

const MILLIS_IN_MINUTE = 60_000;

const toMinutes = (millis) => {
  if (millis === null || millis === undefined) return null;
  return Math.round((millis / MILLIS_IN_MINUTE) * 1000) / 1000;
};

const toMillis = (minutes) => {
  if (minutes === null || minutes === undefined) return null;
  return Math.round(minutes * MILLIS_IN_MINUTE);
};

const DEFAULT_SESSION_COLUMNS = [
  'id',
  'user_id',
  'subject',
  'status',
  'started_at',
  'ended_at',
  'duration_minutes',
  'target_duration_minutes',
  'notes',
  'created_at',
  'updated_at',
];

const COLUMN_ALIASES = {
  userId: ['user_id', 'userId'],
  subject: ['subject'],
  status: ['status', 'session_status'],
  notes: ['notes', 'session_notes'],
  startTimestamp: [
    'started_at',
    'start_study_timestamp',
    'start_timestamp',
    'start_time',
    'startStudyTimestamp',
  ],
  endTimestamp: [
    'ended_at',
    'end_study_timestamp',
    'end_timestamp',
    'end_time',
    'endStudyTimestamp',
    'completed_at',
  ],
  durationMinutes: [
    'duration_minutes',
    'session_duration_minutes',
    'session_length_minutes',
  ],
  durationMillis: [
    'duration_millis',
    'session_length_millis',
    'session_length',
    'sessionLength',
    'duration_ms',
  ],
  targetDurationMinutes: [
    'target_duration_minutes',
    'target_session_minutes',
  ],
  targetDurationMillis: [
    'target_duration_millis',
    'target_session_millis',
    'target_duration_ms',
    'target_session_length',
  ],
  createdAt: ['created_at', 'createdAt'],
  updatedAt: ['updated_at', 'updatedAt'],
};

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const normalizeTimestampInput = (value) => {
  if (value === null || value === undefined) return null;
  if (isNumber(value)) return value;

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const formatTimestampForColumn = (column, value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const millis = normalizeTimestampInput(value);
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

const formatDurationForColumn = (column, valueMillis) => {
  if (valueMillis === undefined) return undefined;
  if (valueMillis === null) return null;

  const lower = column.toLowerCase();
  if (lower.includes('minute')) {
    return toMinutes(valueMillis);
  }

  if (lower.includes('second') || lower.endsWith('_s')) {
    return Math.round(valueMillis / 1000);
  }

  return valueMillis;
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
  return normalizeTimestampInput(value);
};

const parseDurationMinutes = (source) => {
  const fromMinutes = pickFirst(source, COLUMN_ALIASES.durationMinutes);
  if (fromMinutes !== null) {
    const numeric = Number(fromMinutes);
    return Number.isFinite(numeric) ? numeric : null;
  }

  const fromMillis = pickFirst(source, COLUMN_ALIASES.durationMillis);
  if (fromMillis !== null) {
    const numeric = Number(fromMillis);
    return Number.isFinite(numeric) ? numeric / MILLIS_IN_MINUTE : null;
  }

  const started = parseTimestampField(source, COLUMN_ALIASES.startTimestamp);
  const ended = parseTimestampField(source, COLUMN_ALIASES.endTimestamp);
  if (started !== null && ended !== null) {
    return (ended - started) / MILLIS_IN_MINUTE;
  }

  return null;
};

const parseTargetDurationMinutes = (source) => {
  const fromMinutes = pickFirst(source, COLUMN_ALIASES.targetDurationMinutes);
  if (fromMinutes !== null) {
    const numeric = Number(fromMinutes);
    return Number.isFinite(numeric) ? numeric : null;
  }

  const fromMillis = pickFirst(source, COLUMN_ALIASES.targetDurationMillis);
  if (fromMillis !== null) {
    const numeric = Number(fromMillis);
    return Number.isFinite(numeric) ? numeric / MILLIS_IN_MINUTE : null;
  }

  return null;
};

const mapDbSessionToApi = (session) => {
  if (!session) return session;

  const startTimestamp = parseTimestampField(session, COLUMN_ALIASES.startTimestamp);
  const endTimestamp = parseTimestampField(session, COLUMN_ALIASES.endTimestamp);
  const durationMinutes = parseDurationMinutes(session);
  const targetDurationMinutes = parseTargetDurationMinutes(session);

  const createdAt = pickFirst(session, COLUMN_ALIASES.createdAt);
  const updatedAt = pickFirst(session, COLUMN_ALIASES.updatedAt);

  return {
    id: session.id,
    userId: pickFirst(session, COLUMN_ALIASES.userId),
    subject: pickFirst(session, COLUMN_ALIASES.subject),
    status: pickFirst(session, COLUMN_ALIASES.status),
    startTimestamp,
    endStudyTimestamp: endTimestamp,
    targetDurationMillis: toMillis(targetDurationMinutes),
    sessionLength: toMillis(durationMinutes),
    notes: pickFirst(session, COLUMN_ALIASES.notes),
    createdAt,
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

  const statusColumn = findColumn(columnSet, COLUMN_ALIASES.status);
  if (statusColumn && session.status !== undefined) {
    payload[statusColumn] = session.status;
  }

  const startColumn = findColumn(columnSet, COLUMN_ALIASES.startTimestamp);
  if (startColumn && session.startTimestamp !== undefined) {
    payload[startColumn] = formatTimestampForColumn(startColumn, session.startTimestamp);
  }

  const targetMinutesColumn = findColumn(columnSet, COLUMN_ALIASES.targetDurationMinutes);
  const targetMillisColumn = findColumn(columnSet, COLUMN_ALIASES.targetDurationMillis);
  if (session.targetDurationMillis !== undefined) {
    const formattedValue =
      targetMinutesColumn
        ? formatDurationForColumn(targetMinutesColumn, session.targetDurationMillis)
        : targetMillisColumn
          ? formatDurationForColumn(targetMillisColumn, session.targetDurationMillis)
          : undefined;
    if (formattedValue !== undefined && targetMinutesColumn) {
      payload[targetMinutesColumn] = formattedValue;
    } else if (formattedValue !== undefined && targetMillisColumn) {
      payload[targetMillisColumn] = formattedValue;
    }
  }

  const notesColumn = findColumn(columnSet, COLUMN_ALIASES.notes);
  if (notesColumn && session.notes !== undefined) {
    payload[notesColumn] = session.notes;
  }

  return payload;
};

const buildSessionUpdatePayload = (updates, columnSet) => {
  const payload = {};

  if (updates.status !== undefined) {
    const statusColumn = findColumn(columnSet, COLUMN_ALIASES.status);
    if (statusColumn) payload[statusColumn] = updates.status;
  }

  if (updates.notes !== undefined) {
    const notesColumn = findColumn(columnSet, COLUMN_ALIASES.notes);
    if (notesColumn) payload[notesColumn] = updates.notes;
  }

  if (updates.endStudyTimestamp !== undefined) {
    const endColumn = findColumn(columnSet, COLUMN_ALIASES.endTimestamp);
    if (endColumn) {
      payload[endColumn] = formatTimestampForColumn(endColumn, updates.endStudyTimestamp);
    }
  }

  if (updates.sessionLengthMillis !== undefined) {
    const durationMinutesColumn = findColumn(columnSet, COLUMN_ALIASES.durationMinutes);
    const durationMillisColumn = findColumn(columnSet, COLUMN_ALIASES.durationMillis);

    const formattedValue =
      durationMinutesColumn
        ? formatDurationForColumn(durationMinutesColumn, updates.sessionLengthMillis)
        : durationMillisColumn
          ? formatDurationForColumn(durationMillisColumn, updates.sessionLengthMillis)
          : undefined;

    if (formattedValue !== undefined && durationMinutesColumn) {
      payload[durationMinutesColumn] = formattedValue;
    } else if (formattedValue !== undefined && durationMillisColumn) {
      payload[durationMillisColumn] = formattedValue;
    }
  }

  return payload;
};

const parseFilterTimestamp = (value) => {
  if (value === undefined || value === null) return null;
  if (isNumber(value)) return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const filterSessionsByDateRange = (sessions, { endedAfter, endedBefore }) => {
  if (!endedAfter && !endedBefore) return sessions;

  const afterMillis = parseFilterTimestamp(endedAfter);
  const beforeMillis = parseFilterTimestamp(endedBefore);

  return sessions.filter((session) => {
    const end = session.endStudyTimestamp ?? null;

    if (afterMillis !== null && (end === null || end < afterMillis)) {
      return false;
    }

    if (beforeMillis !== null && (end === null || end > beforeMillis)) {
      return false;
    }

    return true;
  });
};

const sortSessionsByEndTimeDesc = (sessions) => {
  return [...sessions].sort((a, b) => {
    const left = a.endStudyTimestamp ?? -Infinity;
    const right = b.endStudyTimestamp ?? -Infinity;
    if (left === right) return 0;
    return right - left;
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
    const statusColumn = findColumn(columns, COLUMN_ALIASES.status);

    let query = client.from('sessions').select('*');

    if (filters.userId && userColumn) query = query.eq(userColumn, filters.userId);
    if (filters.subject && subjectColumn) query = query.eq(subjectColumn, filters.subject);
    if (filters.status && statusColumn) query = query.eq(statusColumn, filters.status);

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

  const summarizeSessionsByDate = async ({
    userId,
    from,
    to,
    status = 'completed',
  }) => {
    const columns = await columnResolver.getColumns();
    const userColumn = findColumn(columns, COLUMN_ALIASES.userId);
    const statusColumn = findColumn(columns, COLUMN_ALIASES.status);

    let query = client.from('sessions').select('*');
    if (userColumn) {
      query = query.eq(userColumn, userId);
    }
    if (status && statusColumn) {
      query = query.eq(statusColumn, status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to summarize sessions: ${error.message}`);
    }

    const rows = data ?? [];
    const mapped = rows.map(mapDbSessionToApi);
    const dateFiltered = filterSessionsByDateRange(mapped, {
      endedAfter: from,
      endedBefore: to,
    });

    const statusFiltered = status
      ? dateFiltered.filter((session) => session.status === status)
      : dateFiltered;

    const totalTimeStudied = statusFiltered.reduce(
      (acc, session) => acc + (session.sessionLength ?? 0),
      0,
    );

    return {
      totalTimeStudied,
      timesStudied: statusFiltered.length,
    };
  };

  // Return a service object for controllers or tests to consume
  return {
    createSession,
    completeSession,
    listSessions,
    summarizeSessionsByDate,
    __private: {
      toMinutes,
      toMillis,
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
