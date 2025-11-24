/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/login.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements the login command for user authentication. Communicates with the
 *  backend authentication service to verify credentials and establishes a local
 *  session for subsequent authenticated API requests.
 *
 *  Features
 *  --------
 *  • User authentication with email and password
 *  • Session token persistence for future commands
 *  • User-friendly terminal UI with loading indicators
 *  • Helpful error messages with actionable suggestions
 *
 *  Design Principles
 *  -----------------
 *  • Single responsibility: only handles login logic
 *  • Secure credential handling (password masking)
 *  • Clear user feedback for success and error scenarios
 *  • Session management integrated with local storage
 *
 *
 *  @module commands/login
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
 * Options required for user login
 */
export interface LoginOptions {
  email: string;
  password: string;
}

/**
 * Expected response structure from the login API endpoint
 */
interface LoginResponse {
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
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMMAND IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Executes the login command workflow
 *
 * @param options - User credentials (email, password)
 * @returns Promise<void> - Exits process on completion or error
 */
export async function runLoginCommand(options: LoginOptions): Promise<void> {
  // Clear terminal and display header
  clearScreen();
  displayHeader('STUDLY - LOGIN');

  // Display login details (mask password)
  console.log('Logging in to Studly...\n');
  displayData('Email', options.email);
  displayData('Password', '*'.repeat(options.password.length));
  displayDivider();

  // Show loading indicator
  const loader = displayLoading('Authenticating...');

  // Call backend login API
  const response = await apiPost<LoginResponse>('/api/v1/auth/login', {
    email: options.email,
    password: options.password,
  });

  stopLoading(loader);

  // Handle API errors
  if (!response.success || !response.data) {
    displayError(`Login failed: ${response.error}`);

    // Provide helpful suggestions for common errors
    if (response.error?.includes('Invalid') || response.error?.includes('401')) {
      console.log('💡 Check your email and password and try again.');
      console.log('   If you don\'t have an account, create one:');
      console.log(`   studly create-account --email ${options.email} --password <password> --full-name "Your Name"\n`);
    }

    process.exit(1);
  }

  // Login successful
  displaySuccess('Login successful!');

  const { user, session } = response.data;

  // Display welcome message with user information
  console.log('Welcome back!');
  displayData('User ID', user.id);
  displayData('Email', user.email);
  displayData('Full Name', user.full_name);
  displayDivider();

  // Save session to local storage
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
  displaySuccess('Session saved!');
  console.log('🎉 You are now logged in!\n');
  console.log('You can now use other commands like:');
  console.log('  studly create-session --title "Study Session"');
  console.log('  studly get-session-summary');
  console.log('');
  console.log('Your session will expire in 1 hour.');
  console.log('');
}

