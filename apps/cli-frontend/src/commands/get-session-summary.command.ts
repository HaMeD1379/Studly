/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/get-session-summary.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements the get-session-summary command for retrieving and displaying user
 *  study session statistics. Requires authentication and communicates with the
 *  backend sessions API to fetch aggregated session data.
 *
 *  Features
 *  --------
 *  • Retrieves comprehensive session statistics for authenticated user
 *  • Enforces authentication before data retrieval
 *  • User-friendly terminal UI with loading indicators
 *  • Displays summary data in readable JSON format
 *
 *  Design Principles
 *  -----------------
 *  • Single responsibility: only handles session summary retrieval
 *  • Authentication-aware: verifies user session before proceeding
 *  • Clear user feedback for success and error scenarios
 *  • Minimal and focused command interface
 *
 *
 *  @module commands/get-session-summary
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { apiGet } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';
import {
  clearScreen,
  displayHeader,
  displaySuccess,
  displayError,
  displayLoading,
  stopLoading,
  displayDivider,
} from '../utils/screen.utils.js';
import '../utils/config.utils.js'; // Load environment variables

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMAND IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Executes the get-session-summary command workflow
 *
 * Verifies user authentication, fetches session summary from backend API, and
 * displays results. Exits with error code if authentication fails or API request
 * fails.
 *
 * @returns Promise<void> - Exits process on completion or error
 */
export async function runGetSessionSummaryCommand(): Promise<void> {
  // Clear terminal and display header
  clearScreen();
  displayHeader('STUDLY - SESSION SUMMARY');

  // Verify user is authenticated
  const session = getValidSession();
  if (!session) {
    displayError('You must be logged in to view session summary.');
    console.log('Please login first:');
    console.log('  studly login --email <your-email> --password <your-password>\n');
    process.exit(1);
  }

  // Display loading message
  console.log(`Fetching session summary for ${session.email}...\n`);
  displayDivider();

  // Show loading indicator
  const loader = displayLoading('Loading...');

  // Call backend sessions summary API
  const response = await apiGet('/api/v1/sessions/summary');

  stopLoading(loader);

  // Handle API errors
  if (!response.success) {
    displayError(`Failed to fetch summary: ${response.error}`);
    process.exit(1);
  }

  // Display success message
  displaySuccess('Session summary retrieved!');

  // Display summary data if available
  if (response.data) {
    console.log('Summary:');
    console.log(JSON.stringify(response.data, null, 2));
  }

  console.log('');
}

