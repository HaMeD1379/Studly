/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-session-interactive.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Interactive step-by-step session creation command.
 *  Prompts for title and duration separately for better UX.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import inquirer from 'inquirer';
import { apiPost } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';

export async function runInteractiveCreateSession(): Promise<void> {
  console.log('\n\x1b[1m\x1b[36m📚 Create New Study Session\x1b[0m');
  console.log('─'.repeat(50));
  console.log();

  // Check authentication
  const session = getValidSession();
  if (!session) {
    console.error('\x1b[31m✗ Not logged in.\x1b[0m Please login first.');
    console.log('\x1b[33m💡 Tip:\x1b[0m Use the \x1b[1mlogin\x1b[0m command');
    return;
  }

  try {
    // Step 1: Session Title
    const titleAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: '📝 Session title:',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Title is required';
          }
          if (input.length > 100) {
            return 'Title must be less than 100 characters';
          }
          return true;
        },
      },
    ]);

    // Step 2: Duration (optional)
    const durationAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'duration',
        message: '⏱️  Duration in minutes (optional, press Enter to skip):',
        validate: (input: string) => {
          if (!input || input.trim() === '') return true; // Optional
          const num = parseInt(input);
          if (isNaN(num)) return 'Please enter a valid number';
          if (num <= 0) return 'Duration must be greater than 0';
          if (num > 1440) return 'Duration must be less than 1440 minutes (24 hours)';
          return true;
        },
      },
    ]);

    console.log();
    console.log('⟳ Creating session...');

    const options: { title: string; durationMinutes?: number } = {
      title: titleAnswer.title.trim(),
    };

    if (durationAnswer.duration && durationAnswer.duration.trim()) {
      options.durationMinutes = parseInt(durationAnswer.duration);
    }

    const response = await apiPost('/api/v1/sessions', {
      title: options.title,
      duration_minutes: options.durationMinutes,
    });

    if (response.success && response.data) {
      console.log();
      console.log('\x1b[32m✓ Study session created successfully!\x1b[0m');
      console.log();
      console.log('\x1b[1mSession Details:\x1b[0m');
      console.log(`  \x1b[36m→\x1b[0m Title: \x1b[1m${response.data.title}\x1b[0m`);
      console.log(`  \x1b[36m→\x1b[0m ID: ${response.data.id}`);
      if (response.data.durationMinutes || response.data.duration_minutes) {
        const duration = response.data.durationMinutes || response.data.duration_minutes;
        console.log(`  \x1b[36m→\x1b[0m Duration: ${duration} minutes`);
      }
      console.log(`  \x1b[36m→\x1b[0m Started: ${new Date(response.data.startTime || response.data.start_time).toLocaleString()}`);
      console.log();
      console.log('\x1b[32m🎯 Happy studying!\x1b[0m');
      console.log();
    } else {
      console.error('\x1b[31m✗ Failed to create session:\x1b[0m', response.error || 'Unknown error');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Error creating session:\x1b[0m', String(error));
    process.exitCode = 1;
  }
}

