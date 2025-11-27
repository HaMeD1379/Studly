// filepath: apps/cli-frontend/src/utils/progress-bar.utils.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/progress-bar.utils.ts
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
 * Progress bar utility for displaying session progress
 */

export interface ProgressBarOptions {
    width?: number;
    showPercentage?: boolean;
    showTime?: boolean;
}

/**
 * Renders a progress bar for a session
 * @param elapsed - Minutes elapsed
 * @param total - Total minutes
 * @param options - Display options
 * @returns Formatted progress bar string
 */
export function renderProgressBar(
    elapsed: number,
    total: number,
    options: ProgressBarOptions = {}
): string {
    const { width = 30, showPercentage = true, showTime = true } = options;

    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    // Color based on progress
    let barColor = '\x1b[32m'; // Green
    if (percentage > 66) {
        barColor = '\x1b[33m'; // Yellow
    }
    if (percentage > 90) {
        barColor = '\x1b[31m'; // Red
    }

    const bar = barColor + '█'.repeat(filled) + '\x1b[90m' + '░'.repeat(empty) + '\x1b[0m';

    let result = `[${bar}]`;

    if (showPercentage) {
        result += ` ${Math.round(percentage)}%`;
    }

    if (showTime) {
        const remaining = Math.max(0, total - elapsed);
        const mins = Math.floor(remaining);
        const secs = Math.round((remaining - mins) * 60);
        result += ` ${mins}:${secs.toString().padStart(2, '0')} left`;
    }

    return result;
}

/**
 * Format time duration as MM:SS
 */
export function formatDuration(minutes: number): string {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
