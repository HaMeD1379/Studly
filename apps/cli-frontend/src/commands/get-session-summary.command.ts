// filepath: apps/cli-frontend/src/commands/get-session-summary.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/get-session-summary.command.ts
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
 *  • Displays summary data in formatted tables
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
 * @returns Promise<boolean> - Returns true on success, false on failure
 */
export async function runGetSessionSummaryCommand(): Promise<boolean> {
  // Clear terminal and display header
  clearScreen();
  displayHeader('STUDLY - SESSION SUMMARY');

  // Verify user is authenticated
  const session = getValidSession();
  if (!session) {
    displayError('You must be logged in to view session summary.');
    console.log('Please login first:');
    console.log('  studly login --email <your-email> --password <your-password>\n');

    // Wait for acknowledgement
    await import('inquirer').then(inquirer => inquirer.default.prompt([{
      type: 'input',
      name: 'ack',
      message: 'Press Enter to continue...',
      prefix: '⌨️ '
    }]));

    return false;
  }

  // Display loading message
  console.log(`Fetching session summary for ${session.email}...\n`);
  displayDivider();

  // Show loading indicator
  const loader = displayLoading('Loading...');

  // Call backend sessions summary API
  const response = await apiGet(`/api/v1/sessions/summary?userId=${session.userId}`);

  stopLoading(loader);

  // Handle API errors
  if (!response.success) {
    displayError(`Failed to fetch summary: ${response.error}`);

    // Wait for acknowledgement
    await import('inquirer').then(inquirer => inquirer.default.prompt([{
      type: 'input',
      name: 'ack',
      message: 'Press Enter to continue...',
      prefix: '⌨️ '
    }]));

    return false;
  }

  // Display success message
  displaySuccess('Session summary retrieved!');

  // Display summary data if available
  if (response.data) {
    console.log();
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║              📊 SESSION SUMMARY                        ║');
    console.log('╠═══════════════════════════════════════════════════════╣');
    console.log(`║ Total Minutes Studied:  ${String(response.data.totalMinutesStudied).padEnd(28)}  ║`);
    console.log(`║ Sessions Logged:        ${String(response.data.sessionsLogged).padEnd(28)}  ║`);
    if (response.data.averageMinutesPerSession) {
      console.log(`║ Avg Minutes/Session:    ${String(Math.round(response.data.averageMinutesPerSession)).padEnd(28)}  ║`);
    }

    // Display subject summaries if available
    if (response.data.subjectSummaries && response.data.subjectSummaries.length > 0) {
      console.log('╠═══════════════════════════════════════════════════════╣');
      console.log('║              📚 BY SUBJECT                             ║');
      console.log('╠═══════════════════════════════════════════════════════╣');

      response.data.subjectSummaries.forEach((subject: any) => {
        const subjectName = subject.subject.substring(0, 20).padEnd(20);
        const mins = String(subject.totalMinutesStudied).padStart(4);
        const sessions = String(subject.sessionsLogged).padStart(2);
        console.log(`║ ${subjectName} ${mins} min (${sessions} sessions)           ║`);
      });
    }

    console.log('╚═══════════════════════════════════════════════════════╝');
  }

  console.log('');

  // Wait for acknowledgement so user can read the summary
  await import('inquirer').then(inquirer => inquirer.default.prompt([{
    type: 'input',
    name: 'ack',
    message: 'Press Enter to return to CLI...',
    prefix: '⌨️ '
  }]));

  return true;
}
