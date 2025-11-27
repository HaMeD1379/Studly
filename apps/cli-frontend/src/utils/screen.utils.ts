// filepath: apps/cli-frontend/src/utils/screen.utils.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/screen.utils.ts
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
 *  File: src/utils/screen.utils.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Terminal UI utility module providing functions for displaying formatted output,
 *  status messages, and visual elements in the CLI. Enhances user experience with
 *  consistent visual styling and interactive feedback.
 *
 *  Features
 *  --------
 *  • Screen clearing for clean command output
 *  • Formatted headers with decorative borders
 *  • Status indicators (success, error, info, warning)
 *  • Animated loading spinner for async operations
 *  • Data display utilities with labels
 *  • Visual dividers for content separation
 *
 *  Design Principles
 *  -----------------
 *  • Consistent visual styling across all commands
 *  • Use of Unicode box-drawing characters for borders
 *  • Emoji indicators for quick status recognition
 *  • Non-blocking loading animations
 *
 *
 *  @module utils/screen-utils
 * ────────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREEN CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Clears the terminal screen
 *
 * Uses ANSI escape sequences for cross-platform compatibility.
 * Falls back to console.clear() on Windows.
 */
export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
  if (process.platform === 'win32') {
    console.clear();
  }
}

/**
 * Displays a formatted header with decorative borders
 *
 * @param title - Title text to display in the header
 */
export function displayHeader(title: string): void {
  const border = '═'.repeat(60);
  console.log(`╔${border}╗`);
  console.log(`║${title.padStart(30 + title.length / 2).padEnd(60)}║`);
  console.log(`╚${border}╝`);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STATUS MESSAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Displays a success message with checkmark indicator
 *
 * @param message - Success message to display
 */
export function displaySuccess(message: string): void {
  console.log(`\n✅ ${message}\n`);
}

/**
 * Displays an error message with cross indicator
 *
 * @param message - Error message to display
 */
export function displayError(message: string): void {
  console.log(`\n❌ ${message}\n`);
}

/**
 * Displays an informational message with info indicator
 *
 * @param message - Info message to display
 */
export function displayInfo(message: string): void {
  console.log(`\nℹ️  ${message}\n`);
}

/**
 * Displays a warning message with warning indicator
 *
 * @param message - Warning message to display
 */
export function displayWarning(message: string): void {
  console.log(`\n⚠️  ${message}\n`);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOADING INDICATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Displays an animated loading spinner
 *
 * Creates a continuous spinner animation that cycles through different frames.
 * Returns an interval timer that should be cleared with stopLoading().
 *
 * @param message - Message to display alongside the spinner
 * @returns NodeJS.Timeout - Interval timer for the animation
 */
export function displayLoading(message: string): NodeJS.Timeout {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[frameIndex]} ${message}`);
    frameIndex = (frameIndex + 1) % frames.length;
  }, 80);

  return interval;
}

/**
 * Stops a loading spinner animation
 *
 * Clears the interval timer and removes the spinner from the terminal.
 *
 * @param interval - The interval timer returned by displayLoading()
 */
export function stopLoading(interval: NodeJS.Timeout): void {
  clearInterval(interval);
  process.stdout.write('\r');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA DISPLAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Displays a labeled data field
 *
 * Formats data as "Label: Value" with consistent indentation.
 *
 * @param label - Label for the data field
 * @param value - Value to display
 */
export function displayData(label: string, value: string): void {
  console.log(`  ${label}: ${value}`);
}

/**
 * Displays a horizontal divider line
 *
 * Uses Unicode box-drawing characters for visual separation.
 */
export function displayDivider(): void {
  console.log('─'.repeat(60));
}
