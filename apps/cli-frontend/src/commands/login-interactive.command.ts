// filepath: apps/cli-frontend/src/commands/login-interactive.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/login-interactive.command.ts
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
 *  File: src/commands/login-interactive.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Interactive step-by-step login command for better user experience.
 *  Prompts for email and password separately.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import inquirer from 'inquirer';
import { apiPost } from '../utils/api.client.js';
import { saveSession, type Session } from '../utils/session.storage.js';

export async function runInteractiveLogin(): Promise<boolean> {
  console.log('\x1b[1m\x1b[36m> LOGIN\x1b[0m\n');

  console.log('💡 Enter your credentials to access your account.\n');

  try {
    // Step 1: Email
    const emailAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: '📧 Email address:',
        validate: (input: string) => {
          if (!input) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
            return 'Please enter a valid email address';
          }
          return true;
        },
      },
    ]);

    // Step 2: Password
    const passwordAnswer = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: '🔒 Password:',
        mask: '*',
        validate: (input: string) => {
          if (!input) return 'Password is required';
          return true;
        },
      },
    ]);

    console.log();
    console.log('⟳ Logging in...');

    const response = await apiPost<any>('/api/v1/auth/login', {
      email: emailAnswer.email,
      password: passwordAnswer.password,
    });

    if (response.success && response.data && response.data.session) {
      const { session } = response.data;
      const user = session.user;

      const sessionData: Session = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        userId: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email,
        expiresAt: session.expires_at * 1000,
        createdAt: Date.now(),
      };

      saveSession(sessionData);
      console.log();
      console.log('\x1b[32m✓ Login successful!\x1b[0m');
      console.log(`\x1b[36m→\x1b[0m Welcome back, \x1b[1m${sessionData.fullName}\x1b[0m`);
      console.log(`\x1b[36m→\x1b[0m Session expires: ${new Date(sessionData.expiresAt).toLocaleString()}`);
      console.log();
      return true;
    } else {
      console.error('\x1b[31m✗ Login failed:\x1b[0m', response.error || 'Unknown error');

      // Provide helpful suggestions
      if (response.error?.includes('Invalid') || response.error?.includes('401')) {
        console.log('\x1b[33m💡 Tip:\x1b[0m Check your email and password and try again.');
      }

      // Wait for acknowledgement so user sees the error
      await inquirer.prompt([{
        type: 'input',
        name: 'ack',
        message: 'Press Enter to continue...',
        prefix: '⌨️ '
      }]);

      return false;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Login failed:\x1b[0m', String(error));

    await inquirer.prompt([{
      type: 'input',
      name: 'ack',
      message: 'Press Enter to continue...',
      prefix: '⌨️ '
    }]);

    return false;
  }
}
