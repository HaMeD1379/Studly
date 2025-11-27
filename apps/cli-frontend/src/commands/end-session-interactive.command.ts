// filepath: apps/cli-frontend/src/commands/end-session-interactive.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/end-session-interactive.command.ts
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
 * End session command - End an active session early
 */

import inquirer from 'inquirer';
import { apiGet, apiRequest } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';
import { clearScreen } from '../utils/screen.utils.js';
import { displayAnimatedBanner } from '../utils/screen-advanced.utils.js';

export async function runEndSessionInteractive(): Promise<boolean> {
    clearScreen();
    displayAnimatedBanner('END SESSION');

    console.log('⏹️  End an active session early\n');

    // Check authentication
    const session = getValidSession();
    if (!session) {
        console.error('\x1b[31m✗ Not logged in.\x1b[0m Please login first.');
        await inquirer.prompt([{
            type: 'input',
            name: 'ack',
            message: 'Press Enter to continue...',
            prefix: '⌨️ '
        }]);
        return false;
    }

    try {
        // Fetch active sessions
        console.log('⟳ Fetching active sessions...\n');
        const response = await apiGet(`/api/v1/sessions?userId=${session.userId}&limit=20`);

        if (!response.success || !response.data || !response.data.sessions) {
            console.error('\x1b[31m✗ Failed to fetch sessions:\x1b[0m', response.error || 'Unknown error');
            await inquirer.prompt([{
                type: 'input',
                name: 'ack',
                message: 'Press Enter to continue...',
                prefix: '⌨️ '
            }]);
            return false;
        }

        const now = new Date();
        const activeSessions = response.data.sessions.filter((s: any) => new Date(s.endTime) > now);

        if (activeSessions.length === 0) {
            console.log('\x1b[33mNo active sessions found.\x1b[0m\n');
            await inquirer.prompt([{
                type: 'input',
                name: 'ack',
                message: 'Press Enter to continue...',
                prefix: '⌨️ '
            }]);
            return true;
        }

        // Let user select which session to end
        const choices = activeSessions.map((s: any) => {
            const remaining = Math.max(0, Math.round((new Date(s.endTime).getTime() - now.getTime()) / 60000));
            const subjectColor = '\x1b[1m\x1b[36m'; // Bold cyan
            const timeColor = '\x1b[33m'; // Yellow
            const idColor = '\x1b[90m'; // Gray
            const reset = '\x1b[0m';

            return {
                name: `${subjectColor}${s.subject}${reset} ${timeColor}(${remaining} min remaining)${reset} ${idColor}ID: ${s.id.substring(0, 8)}${reset}`,
                value: s.id,
                session: s
            };
        });

        const { sessionId } = await inquirer.prompt([{
            type: 'list',
            name: 'sessionId',
            message: '\x1b[1mSelect session to end:\x1b[0m',
            choices: choices.map((c: any) => ({ name: c.name, value: c.value })),
            pageSize: 10
        }]);

        const selectedSession = choices.find((c: any) => c.value === sessionId)!.session;

        // Calculate actual duration
        const startTime = new Date(selectedSession.startTime);
        const endTime = new Date(); // End now
        const actualMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        console.log();
        console.log('⟳ Ending session...');

        // Update the session
        const updateResponse = await apiRequest(`/api/v1/sessions/${sessionId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                endTime: endTime.toISOString(),
                totalMinutes: actualMinutes
            })
        });

        if (!updateResponse.success) {
            console.error('\x1b[31m✗ Failed to end session:\x1b[0m', updateResponse.error || 'Unknown error');
            await inquirer.prompt([{
                type: 'input',
                name: 'ack',
                message: 'Press Enter to continue...',
                prefix: '⌨️ '
            }]);
            return false;
        }

        console.log();
        console.log('\x1b[32m✓ Session ended successfully!\x1b[0m');
        console.log();
        console.log('\x1b[1mSession Details:\x1b[0m');
        console.log(`  \x1b[36m→\x1b[0m Subject: \x1b[1m${selectedSession.subject}\x1b[0m`);
        console.log(`  \x1b[36m→\x1b[0m Planned Duration: ${selectedSession.totalMinutes} minutes`);
        console.log(`  \x1b[36m→\x1b[0m Actual Duration: ${actualMinutes} minutes`);
        console.log();

        // Wait 2 seconds so user can read
        await new Promise(resolve => setTimeout(resolve, 2000));

        return true;
    } catch (error) {
        console.error('\x1b[31m✗ Error ending session:\x1b[0m', String(error));
        await inquirer.prompt([{
            type: 'input',
            name: 'ack',
            message: 'Press Enter to continue...',
            prefix: '⌨️ '
        }]);
        return false;
    }
}
