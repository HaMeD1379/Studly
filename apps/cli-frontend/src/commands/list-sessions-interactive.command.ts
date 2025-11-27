// filepath: apps/cli-frontend/src/commands/list-sessions-interactive.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/list-sessions-interactive.command.ts
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
 * List sessions command - Interactive viewer for session history
 */

import inquirer from 'inquirer';
import { apiGet } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';
import { renderTable, type TableColumn } from '../utils/table-formatter.utils.js';
import { clearScreen } from '../utils/screen.utils.js';
import { displayAnimatedBanner } from '../utils/screen-advanced.utils.js';

export async function runListSessionsInteractive(): Promise<boolean> {
    clearScreen();
    displayAnimatedBanner('SESSION HISTORY');

    console.log('📚 View your study session history\n');

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
        console.log('⟳ Fetching sessions...\n');

        const response = await apiGet(`/api/v1/sessions?userId=${session.userId}&limit=10`);

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

        const sessions = response.data.sessions;

        if (sessions.length === 0) {
            console.log('\x1b[33mNo sessions found.\x1b[0m');
            console.log('Create your first session with the \x1b[1mcreate-session\x1b[0m command!\n');
            await inquirer.prompt([{
                type: 'input',
                name: 'ack',
                message: 'Press Enter to continue...',
                prefix: '⌨️ '
            }]);
            return true;
        }

        // Determine active vs completed
        const now = new Date();
        const activeSessions = sessions.filter((s: any) => new Date(s.endTime) > now);
        const completedSessions = sessions.filter((s: any) => new Date(s.endTime) <= now);

        // Display active sessions
        if (activeSessions.length > 0) {
            console.log('\x1b[32m\x1b[1m🔴 ACTIVE SESSIONS\x1b[0m\n');

            const activeColumns: TableColumn[] = [
                { header: 'Subject', key: 'subject', width: 25 },
                { header: 'Duration', key: 'duration', width: 10, align: 'right' },
                { header: 'Remaining', key: 'remaining', width: 12, align: 'right' },
                { header: 'ID', key: 'shortId', width: 10 }
            ];

            const activeData = activeSessions.map((s: any) => {
                const endTime = new Date(s.endTime);
                const remaining = Math.max(0, Math.round((endTime.getTime() - now.getTime()) / 60000));
                return {
                    subject: s.subject,
                    duration: `${s.totalMinutes} min`,
                    remaining: `${remaining} min`,
                    shortId: s.id.substring(0, 8)
                };
            });

            console.log(renderTable(activeData, activeColumns));
            console.log();
        }

        // Display completed sessions
        if (completedSessions.length > 0) {
            console.log('\x1b[90m\x1b[1m✓ COMPLETED SESSIONS (Last 10)\x1b[0m\n');

            const completedColumns: TableColumn[] = [
                { header: 'Subject', key: 'subject', width: 25 },
                { header: 'Duration', key: 'duration', width: 10, align: 'right' },
                { header: 'Date', key: 'date', width: 12 },
                { header: 'Type', key: 'type', width: 8 }
            ];

            const completedData = completedSessions.map((s: any) => ({
                subject: s.subject,
                duration: `${s.totalMinutes} min`,
                date: s.date,
                type: `Type ${s.sessionType}`
            }));

            console.log(renderTable(completedData, completedColumns));
            console.log();
        }

        console.log(`\x1b[36m→\x1b[0m Showing ${sessions.length} session(s)`);
        console.log();

        await inquirer.prompt([{
            type: 'input',
            name: 'ack',
            message: 'Press Enter to return to CLI...',
            prefix: '⌨️ '
        }]);

        return true;
    } catch (error) {
        console.error('\x1b[31m✗ Error fetching sessions:\x1b[0m', String(error));
        await inquirer.prompt([{
            type: 'input',
            name: 'ack',
            message: 'Press Enter to continue...',
            prefix: '⌨️ '
        }]);
        return false;
    }
}
