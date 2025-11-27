#!/usr/bin/env node
// filepath: apps/cli-frontend/src/index.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/index.ts
 *  Project: Studly — CLI Frontend
 *  Designer/Prompter: Hamed Esmaeilzadeh
 *  Implemented-by: Gemini 3 and Claude 4.5
 *  Comments-by: Gemini 3 and Claude 4.5
 *  Last-Updated: 2025-11-26
 *  @file CLI entry point
 *  @designer Hamed Esmaeilzadeh
 *  @prompter Hamed Esmaeilzadeh
 *  @implemented-by Gemini 3 and Claude 4.5
 *  @comments-by Gemini 3 and Claude 4.5
 * ────────────────────────────────────────────────────────────────────────────────
 */
// tags: Studly, CLI, TypeScript

/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/index.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Main entry point for the Studly CLI application. Provides an interactive REPL
 *  (Read-Eval-Print Loop) interface that continuously listens for commands until
 *  the user logs out. Also supports traditional command-line argument execution.
 *
 *  Features
 *  --------
 *  • Interactive REPL mode with continuous command prompt
 *  • User authentication commands (create-account, login, logout)
 *  • Study session management (create-session, get-session-summary)
 *  • Automatic exit on logout
 *  • Support for both REPL and traditional CLI modes
 *
 *  Design Principles
 *  -----------------
 *  • Interactive by default, exits on logout
 *  • Keep CLI entry point minimal and focused on command routing
 *  • Delegate business logic to individual command modules
 *  • Use Commander.js for consistent CLI interface and help generation
 *  • Support chaining and scripting with proper exit codes
 *
 *  TODOs
 *  -----
 *  • [FEATURE] Add session editing and deletion commands
 *  • [FEATURE] Add leaderboard and badges viewing commands
 *  • [UX] Add command history and autocomplete
 *  • [ERROR HANDLING] Add global error handler for uncaught exceptions
 *
 *  @module cli-frontend/index
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import * as readline from 'readline';
import { runCreateAccountCommand } from './commands/create-account.command.js';
import { runInteractiveCreateAccount } from './commands/create-account-interactive.command.js';
import { runLoginCommand } from './commands/login.command.js';
import { runInteractiveLogin } from './commands/login-interactive.command.js';
import { runLogoutCommand } from './commands/logout.command.js';
import { runCreateSessionCommand } from './commands/create-session.command.js';
import { runInteractiveCreateSession } from './commands/create-session-interactive.command.js';
import { runGetSessionSummaryCommand } from './commands/get-session-summary.command.js';
import { runListSessionsInteractive } from './commands/list-sessions-interactive.command.js';
import { runEndSessionInteractive } from './commands/end-session-interactive.command.js';
import { clearScreen, displayHeader } from './utils/screen.utils.js';
import { apiGet } from './utils/api.client.js';
import { ScreenRefresher } from './utils/screen-advanced.utils.js';
import { clearSession, getValidSession } from './utils/session.storage.js';
import { getAnimatedLogo } from './utils/animated-logo.utils.js';

const program = new Command();

// Configure CLI program metadata
program
  .name('studly')
  .description('Studly CLI — manage your study sessions from the terminal')
  .version('0.1.0');

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATION COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Command: create-account
 * Creates a new user account and automatically logs in the user
 */
program
  .command('create-account')
  .description('Create a new Studly user account and auto-login\n' +
    '  Example: studly create-account --email john@example.com --password Pass123! --full-name "John Doe"')
  .option('--email <email>', 'Email address')
  .option('--password <password>', 'Password')
  .option('--full-name <fullName>', 'Full name')
  .action(async (options) => {
    if (!options.email || !options.password || !options.fullName) {
      console.log('\x1b[36mℹ️  Starting interactive account creation...\x1b[0m\n');
      await runInteractiveCreateAccount();
      return;
    }
    await runCreateAccountCommand({
      email: options.email,
      password: options.password,
      fullName: options.fullName,
    });
  });

