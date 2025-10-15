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

const mapDbSessionToApi = (session) => {
  if (!session) return session;

  return {
    id: session.id,
    userId: session.user_id,
    subject: session.subject,
    status: session.status,
    startTimestamp: session.started_at ?? null,
    endStudyTimestamp: session.ended_at ?? null,
    targetDurationMillis: toMillis(session.target_duration_minutes),
    sessionLength: toMillis(session.duration_minutes),
    notes: session.notes ?? null,
    createdAt: session.created_at ?? null,
    updatedAt: session.updated_at ?? null,
  };
};

/**
 * Factory function for creating a session service instance.
 * Allows dependency injection of a custom client (for testing/mocking).
 *
 * @param {object} [client=supabase] - The Supabase client to use.
 * @returns {object} service - Contains CRUD functions for sessions.
 */
export const createSessionsService = (client = supabase) => {
  /**
   * Insert a new session record into the database.
   * @param {object} session - Session object to insert (validated upstream).
   * @returns {Promise<object>} - The created session record.
   * @throws {Error} - If insertion fails.
   */
  const createSession = async (session) => {
    const { data, error } = await client
      .from('sessions')
      .insert(session)
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
    const { data, error } = await client
      .from('sessions')
      .update(updates)
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
    let query = client.from('sessions').select('*');

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.subject) query = query.eq('subject', filters.subject);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.endedAfter) query = query.gte('ended_at', filters.endedAfter);
    if (filters.endedBefore) query = query.lte('ended_at', filters.endedBefore);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query.order('ended_at', {
      ascending: false,
      nullsFirst: false,
    });

    if (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }

    const rows = data ?? [];
    return rows.map(mapDbSessionToApi);
  };

  const summarizeSessionsByDate = async ({
    userId,
    from,
    to,
    status = 'completed',
  }) => {
    let query = client
      .from('sessions')
      .select('duration_minutes, ended_at, status')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }
    if (from) {
      query = query.gte('ended_at', from);
    }
    if (to) {
      query = query.lte('ended_at', to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to summarize sessions: ${error.message}`);
    }

    const rows = data ?? [];
    const completedRows = status ? rows : rows.filter((row) => row.status === 'completed');

    const totalMinutes = completedRows.reduce(
      (acc, row) => acc + (row.duration_minutes ?? 0),
      0,
    );

    return {
      totalTimeStudied: toMillis(totalMinutes),
      timesStudied: completedRows.length,
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
    },
  };
};

// Default export: production instance using the configured Supabase client
const defaultService = createSessionsService();
export default defaultService;
