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

export async function runInteractiveLogin(): Promise<void> {
  console.log('\n\x1b[1m\x1b[36m🔐 Login to Your Account\x1b[0m');
  console.log('─'.repeat(50));
  console.log();

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

    const response = await apiPost<Session>('/api/v1/auth/login', {
      email: emailAnswer.email,
      password: passwordAnswer.password,
    });

    if (response.success && response.data) {
      saveSession(response.data);
      console.log();
      console.log('\x1b[32m✓ Login successful!\x1b[0m');
      console.log(`\x1b[36m→\x1b[0m Welcome back, \x1b[1m${response.data.email}\x1b[0m`);
      console.log(`\x1b[36m→\x1b[0m Session expires: ${new Date(response.data.expiresAt).toLocaleString()}`);
      console.log();
    } else {
      console.error('\x1b[31m✗ Login failed:\x1b[0m', response.error || 'Unknown error');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Login failed:\x1b[0m', String(error));
    process.exitCode = 1;
  }
}

