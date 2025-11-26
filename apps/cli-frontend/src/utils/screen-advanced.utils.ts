// filepath: apps/cli-frontend/src/utils/screen-advanced.utils.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/screen-advanced.utils.ts
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
 *  File: src/utils/screen-advanced.utils.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Advanced screen utilities with high-frequency refresh support for animations,
 *  loading indicators, and ASCII graphics. Provides real-time UI updates.
 *
 *  Features
 *  --------
 *  • High-frequency screen refresh (60Hz+)
 *  • ASCII animations and loading spinners
 *  • Real-time validation feedback
 *  • Progress bars and meters
 *  • Smooth UI transitions
 *
 *  @module utils/screen-advanced
 * ────────────────────────────────────────────────────────────────────────────────
 */

import * as readline from 'readline';

// ═══════════════════════════════════════════════════════════════════════════════
//  SCREEN CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * High-frequency screen refresher for animations
 */
export class ScreenRefresher {
  private intervalId: NodeJS.Timeout | null = null;
  private frameCallback: (() => void) | null = null;
  private fps = 20;
  private clearBeforeFrame = true;

  constructor(fps: number, clearBeforeFrame = true) {
    this.fps = fps;
    this.clearBeforeFrame = clearBeforeFrame;
  }

  /**
   * Start the refresh loop
   */
  start(callback: () => void): void {
    this.frameCallback = callback;
    const interval = 1000 / this.fps;

    // Hide cursor for smoother rendering
    hideCursor();

    this.intervalId = setInterval(() => {
      if (this.frameCallback) {
        if (this.clearBeforeFrame) {
          // Move cursor to home position (0,0) instead of clearing entire screen
          // This prevents flickering by avoiding the "blank screen" state between frames
          readline.cursorTo(process.stdout, 0, 0);
        }

        this.frameCallback();

        if (this.clearBeforeFrame) {
          // Clear from cursor to end of screen to remove any artifacts
          // from the previous frame that weren't overwritten
          process.stdout.write('\x1b[0J');
        }
      }
    }, interval);
  }

  /**
   * Stop the refresh loop
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Show cursor again
    showCursor();
  }
}

/**
 * Move cursor to specific position
 */
export function moveCursor(x: number, y: number): void {
  readline.cursorTo(process.stdout, x, y);
}

/**
 * Clear from cursor to end of line
 */
export function clearLine(): void {
  readline.clearLine(process.stdout, 0);
}

/**
 * Clear screen and move cursor to top
 */
export function clearScreenAdvanced(): void {
  console.clear();
  moveCursor(0, 0);
}

/**
 * Hide cursor
 */
export function hideCursor(): void {
  process.stdout.write('\x1B[?25l');
}

/**
 * Show cursor
 */
export function showCursor(): void {
  process.stdout.write('\x1B[?25h');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOADING ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DOTS_FRAMES = ['.  ', '.. ', '...', '   '];
const PROGRESS_FRAMES = ['▱▱▱▱▱', '▰▱▱▱▱', '▰▰▱▱▱', '▰▰▰▱▱', '▰▰▰▰▱', '▰▰▰▰▰'];

export class AnimatedSpinner {
  private frame = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private message: string;
  private frames: string[];

  constructor(message: string, type: 'spinner' | 'dots' | 'progress' = 'spinner') {
    this.message = message;
    this.frames = type === 'spinner' ? SPINNER_FRAMES : type === 'dots' ? DOTS_FRAMES : PROGRESS_FRAMES;
  }

  start(): void {
    hideCursor();
    this.intervalId = setInterval(() => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`${this.frames[this.frame]} ${this.message}`);
      this.frame = (this.frame + 1) % this.frames.length;
    }, 80);
  }

