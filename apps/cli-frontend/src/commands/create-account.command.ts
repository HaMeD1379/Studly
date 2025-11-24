/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-account.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements the create-account command for user registration. Handles API
 *  communication with the backend authentication service, validates responses,
 *  and automatically logs in the user upon successful account creation.
 *
 *  Features
 *  --------
 *  • User account creation with email, password, and full name
 *  • Automatic session creation and persistence after signup
 *  • User-friendly terminal UI with loading indicators and formatted output
 *  • Helpful error messages with suggestions for common issues
 *
 *  Design Principles
 *  -----------------
 *  • Single responsibility: only handles account creation logic
 *  • User-centric feedback with clear success/error messages
 *  • Secure password handling (masked display in terminal)
 *  • Graceful error handling with appropriate exit codes
 *
 *
 *  @module commands/create-account
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { apiPost } from '../utils/api.client.js';
import { saveSession, type Session } from '../utils/session.storage.js';
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
 * Options required for creating a new account
 */
export interface CreateAccountOptions {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Expected response structure from the signup API endpoint
 */
interface SignupResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: {
      id: string;
      email: string;
      user_metadata: {
        full_name: string;
      };
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMAND IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Executes the create-account command workflow
 *
 * @param options - User registration details (email, password, fullName)
 * @returns Promise<void> - Exits process on completion or error
 */
export async function runCreateAccountCommand(
  options: CreateAccountOptions
): Promise<void> {
  // Clear terminal and display header
  clearScreen();
  displayHeader('STUDLY - CREATE ACCOUNT');

  // Display registration details (mask password)
  console.log('Creating your Studly account...\n');
  displayData('Email', options.email);
  displayData('Password', '*'.repeat(options.password.length));
  displayData('Full Name', options.fullName);
  displayDivider();

  // Show loading indicator
  const loader = displayLoading('Creating account...');

  // Call backend signup API
  const response = await apiPost<SignupResponse>('/api/v1/auth/signup', {
    email: options.email,
    password: options.password,
    full_name: options.fullName,
  });

  stopLoading(loader);

  // Handle API errors
  if (!response.success || !response.data) {
    displayError(`Account creation failed: ${response.error}`);

    // Provide helpful suggestion if account already exists
    if (response.error?.includes('already')) {
      console.log('💡 This email is already registered. Try logging in instead:');
      console.log(`   studly login --email ${options.email} --password <your-password>\n`);
    }

    process.exit(1);
  }

  // Account created successfully
  displaySuccess('Account created successfully!');

  const { user, session } = response.data;

  // Display user information
  console.log('Your Account Details:');
  displayData('User ID', user.id);
  displayData('Email', user.email);
  displayData('Full Name', user.full_name);
  displayDivider();

  // Save session for automatic login
  const sessionData: Session = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    expiresAt: session.expires_at * 1000, // Convert to milliseconds
    createdAt: Date.now(),
  };

  saveSession(sessionData);

  // Display success message and next steps
  displaySuccess('You are now logged in!');
  console.log('🎉 Welcome to Studly! Your session has been saved.\n');
  console.log('You can now use other commands like:');
  console.log('  studly create-session --title "Study Session"');
  console.log('  studly get-session-summary');
  console.log('');
  console.log('Your session will expire in 1 hour.');
  console.log('');
}

