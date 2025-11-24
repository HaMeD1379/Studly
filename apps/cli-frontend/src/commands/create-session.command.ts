/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-session.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements the create-session command for recording new study sessions.
 *  Requires user authentication and communicates with the backend sessions API
 *  to persist session data.
 *
 *  Features
 *  --------
 *  • Creates new study sessions with title and optional duration
 *  • Enforces authentication before session creation
 *  • User-friendly terminal UI with loading indicators
 *  • Displays created session details on success
 *
 *  Design Principles
 *  -----------------
 *  • Single responsibility: only handles session creation logic
 *  • Authentication-aware: verifies user session before proceeding
 *  • Clear user feedback for success and error scenarios
 *  • Minimal and focused command interface
 *
 *
 *  @module commands/create-session
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { apiPost } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';
import {
  clearScreen,
  displayHeader,
  displaySuccess,
  displayError,
  displayData,
  displayLoading,
  stopLoading,
  displayDivider,
} from '../utils/screen.utils.js';
import '../utils/config.utils.js'; // Load environment variables

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Options required for creating a new study session
 */
export interface CreateSessionOptions {
  title: string;
  durationMinutes?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMAND IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Executes the create-session command workflow
 *
 * Verifies user authentication, sends session data to backend API, and displays
 * results. Exits with error code if authentication fails or API request fails.
 *
 * @param options - Session creation parameters (title, durationMinutes)
 * @returns Promise<void> - Exits process on completion or error
 */
export async function runCreateSessionCommand(
  options: CreateSessionOptions
): Promise<void> {
  // Clear terminal and display header
  clearScreen();
  displayHeader('STUDLY - CREATE SESSION');

  // Verify user is authenticated
  const session = getValidSession();
  if (!session) {
    displayError('You must be logged in to create a session.');
    console.log('Please login first:');
    console.log('  studly login --email <your-email> --password <your-password>\n');
    process.exit(1);
  }

  // Display session creation details
  console.log('Creating study session...\n');
  displayData('Title', options.title);
  displayData('Duration', options.durationMinutes ? `${options.durationMinutes} minutes` : 'Not specified');
  displayData('User', session.email);
  displayDivider();

  // Show loading indicator
  const loader = displayLoading('Creating session...');

  // Call backend sessions API
  const response = await apiPost('/api/v1/sessions', {
    title: options.title,
    duration_minutes: options.durationMinutes,
  });

  stopLoading(loader);

  // Handle API errors
  if (!response.success) {
    displayError(`Session creation failed: ${response.error}`);
    process.exit(1);
  }

  // Display success message
  displaySuccess('Study session created!');

  // Display session details if available
  if (response.data) {
    console.log('Session Details:');
    console.log(JSON.stringify(response.data, null, 2));
  }

  console.log('');
}

