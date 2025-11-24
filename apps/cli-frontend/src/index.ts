#!/usr/bin/env node
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
import { clearScreen, displayHeader } from './utils/screen.utils.js';
import { ScreenRefresher } from './utils/screen-advanced.utils.js';
import { getValidSession } from './utils/session.storage.js';
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
}

let state: InteractiveState = {
  currentInput: '',
  lastOutput: [],
  isProcessing: false,
  commandHistory: [],
  historyIndex: -1,
  cursorPosition: 0,
};

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
  // Get and update the animated logo
  const logo = getAnimatedLogo();
  logo.update();

  // Render the animated logo at the top
  console.log(logo.render('\x1b[1m\x1b[36m')); // Bold cyan
  console.log();

  // Header
  const width = process.stdout.columns || 80;
  const header = '═══ STUDLY CLI - INTERACTIVE MODE ═══';
  const padding = Math.max(0, Math.floor((width - header.length) / 2));
  console.log(' '.repeat(padding) + '\x1b[1m\x1b[36m' + header + '\x1b[0m');
  console.log('═'.repeat(width));

  // Session info
  const session = getValidSession();
  if (session) {
    console.log(`\x1b[32m✓\x1b[0m Logged in as: \x1b[1m${session.email}\x1b[0m`);
  } else {
    console.log(`\x1b[33m○\x1b[0m Not logged in - use \x1b[1mlogin\x1b[0m or \x1b[1mcreate-account\x1b[0m`);
  }
  console.log('─'.repeat(width));
  console.log();

  // Last command output
  if (state.lastOutput.length > 0) {
    const maxOutputLines = Math.max(5, process.stdout.rows ? process.stdout.rows - 15 : 10);
    const outputToShow = state.lastOutput.slice(-maxOutputLines);
    outputToShow.forEach(line => console.log(line));
    console.log();
  }

  // Command prompt
  console.log('─'.repeat(width));
  if (state.isProcessing) {
    process.stdout.write('\x1b[33m⟳\x1b[0m Processing command...\n');
  } else {
    process.stdout.write('\x1b[1m\x1b[36mstudly>\x1b[0m ' + state.currentInput + '\x1b[7m \x1b[0m');
  }

  // Help hint
  console.log('\n' + '─'.repeat(width));
  console.log('\x1b[2mCommands: help | /r (refresh) | /c (clear) | exit\x1b[0m');
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
          await runInteractiveLogin();
          state.lastOutput = ['\x1b[32m✓\x1b[0m Login completed'];
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
        const shouldExit = await runLogoutCommand(false);
        if (shouldExit) {
          capturedOutput.push('\x1b[32m✓\x1b[0m Logged out successfully');
        }
        return shouldExit;
      }

      case 'create-session': {
        // In REPL mode, use interactive step-by-step flow
        if (args.length === 0) {
          // Temporarily restore console for interactive prompts
          console.log = originalLog;
          console.error = originalError;
          await runInteractiveCreateSession();
          state.lastOutput = ['\x1b[32m✓\x1b[0m Session creation completed'];
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
        await runGetSessionSummaryCommand();
        return false;
      }

      case 'help':
      case '?': {
        displayHelp();
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
 * Display available commands in interactive mode
 */
function displayHelp(): void {
  state.lastOutput = [
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
  };

  // Setup high-frequency screen refresh (60Hz)
  const refresher = new ScreenRefresher(7);
  refresher.start(() => {
    if (!state.isProcessing) {
      renderInteractiveUI();
    }
  });

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
        renderInteractiveUI();

        shouldExit = await executeCommand(command);

        state.currentInput = '';
        state.cursorPosition = 0;
        state.isProcessing = false;

        if (shouldExit) {
          refresher.stop();
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          process.exit(0);
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
  return new Promise(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

// If no arguments provided, start high-frequency interactive REPL mode
if (process.argv.length <= 2) {
  startInteractiveREPL().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else {
  // Traditional CLI mode with arguments
  program.parseAsync(process.argv);
}

