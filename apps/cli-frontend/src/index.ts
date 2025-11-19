#!/usr/bin/env node

import { Command } from 'commander';
import { runCreateAccountCommand } from './commands/createAccount.js';
import { runLoginCommand } from './commands/login.js';
import { runCreateSessionCommand } from './commands/createSession.js';
import { runGetSessionSummaryCommand } from './commands/getSessionSummary.js';

const program = new Command();

program
  .name('studly')
  .description('Studly CLI frontend')
  .version('0.1.0');

program
  .command('create-account')
  .description('Create a new Studly account')
  .requiredOption('--email <email>', 'Email address')
  .requiredOption('--password <password>', 'Password')
  .action(async (options) => {
    await runCreateAccountCommand({
      email: options.email,
      password: options.password,
    });
  });

program
  .command('login')
  .description('Log in to Studly')
  .requiredOption('--email <email>', 'Email address')
  .requiredOption('--password <password>', 'Password')
  .action(async (options) => {
    await runLoginCommand({
      email: options.email,
      password: options.password,
    });
  });

program
  .command('create-session')
  .description('Create a new study session')
  .requiredOption('--title <title>', 'Session title')
  .option('--durationMinutes <minutes>', 'Duration in minutes', (value) => Number.parseInt(value, 10))
  .action(async (options) => {
    await runCreateSessionCommand({
      title: options.title,
      durationMinutes: options.durationMinutes,
    });
  });

program
  .command('session-summary')
  .description('Get a summary for a study session')
  .requiredOption('--sessionId <id>', 'Session identifier')
  .action(async (options) => {
    await runGetSessionSummaryCommand({
      sessionId: options.sessionId,
    });
  });

program.parseAsync(process.argv);

