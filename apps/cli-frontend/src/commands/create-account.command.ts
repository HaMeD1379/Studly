// filepath: apps/cli-frontend/src/commands/create-account.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-account.command.ts
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
 * Non-interactive create account command
 */
import { apiPost } from '../utils/api.client.js';
import { saveSession, type Session } from '../utils/session.storage.js';
import { displaySuccess, displayError } from '../utils/screen.utils.js';

interface CreateAccountOptions {
  email: string;
  password: string;
  fullName: string;
}

export async function runCreateAccountCommand(options: CreateAccountOptions): Promise<void> {
  console.log('Creating account...');

  const response = await apiPost<any>('/api/v1/auth/signup', {
    email: options.email,
    password: options.password,
    full_name: options.fullName,
  });

  if (!response.success || !response.data) {
    displayError(`Account creation failed: ${response.error}`);
    return;
  }

  const { user, session } = response.data;

  // Save session
  const sessionData: Session = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    expiresAt: session.expires_at * 1000,
    createdAt: Date.now(),
  };

  saveSession(sessionData);

  displaySuccess('Account created successfully and logged in!');
  console.log(`User ID: ${user.id}`);
}
