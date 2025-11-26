// filepath: apps/cli-frontend/src/commands/create-session-interactive.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-session-interactive.command.ts
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

import inquirer from 'inquirer';
import {
  clearScreen,
} from '../utils/screen.utils.js';
import { displayAnimatedBanner } from '../utils/screen-advanced.utils.js';
import { apiPost } from '../utils/api.client.js';
import { getValidSession } from '../utils/session.storage.js';

export async function runInteractiveCreateSession(): Promise<boolean> {
  clearScreen();
  displayAnimatedBanner('CREATE NEW SESSION');

  console.log('💡 Track your study time and stay productive!\n');

  // Check authentication
  const session = getValidSession();
  if (!session) {
    console.error('\x1b[31m✗ Not logged in.\x1b[0m Please login first.');
    console.log('\x1b[33m💡 Tip:\x1b[0m Use the \x1b[1mlogin\x1b[0m command');

    // Wait for user to acknowledge
    await inquirer.prompt([{
      type: 'input',
      name: 'ack',
      message: 'Press Enter to continue...',
      prefix: '⌨️ '
    }]);

    return false;
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

    // Calculate timestamps for ACTIVE session
    const startTime = new Date(); // Start now
    const durationMs = (options.durationMinutes || 60) * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs); // End in the future

    const response = await apiPost('/api/v1/sessions', {
      userId: session.userId,
      subject: options.title,
      sessionType: 1, // Default to type 1 (study session)
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalMinutes: options.durationMinutes || 60,
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

      // Wait 2 seconds so user can read the success message
      await new Promise(resolve => setTimeout(resolve, 2000));

      return true;
    } else {
      console.error('\x1b[31m✗ Failed to create session:\x1b[0m', response.error || 'Unknown error');

      // Wait for acknowledgement
      await inquirer.prompt([{
        type: 'input',
        name: 'ack',
        message: 'Press Enter to continue...',
        prefix: '⌨️ '
      }]);

      return false;
    }
  } catch (error) {
    console.error('\x1b[31m✗ Error creating session:\x1b[0m', String(error));

    // Wait for acknowledgement
    await inquirer.prompt([{
      type: 'input',
      name: 'ack',
      message: 'Press Enter to continue...',
      prefix: '⌨️ '
    }]);

    return false;
  }
}