/**
 * Command: login
 * Authenticates existing user and saves session locally
 */
program
  .command('login')
  .description('Login to your Studly account\n' +
    '  Example: studly login --email john@example.com --password Pass123!')
  .option('--email <email>', 'Email address')
  .option('--password <password>', 'Password')
  .action(async (options) => {
    if (!options.email || !options.password) {
      console.log('\x1b[36mℹ️  Starting interactive login...\x1b[0m\n');
      await runInteractiveLogin();
      return;
    }
    await runLoginCommand(options);
  });

/**
 * Command: logout
 * Clears local session and logs out the user
 */
program
  .command('logout')
  .description('Logout from your Studly account\n' +
    '  Example: studly logout')
  .action(async () => {
    await runLogoutCommand(true); // Exit after logout in traditional CLI mode
  });

// ═══════════════════════════════════════════════════════════════════════════════
//  SESSION MANAGEMENT COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Command: create-session
 * Creates a new study session with optional duration
 */
program
  .command('create-session')
  .description('Create a new study session\n' +
    '  Example: studly create-session --title "Math Homework" --duration-minutes 60\n' +
    '  Example: studly create-session --title "Reading Chapter 5"')
  .option('--title <title>', 'Session title')
  .option('--duration-minutes <minutes>', 'Duration in minutes', parseInt)
  .action(async (options) => {
    if (!options.title) {
      console.log('\x1b[36mℹ️  Starting interactive session creation...\x1b[0m\n');
      await runInteractiveCreateSession();
      return;
    }
    await runCreateSessionCommand(options);
  });

/**
 * Command: get-session-summary
 * Retrieves and displays user's session statistics
 */
program
  .command('get-session-summary')
  .description('Get a summary of your study sessions\n' +
    '  Example: studly get-session-summary')
  .action(async () => {
    await runGetSessionSummaryCommand();
  });

// ═══════════════════════════════════════════════════════════════════════════════
//  INTERACTIVE REPL MODE - HIGH-FREQUENCY REFRESH
// ═══════════════════════════════════════════════════════════════════════════════

// State management for interactive mode
interface InteractiveState {
  currentInput: string;
  lastOutput: string[];
  isProcessing: boolean;
  commandHistory: string[];
  historyIndex: number;
  cursorPosition: number;
  activeSessions: any[];
}

let state: InteractiveState = {
  currentInput: '',
  lastOutput: [],
  isProcessing: false,
  commandHistory: [],
  historyIndex: -1,
  cursorPosition: 0,
  activeSessions: [],
};

/**
 * Fetch active sessions from API
 */
async function fetchActiveSessions(): Promise<void> {
  const session = getValidSession();
  if (!session) {
    state.activeSessions = [];
    return;
  }

  try {
    const response = await apiGet(`/api/v1/sessions?userId=${session.userId}&limit=20`);
    if (response.success && response.data && response.data.sessions) {
      const now = new Date();
      state.activeSessions = response.data.sessions.filter((s: any) => new Date(s.endTime) > now);
    } else {
      state.activeSessions = [];
    }
  } catch (error) {
    // Silently fail - don't disrupt UI
    state.activeSessions = [];
  }
}

/**
 * Parse command string and extract command and arguments
 */
function parseCommandString(input: string): { command: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  const command = parts[0] || '';
  const args = parts.slice(1);
  return { command, args };
}

/**
 * Render the interactive interface (called at high frequency)
 */
