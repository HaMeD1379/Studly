// filepath: apps/cli-frontend/src/commands/create-session.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-session.command.ts
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
 * Non-interactive create session command
 */
import { apiPost } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';
import { displaySuccess, displayError } from '../utils/screen.utils.js';

interface CreateSessionOptions {
    title: string;
    durationMinutes?: number;
}

export async function runCreateSessionCommand(options: CreateSessionOptions): Promise<void> {
    const session = getValidSession();
    if (!session) {
        displayError('Not logged in. Please login first.');
        return;
    }

    console.log('Creating session...');

    // Calculate timestamps for ACTIVE session
    const startTime = new Date(); // Start now
    const durationMs = (options.durationMinutes || 60) * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs); // End in the future

    const response = await apiPost('/api/v1/sessions', {
        userId: session.userId,
        subject: options.title,
        sessionType: 1, // Default to type 1 (study session)
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalMinutes: options.durationMinutes || 60,
    });

    if (response.success && response.data) {
        displaySuccess('Study session created successfully!');
        console.log(`ID: ${response.data.id}`);
        console.log(`Title: ${response.data.title || options.title}`);
        console.log(`Duration: ${options.durationMinutes || 60} minutes`);
    } else {
        displayError(`Failed to create session: ${response.error || 'Unknown error'}`);
    }
}