  stop(finalMessage?: string): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    readline.cursorTo(process.stdout, 0);
    clearLine();
    if (finalMessage) {
      console.log(finalMessage);
    }
    showCursor();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VALIDATION INDICATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Password strength indicator
 */
export interface PasswordStrength {
  score: number; // 0-5
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  message: string;
  color: string;
}

export function analyzePasswordStrength(password: string): PasswordStrength {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const score = [hasLength, hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  let message = 'Very Weak';
  let color = '\x1b[31m'; // Red

  if (score >= 5) {
    message = 'Very Strong';
    color = '\x1b[32m'; // Green
  } else if (score >= 4) {
    message = 'Strong';
    color = '\x1b[36m'; // Cyan
  } else if (score >= 3) {
    message = 'Medium';
    color = '\x1b[33m'; // Yellow
  } else if (score >= 2) {
    message = 'Weak';
    color = '\x1b[33m'; // Yellow
  }

  return {
    score,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    message,
    color,
  };
}

/**
 * Display password requirements with real-time status
 */
export function displayPasswordRequirements(password: string = ''): void {
  const strength = analyzePasswordStrength(password);

  console.log('\n┌─────────────────────────────────────────┐');
  console.log('│  Password Requirements:                 │');
  console.log('├─────────────────────────────────────────┤');
  console.log(`│  ${strength.hasLength ? '✓' : '✗'} At least 8 characters              │`);
  console.log(`│  ${strength.hasUpper ? '✓' : '✗'} Contains uppercase letter (A-Z)    │`);
  console.log(`│  ${strength.hasLower ? '✓' : '✗'} Contains lowercase letter (a-z)    │`);
  console.log(`│  ${strength.hasNumber ? '✓' : '✗'} Contains number (0-9)              │`);
  console.log(`│  ${strength.hasSymbol ? '✓' : '✗'} Contains symbol (!@#$%...)         │`);
  console.log('└─────────────────────────────────────────┘');

  if (password.length > 0) {
    const bar = '█'.repeat(strength.score) + '░'.repeat(5 - strength.score);
    console.log(`\nStrength: ${strength.color}${bar}\x1b[0m ${strength.message}\n`);
  }
}

/**
 * Email validation
 */
export function validateEmail(email: string): { valid: boolean; message: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email);

  if (!valid && email.length > 0) {
    if (!email.includes('@')) {
      return { valid: false, message: '❌ Email must contain @' };
    }
    if (!email.includes('.')) {
      return { valid: false, message: '❌ Email must contain domain (.com, .edu, etc.)' };
    }
    return { valid: false, message: '❌ Invalid email format' };
  }

  return { valid: valid && email.length > 0, message: valid ? '✓ Valid email' : '' };
}

/**
 * Display email validation status
 */
export function displayEmailValidation(email: string): void {
  const validation = validateEmail(email);

  if (email.length > 0) {
    console.log('\n' + validation.message);
  } else {
    console.log('\n💡 Enter a valid email address (e.g., student@example.com)');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROGRESS BARS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Display a progress bar
 */
export function displayProgressBar(current: number, total: number, width = 40): void {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((width * current) / total);
  const empty = width - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r[${bar}] ${percentage}%`);

  if (current >= total) {
    process.stdout.write('\n');
  }
}

/**
 * Animated progress bar
 */
export class AnimatedProgressBar {
  private current = 0;
  private total: number;
  private width: number;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(total: number, width = 40) {
    this.total = total;
    this.width = width;
  }

  start(): void {
    hideCursor();
    this.intervalId = setInterval(() => {
      this.current = Math.min(this.current + 1, this.total);
      displayProgressBar(this.current, this.total, this.width);

      if (this.current >= this.total) {
        this.stop();
      }
    }, 50);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    showCursor();
  }

  update(current: number): void {
    this.current = current;
    displayProgressBar(this.current, this.total, this.width);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ASCII ART & DECORATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Display animated welcome banner
 */
export function displayAnimatedBanner(text: string): void {
  console.log('\n');
  const width = text.length + 4;
  const top = '╔' + '═'.repeat(width) + '╗';
  const middle = `║  ${text}  ║`;
  const bottom = '╚' + '═'.repeat(width) + '╝';

  console.log(top);
  console.log(middle);
  console.log(bottom);
  console.log('\n');
}

/**
 * Step indicator
 */
export function displayStep(current: number, total: number, title: string): void {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log(`│  Step ${current}/${total}: ${title.padEnd(41)}│`);
  console.log('└────────────────────────────────────────────────────────┘\n');
}

/**
 * Info box
 */
export function displayInfoBox(title: string, content: string[]): void {
  const maxLength = Math.max(title.length, ...content.map(line => line.length)) + 4;
  const top = '┌─' + '─'.repeat(maxLength) + '─┐';
  const titleLine = `│ ${title.padEnd(maxLength)} │`;
  const divider = '├─' + '─'.repeat(maxLength) + '─┤';
  const bottom = '└─' + '─'.repeat(maxLength) + '─┘';

  console.log(top);
  console.log(titleLine);
  console.log(divider);
  content.forEach(line => {
    console.log(`│ ${line.padEnd(maxLength)} │`);
  });
  console.log(bottom);
}
