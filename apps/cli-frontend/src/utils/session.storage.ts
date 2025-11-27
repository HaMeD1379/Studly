// filepath: apps/cli-frontend/src/utils/session.storage.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/session.storage.ts
 *  Project: Studly — CLI Frontend
 *  Designer/Prompter: Hamed Esmaeilzadeh
 *  Implemented-by: Gemini 3 and Claude 4.5
 *  Comments-by: Gemini 3 and Claude 4.5
 *  Last-Updated: 2025-11-26
 *  @designer Hamed Esmaeilzadeh
 *  @prompter Hamed Esmaeilzadeh
 *  @implemented-by Gemini 3 and Claude 4.5
 *  @comments-by Gemini 3 and Claude 4.5
 * ────────────────────────────────────────────────────────────────────────────────
 */
// tags: Studly, CLI, TypeScript

/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/session.storage.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Session management utility module for persisting user authentication state
 *  locally. Handles session storage, retrieval, validation, and expiration
 *  checking in the user's home directory.
 *
 *  Features
 *  --------
 *  • Persistent session storage in user's home directory (~/.studly-cli/)
 *  • Session expiration validation
 *  • Automatic expired session cleanup
 *  • Type-safe session data structure
 *
 *  Design Principles
 *  -----------------
 *  • Store session data in a user-specific, hidden directory
 *  • Validate session expiration before use
 *  • Provide simple, atomic operations for session management
 *  • Graceful error handling for filesystem operations
 *
 *
 *  @module utils/session-storage
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Directory for storing CLI session data in user's home directory */
const SESSION_DIR = join(homedir(), '.studly-cli');

/** Path to the session data file */
const SESSION_FILE = join(SESSION_DIR, 'session.json');

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * User session data structure
 */
export interface Session {
  /** JWT access token for API authentication */
  accessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Unique user identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** User's full name */
  fullName: string;
  /** Unix timestamp (milliseconds) when the session expires */
  expiresAt: number;
  /** Unix timestamp (milliseconds) when the session was created */
  createdAt: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SESSION STORAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ensures the session storage directory exists
 * Creates the directory if it doesn't exist
 */
function ensureSessionDir(): void {
  if (!existsSync(SESSION_DIR)) {
    mkdirSync(SESSION_DIR, { recursive: true });
  }
}

/**
 * Saves a session to local storage
 *
 * @param session - Session data to persist
 */
export function saveSession(session: Session): void {
  ensureSessionDir();
  const data = JSON.stringify(session, null, 2);
  writeFileSync(SESSION_FILE, data, 'utf-8');
}

/**
 * Loads a session from local storage
 *
 * @returns Session object if found and valid, null otherwise
 */
export function loadSession(): Session | null {
  try {
    if (!existsSync(SESSION_FILE)) {
      return null;
    }
    const data = readFileSync(SESSION_FILE, 'utf-8');
    return JSON.parse(data) as Session;
  } catch (error) {
    // Return null on any error (file not found, parse error, etc.)
    return null;
  }
}

/**
 * Checks if a session has expired
 *
 * @param session - Session to validate
 * @returns true if session has expired, false otherwise
 */
export function isSessionExpired(session: Session): boolean {
  return Date.now() >= session.expiresAt;
}

/**
 * Retrieves a valid session from local storage
 *
 * Loads the session and checks if it's expired. If expired, clears the session
 * and returns null.
 *
 * @returns Valid session object or null if no session or expired
 */
export function getValidSession(): Session | null {
  const session = loadSession();
  if (!session) {
    return null;
  }
  if (isSessionExpired(session)) {
    clearSession();
    return null;
  }
  return session;
}

/**
 * Clears the session from local storage
 *
 * Writes an empty string to the session file to invalidate it
 */
export function clearSession(): void {
  try {
    if (existsSync(SESSION_FILE)) {
      writeFileSync(SESSION_FILE, '', 'utf-8');
    }
  } catch (error) {
    // Silently ignore errors when clearing session
  }
}

/**
 * Checks if a valid session exists
 *
 * @returns true if a valid (non-expired) session exists, false otherwise
 */
export function isLoggedIn(): boolean {
  return getValidSession() !== null;
}
