// filepath: apps/cli-frontend/src/commands/logout.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/logout.command.ts
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
 *  File: src/commands/logout.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements the logout command for ending user sessions. Clears locally stored
 *  session data and provides feedback to the user about successful logout.
 *
 *  Features
 *  --------
 *  • Clears local session storage
 *  • Verifies session existence before attempting logout
 *  • User-friendly terminal feedback
 *  • Provides next steps after logout
 *
 *  Design Principles
 *  -----------------
 *  • Single responsibility: only handles logout logic
 *  • Graceful handling of "not logged in" scenarios
 *  • Clear user feedback and guidance
 *  • Minimal dependencies and straightforward implementation
 *
 *
 *  @module commands/logout
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { clearSession, getValidSession } from '../utils/session.storage.js';
import {
  clearScreen,
  displayHeader,
  displaySuccess,
  displayInfo,
} from '../utils/screen.utils.js';

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMAND IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Executes the logout command workflow
 *
 * Checks for an active session, clears it from local storage, and provides
 * feedback to the user. If no session exists, informs the user gracefully.
 *
 * @param exitAfterLogout - Whether to exit the process after logout (default: false for REPL mode)
 * @returns Promise<boolean> - Returns true if logged out, false if not logged in
 */
export async function runLogoutCommand(exitAfterLogout = false): Promise<boolean> {
  // Clear terminal and display header
  clearScreen();
  displayHeader('STUDLY - LOGOUT');

  // Check for existing session
  const session = getValidSession();

  if (!session) {
    displayInfo('You are not logged in.');
    if (exitAfterLogout) {
      process.exit(0);
    }
    return false;
  }

  // Display logout confirmation
  console.log(`Logging out ${session.email}...\n`);

  // Clear session from local storage
  clearSession();

  // Display success message and next steps
  displaySuccess('You have been logged out successfully!');
  if (!exitAfterLogout) {
    console.log('Returning to main menu...\n');

    // Short pause for user to see message
    await new Promise(resolve => setTimeout(resolve, 1500));
  } else {
    console.log('To login again, use:');
    console.log('  studly login --email <your-email> --password <your-password>\n');
  }

  return true;
}