function renderInteractiveUI(): void {
  // Build the entire frame in a buffer to avoid multiple writes and scrolling issues
  let output = '';
  const width = process.stdout.columns || 80;

  // Get and update the animated logo
  const logo = getAnimatedLogo();
  logo.update();

  // 1. Logo
  output += logo.render('\x1b[1m\x1b[36m') + '\n';
  output += '\n';

  // 2. Header
  const header = '═══ STUDLY CLI - INTERACTIVE MODE ═══';
  const padding = Math.max(0, Math.floor((width - header.length) / 2));
  output += ' '.repeat(padding) + '\x1b[1m\x1b[36m' + header + '\x1b[0m' + '\n';
  output += '═'.repeat(width) + '\n';

  // 3. Session info
  const session = getValidSession();
  if (session) {
    output += `\x1b[32m✓\x1b[0m Logged in as: \x1b[1m${session.fullName || session.email}\x1b[0m` + '\n';
  } else {
    output += `\x1b[33m○\x1b[0m Not logged in - use \x1b[1mlogin\x1b[0m or \x1b[1mcreate-account\x1b[0m` + '\n';
  }
  output += '─'.repeat(width) + '\n';
  output += '\n';

  // 3.5 Active Sessions Display
  if (session && state.activeSessions && state.activeSessions.length > 0) {
    output += '\x1b[1m\x1b[32m🔴 ACTIVE SESSIONS\x1b[0m\n';
    output += '\n';

    const now = new Date();
    state.activeSessions.forEach((s: any) => {
      const endTime = new Date(s.endTime);
      const startTime = new Date(s.startTime);
      const totalMs = endTime.getTime() - startTime.getTime();
      const elapsedMs = now.getTime() - startTime.getTime();
      const remainingMs = Math.max(0, endTime.getTime() - now.getTime());

      const elapsedMins = elapsedMs / 60000;
      const totalMins = totalMs / 60000;
      const remainingMins = Math.floor(remainingMs / 60000);
      const remainingSecs = Math.floor((remainingMs % 60000) / 1000);

      // Progress bar
      const barWidth = 30;
      const progress = Math.min(1, elapsedMins / totalMins);
      const filled = Math.round(progress * barWidth);
      const empty = barWidth - filled;

      let barColor = '\x1b[32m'; // Green
      if (progress > 0.66) barColor = '\x1b[33m'; // Yellow
      if (progress > 0.90) barColor = '\x1b[31m'; // Red

      const bar = barColor + '█'.repeat(filled) + '\x1b[90m' + '░'.repeat(empty) + '\x1b[0m';
      const percentage = Math.round(progress * 100);
      const timeLeft = `${remainingMins}:${remainingSecs.toString().padStart(2, '0')}`;

      output += `  \x1b[36m→\x1b[0m \x1b[1m${s.subject.substring(0, 30)}\x1b[0m\n`;
      output += `    [${bar}] ${percentage}% - ${timeLeft} left\n`;
      output += `    \x1b[90mID: ${s.id.substring(0, 8)}\x1b[0m\n`;
      output += '\n';
    });

    output += '─'.repeat(width) + '\n';
    output += '\n';
  }

  // 4. Last command output
  if (state.lastOutput.length > 0) {
    const maxOutputLines = Math.max(5, process.stdout.rows ? process.stdout.rows - 18 : 10);
    const outputToShow = state.lastOutput.slice(-maxOutputLines);
    outputToShow.forEach(line => {
      output += line + '\n';
    });
    output += '\n';
  }

  // 5. Command prompt
  output += '─'.repeat(width) + '\n';
  if (state.isProcessing) {
    output += '\x1b[33m⟳\x1b[0m Processing command...\n';
  } else {
    output += '\x1b[1m\x1b[36mstudly>\x1b[0m ' + state.currentInput + '\x1b[7m \x1b[0m' + '\n';
  }

  // 6. Help hint
  output += '─'.repeat(width) + '\n';
  // Note: No newline at the very end to prevent scrolling if at bottom of screen
  output += '\x1b[2mCommands: help | /r (refresh) | /c (clear) | exit\x1b[0m';

  // Clear the rest of the line for every line to prevent ghost text
  const cleanOutput = output.replace(/\n/g, '\x1b[K\n') + '\x1b[K';
  process.stdout.write(cleanOutput);
}

/**
 * Execute a command in interactive mode
 */
