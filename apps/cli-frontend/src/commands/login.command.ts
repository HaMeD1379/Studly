// filepath: apps/cli-frontend/src/commands/login.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/login.command.ts
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
 * Non-interactive login command
 */
import { apiPost } from '../utils/api.client.js';
import { saveSession, type Session } from '../utils/session.storage.js';
import { displaySuccess, displayError } from '../utils/screen.utils.js';

interface LoginOptions {
  email: string;
  password: string;
}

export async function runLoginCommand(options: LoginOptions): Promise<void> {
  console.log('Logging in...');

  const response = await apiPost<any>('/api/v1/auth/login', {
    email: options.email,
    password: options.password,
  });

  if (!response.success || !response.data) {
    displayError(`Login failed: ${response.error}`);
    return;
  }

  const { session } = response.data;

  // Save session
  const sessionData: Session = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: session.user.id,
    email: session.user.email,
    fullName: session.user.user_metadata?.full_name,
    expiresAt: session.expires_at * 1000,
    createdAt: Date.now(),
  };

  saveSession(sessionData);

  displaySuccess('Logged in successfully!');
}
