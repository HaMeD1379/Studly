// filepath: apps/cli-frontend/src/utils/table-formatter.utils.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/table-formatter.utils.ts
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
 * Table formatting utility for displaying data in ASCII tables
 */

export interface TableColumn {
    header: string;
    key: string;
    width?: number;
    align?: 'left' | 'right' | 'center';
}

/**
 * Renders data as an ASCII table
 */
export function renderTable(data: any[], columns: TableColumn[]): string {
    if (data.length === 0) {
        return '\x1b[90mNo data to display\x1b[0m';
    }

    // Calculate column widths
    const widths = columns.map(col => {
        const headerWidth = col.header.length;
        const dataWidth = Math.max(...data.map(row => String(row[col.key] || '').length));
        return col.width || Math.max(headerWidth, dataWidth, 10);
    });

    const lines: string[] = [];

    // Top border
    lines.push('╔' + widths.map(w => '═'.repeat(w + 2)).join('╦') + '╗');

    // Header
    const headerCells = columns.map((col, i) => {
        const text = col.header;
        return ' ' + padText(text, widths[i], 'center') + ' ';
    });
    lines.push('║' + headerCells.join('║') + '║');

    // Header separator
    lines.push('╠' + widths.map(w => '═'.repeat(w + 2)).join('╬') + '╣');

    // Data rows
    data.forEach(row => {
        const cells = columns.map((col, i) => {
            const text = String(row[col.key] || '');
            return ' ' + padText(text, widths[i], col.align || 'left') + ' ';
        });
        lines.push('║' + cells.join('║') + '║');
    });

    // Bottom border
    lines.push('╚' + widths.map(w => '═'.repeat(w + 2)).join('╩') + '╝');

    return lines.join('\n');
}

/**
 * Pad text to specified width with alignment
 */
function padText(text: string, width: number, align: 'left' | 'right' | 'center'): string {
    if (text.length >= width) {
        return text.substring(0, width);
    }

    const padding = width - text.length;

    if (align === 'right') {
        return ' '.repeat(padding) + text;
    } else if (align === 'center') {
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
    } else {
        return text + ' '.repeat(padding);
    }
}

/**
 * Render a simple box with title and content
 */
export function renderBox(title: string, content: string[]): string {
    const maxWidth = Math.max(title.length, ...content.map(line => line.length)) + 4;

    const lines: string[] = [];
    lines.push('╔' + '═'.repeat(maxWidth) + '╗');
    lines.push('║ ' + padText(title, maxWidth - 2, 'center') + ' ║');
    lines.push('╠' + '═'.repeat(maxWidth) + '╣');

    content.forEach(line => {
        lines.push('║ ' + padText(line, maxWidth - 2, 'left') + ' ║');
    });

    lines.push('╚' + '═'.repeat(maxWidth) + '╝');

    return lines.join('\n');
}