async function executeCommand(input: string): Promise<boolean> {
  const { command, args } = parseCommandString(input);

  if (!command) {
    return false; // Continue loop
  }

  // Capture console output
  const originalLog = console.log;
  const originalError = console.error;
  const capturedOutput: string[] = [];

  console.log = (...args: any[]) => {
    capturedOutput.push(args.join(' '));
  };
  console.error = (...args: any[]) => {
    capturedOutput.push('\x1b[31m' + args.join(' ') + '\x1b[0m');
  };

  try {
    // Special commands
    if (command === '/r' || command === '/refresh') {
      capturedOutput.push('\x1b[32m✓\x1b[0m Screen refreshed');
      return false;
    }

    if (command === '/c' || command === '/clear') {
      state.lastOutput = [];
      capturedOutput.push('\x1b[32m✓\x1b[0m Output cleared');
      return false;
    }

    switch (command.toLowerCase()) {
      case 'create-account': {
        // In REPL mode, use interactive step-by-step flow
        if (args.length === 0) {
          // Temporarily restore console for interactive prompts
          console.log = originalLog;
          console.error = originalError;
          await runInteractiveCreateAccount();
          state.lastOutput = ['\x1b[32m✓\x1b[0m Account creation completed'];
          return false;
        }

        // Traditional CLI mode with arguments
        const emailIdx = args.indexOf('--email');
        const passwordIdx = args.indexOf('--password');
        const fullNameIdx = args.indexOf('--full-name');

        if (emailIdx === -1 || passwordIdx === -1 || fullNameIdx === -1) {
          capturedOutput.push('\x1b[31m✗\x1b[0m Usage: create-account --email <email> --password <password> --full-name <fullName>');
          capturedOutput.push('\x1b[33m💡\x1b[0m Or just type "create-account" for interactive mode!');
          return false;
        }

        await runCreateAccountCommand({
          email: args[emailIdx + 1],
          password: args[passwordIdx + 1],
          fullName: args.slice(fullNameIdx + 1).join(' ').replace(/^["']|["']$/g, ''),
        });
        return false;
      }

      case 'login': {
        // In REPL mode, use interactive step-by-step flow
        if (args.length === 0) {
          // Temporarily restore console for interactive prompts
          console.log = originalLog;
          console.error = originalError;
          const success = await runInteractiveLogin();
          state.lastOutput = success
            ? ['\x1b[32m✓\x1b[0m Login successful']
            : ['\x1b[31m✗\x1b[0m Login failed or cancelled'];
          return false;
        }

        // Traditional CLI mode with arguments
        const emailIdx = args.indexOf('--email');
        const passwordIdx = args.indexOf('--password');

        if (emailIdx === -1 || passwordIdx === -1) {
          capturedOutput.push('\x1b[31m✗\x1b[0m Usage: login --email <email> --password <password>');
          capturedOutput.push('\x1b[33m💡\x1b[0m Or just type "login" for interactive mode!');
          return false;
        }

        await runLoginCommand({
          email: args[emailIdx + 1],
          password: args[passwordIdx + 1],
        });
        return false;
      }

      case 'logout': {
        // Temporarily restore console for interactive prompts
        console.log = originalLog;
        console.error = originalError;
        await runLogoutCommand(false);
        state.lastOutput = ['\x1b[32m✓\x1b[0m Logged out successfully'];
        return false; // Don't exit CLI
      }

      case 'create-session': {
        // In REPL mode, use interactive step-by-step flow
        if (args.length === 0) {
          // Temporarily restore console for interactive prompts
          console.log = originalLog;
          console.error = originalError;
          const success = await runInteractiveCreateSession();
          state.lastOutput = success
            ? ['\x1b[32m✓\x1b[0m Session created successfully']
            : ['\x1b[31m✗\x1b[0m Session creation failed or cancelled'];
          return false;
        }

        // Traditional CLI mode with arguments
        const titleIdx = args.indexOf('--title');
        const durationIdx = args.indexOf('--duration-minutes');

        if (titleIdx === -1) {
          capturedOutput.push('\x1b[31m✗\x1b[0m Usage: create-session --title <title> [--duration-minutes <minutes>]');
          capturedOutput.push('\x1b[33m💡\x1b[0m Or just type "create-session" for interactive mode!');
          return false;
        }

        const options: { title: string; durationMinutes?: number } = {
          title: args[titleIdx + 1],
        };

        if (durationIdx !== -1) {
          options.durationMinutes = parseInt(args[durationIdx + 1]);
        }

        await runCreateSessionCommand(options);
        return false;
      }

      case 'get-session-summary':
      case 'summary': {
        // Temporarily restore console for interactive prompts
        console.log = originalLog;
        console.error = originalError;
        const success = await runGetSessionSummaryCommand();
        state.lastOutput = success
          ? ['\x1b[32m✓\x1b[0m Summary retrieved']
          : ['\x1b[31m✗\x1b[0m Failed to retrieve summary'];
        return false;
      }

      case 'list-sessions':
      case 'list':
      case 'ls': {
        // Temporarily restore console for interactive prompts
        console.log = originalLog;
        console.error = originalError;
        const success = await runListSessionsInteractive();
        state.lastOutput = success
          ? ['\x1b[32m✓\x1b[0m Sessions listed']
          : ['\x1b[31m✗\x1b[0m Failed to list sessions'];
        return false;
      }

      case 'end-session':
      case 'end':
      case 'finish': {
        // Temporarily restore console for interactive prompts
        console.log = originalLog;
        console.error = originalError;
        const success = await runEndSessionInteractive();
        state.lastOutput = success
          ? ['\x1b[32m✓\x1b[0m Session ended']
          : ['\x1b[31m✗\x1b[0m Failed to end session'];
        return false;
      }

      case 'help':
      case '?': {
        // Temporarily restore console for interactive display
        console.log = originalLog;
        console.error = originalError;
        await showHelpInteractive();
        return false;
      }

      case 'clear':
      case 'cls': {
        state.lastOutput = [];
        capturedOutput.push('\x1b[32m✓\x1b[0m Output cleared');
        return false;
      }

      case 'exit':
      case 'quit':
      case 'q': {
        capturedOutput.push('\x1b[36m👋 Goodbye!\x1b[0m');
        return true;
      }

      default: {
        capturedOutput.push(`\x1b[31m✗\x1b[0m Unknown command: ${command}`);
        capturedOutput.push('\x1b[33m💡\x1b[0m Type "help" to see available commands');
        return false;
      }
    }
  } catch (error) {
    capturedOutput.push('\x1b[31m✗ Error:\x1b[0m ' + String(error));
    return false;
  } finally {
    // Restore console
    console.log = originalLog;
    console.error = originalError;

    // Update state with captured output
    if (capturedOutput.length > 0) {
      state.lastOutput = capturedOutput;
    }
  }
}

/**
 * Display available commands in interactive mode (pauses for user to read)
 */
async function showHelpInteractive(): Promise<void> {
  const helpLines = [
    '\x1b[1m\x1b[36m═══════════════════════════════════════════════════════\x1b[0m',
    '\x1b[1m\x1b[36m                📖 STUDLY CLI HELP                     \x1b[0m',
    '\x1b[1m\x1b[36m═══════════════════════════════════════════════════════\x1b[0m',
    '',
    '\x1b[1m\x1b[33m🔐 AUTHENTICATION COMMANDS\x1b[0m',
    '─'.repeat(55),
    '',
    '  \x1b[32mcreate-account\x1b[0m',
    '    → Create a new Studly account (interactive mode)',
    '    \x1b[2mExample: Just type "create-account" and follow prompts\x1b[0m',
    '',
    '  \x1b[32mcreate-account --email <email> --password <password> --full-name <name>\x1b[0m',
    '    → Create account with all details at once',
    '    \x1b[2mExample: create-account --email john@example.com --password Pass123! --full-name "John Doe"\x1b[0m',
    '',
    '  \x1b[32mlogin\x1b[0m',
    '    → Login to your account (interactive mode)',
    '    \x1b[2mExample: Just type "login" and enter email & password\x1b[0m',
    '',
    '  \x1b[32mlogin --email <email> --password <password>\x1b[0m',
    '    → Login with credentials directly',
    '    \x1b[2mExample: login --email john@example.com --password Pass123!\x1b[0m',
    '',
    '  \x1b[32mlogout\x1b[0m',
    '    → Sign out of your account',
    '    \x1b[2mExample: logout\x1b[0m',
    '',
    '\x1b[1m\x1b[33m📚 SESSION MANAGEMENT\x1b[0m',
    '─'.repeat(55),
    '',
    '  \x1b[32mcreate-session\x1b[0m',
    '    → Create a new study session (interactive mode)',
    '    \x1b[2mExample: Just type "create-session" and follow prompts\x1b[0m',
    '',
    '  \x1b[32mcreate-session --title <title> [--duration-minutes <mins>]\x1b[0m',
    '    → Create session with details directly',
    '    \x1b[2mExample: create-session --title "Math Homework" --duration-minutes 60\x1b[0m',
    '    \x1b[2mExample: create-session --title "Reading Chapter 5"\x1b[0m',
    '',
    '  \x1b[32mget-session-summary\x1b[0m  or  \x1b[32msummary\x1b[0m',
    '    → View your study session statistics',
    '    \x1b[2mExample: summary\x1b[0m',
    '',
    '  \x1b[32mlist-sessions\x1b[0m  or  \x1b[32mlist\x1b[0m  or  \x1b[32mls\x1b[0m',
    '    → View your session history (active and completed)',
    '    \x1b[2mExample: list\x1b[0m',
    '',
    '  \x1b[32mend-session\x1b[0m  or  \x1b[32mend\x1b[0m  or  \x1b[32mfinish\x1b[0m',
    '    → End an active session early',
    '    \x1b[2mExample: end\x1b[0m',
    '',
    '\x1b[1m\x1b[33m🛠️  UTILITY COMMANDS\x1b[0m',
    '─'.repeat(55),
    '',
    '  \x1b[32m/r\x1b[0m  or  \x1b[32m/refresh\x1b[0m',
    '    → Refresh the screen',
    '',
    '  \x1b[32m/c\x1b[0m  or  \x1b[32m/clear\x1b[0m',
    '    → Clear the output area',
    '',
    '  \x1b[32mhelp\x1b[0m  or  \x1b[32m?\x1b[0m',
    '    → Show this help message',
    '',
    '  \x1b[32mexit\x1b[0m  or  \x1b[32mquit\x1b[0m  or  \x1b[32mq\x1b[0m',
    '    → Exit the application',
    '',
    '\x1b[1m\x1b[36m═══════════════════════════════════════════════════════\x1b[0m',
    '\x1b[33m💡 TIP:\x1b[0m Most commands support interactive mode!',
    '       Just type the command name without arguments.',
    '\x1b[1m\x1b[36m═══════════════════════════════════════════════════════\x1b[0m',
  ];

  helpLines.forEach(line => console.log(line));
  console.log('');

  await inquirer.prompt([{
    type: 'input',
    name: 'continue',
    message: 'Press Enter to return to CLI...',
    prefix: '⌨️ '
  }]);
}

/**
 * Render only the static header (Logo, Title, Session) and clear screen
 * Used before handing off control to interactive commands
 */
function renderStaticHeader(): void {
  // Clear screen and scrollback, then move to home
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H');

  let output = '';
  const width = process.stdout.columns || 80;

  // Get and update the animated logo (use current frame)
  const logo = getAnimatedLogo();

  // 1. Logo
  output += logo.render('\x1b[1m\x1b[36m') + '\n';
  output += '\n';

  // 2. Header
  const header = '═══ STUDLY CLI - INTERACTIVE MODE ═══';
  const padding = Math.max(0, Math.floor((width - header.length) / 2));
  output += '═'.repeat(width) + '\n';

  // 3. Session info
  const session = getValidSession();
  if (session) {
    output += `\x1b[32m✓\x1b[0m Logged in as: \x1b[1m${session.fullName || session.email}\x1b[0m` + '\n';
  } else {
    output += `\x1b[33m○\x1b[0m Not logged in - use \x1b[1mlogin\x1b[0m or \x1b[1mcreate-account\x1b[0m` + '\n';
  }
  output += '─'.repeat(width) + '\n';

  // Clear rest of line to be safe
  const cleanOutput = output.replace(/\n/g, '\x1b[K\n') + '\x1b[K';
  process.stdout.write(cleanOutput);
}

/**
 * Start high-frequency interactive REPL mode
 */
async function startInteractiveREPL(): Promise<void> {
  // Initialize state
  state = {
    currentInput: '',
    lastOutput: [
      '\x1b[36m🎓 Welcome to Studly CLI!\x1b[0m',
      '',
      'Type \x1b[1mhelp\x1b[0m to see available commands.',
      'Type \x1b[1m/r\x1b[0m to refresh, \x1b[1m/c\x1b[0m to clear output.',
    ],
    isProcessing: false,
    commandHistory: [],
    historyIndex: -1,
    cursorPosition: 0,
    activeSessions: [],
  };

  // Setup high-frequency screen refresh (60Hz)
  const refresher = new ScreenRefresher(7);
  refresher.start(() => {
    if (!state.isProcessing) {
      renderInteractiveUI();
    }
  });

  // Fetch active sessions initially and every 5 seconds
  fetchActiveSessions();
  const sessionRefreshInterval = setInterval(() => {
    fetchActiveSessions();
  }, 5000);

  // Setup readline for input handling
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  let shouldExit = false;

  // Handle keypress events
  process.stdin.on('keypress', async (str, key) => {
    if (state.isProcessing) return;

    if (key.ctrl && key.name === 'c') {
      refresher.stop();
      process.exit(0);
    }

    if (key.name === 'return') {
      // Execute command
      const command = state.currentInput.trim();
      if (command) {
        state.commandHistory.push(command);
        state.historyIndex = state.commandHistory.length;
        state.isProcessing = true;

        // Render one last frame to show processing state
        renderInteractiveUI();

        // Stop refresher and raw mode to allow command to control screen/input
        refresher.stop();
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }

        // Render static header so the command runs "under" it
        renderStaticHeader();

        shouldExit = await executeCommand(command);

        // Ensure stdin is resumed after command execution (fixes freeze issue)
        process.stdin.resume();

        state.currentInput = '';
        state.cursorPosition = 0;
        state.isProcessing = false;

        if (shouldExit) {
          process.exit(0);
        } else {
          // Resume refresher and raw mode
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
          }
          refresher.start(() => {
            if (!state.isProcessing) {
              renderInteractiveUI();
            }
          });
        }
      }
    } else if (key.name === 'backspace') {
      if (state.currentInput.length > 0) {
        state.currentInput = state.currentInput.slice(0, -1);
      }
    } else if (key.name === 'up') {
      // Navigate command history
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentInput = state.commandHistory[state.historyIndex] || '';
      }
    } else if (key.name === 'down') {
      // Navigate command history
      if (state.historyIndex < state.commandHistory.length - 1) {
        state.historyIndex++;
        state.currentInput = state.commandHistory[state.historyIndex] || '';
      } else {
        state.historyIndex = state.commandHistory.length;
        state.currentInput = '';
      }
    } else if (str && !key.ctrl && !key.meta) {
      state.currentInput += str;
    }
  });

  // Keep process alive
  return new Promise(() => { });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

// If no arguments provided, start high-frequency interactive REPL mode
if (process.argv.length <= 2) {
  // Always start as not logged in for fresh session, as requested
  clearSession();

  startInteractiveREPL().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else {
  // Traditional CLI mode with arguments
  program.parseAsync(process.argv);
}
