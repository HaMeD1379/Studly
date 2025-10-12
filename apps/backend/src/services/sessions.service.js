/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/services/sessions.service.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Hamed Esmaeilzadeh (team member)
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-11
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Service layer responsible for all database operations on the `sessions` table
 *  using the Supabase client. This module isolates data persistence logic from
 *  controller logic, enabling easier testing and dependency injection.
 *
 *  Functions
 *  ----------
 *  • createSession(session)       → inserts a new session record
 *  • completeSession(id, updates) → updates an existing session (marks complete)
 *  • listSessions(filters)        → retrieves sessions (optionally filtered)
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

    return data;
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

    return data;
  };

  /**
   * Retrieve a list of sessions, optionally filtered by user or subject.
   * @param {object} [filters={}] - Optional filters (e.g., { userId, subject }).
   * @returns {Promise<object[]>} - Array of sessions (may be empty).
   * @throws {Error} - If query fails.
   */
  const listSessions = async (filters = {}) => {
    let query = client.from('sessions').select('*');

    // Apply dynamic filters if provided
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.subject) query = query.eq('subject', filters.subject);

    // Always order by most recent start time
    const { data, error } = await query.order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }

    // Ensure return type is always an array
    return data ?? [];
  };

  // Return a service object for controllers or tests to consume
  return { createSession, completeSession, listSessions };
};

// Default export: production instance using the configured Supabase client
const defaultService = createSessionsService();
export default defaultService;
