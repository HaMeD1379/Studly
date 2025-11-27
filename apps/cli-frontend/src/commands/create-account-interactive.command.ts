// filepath: apps/cli-frontend/src/commands/create-account-interactive.command.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/commands/create-account-interactive.command.ts
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
 *  File: src/commands/create-account-interactive.command.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Interactive step-by-step account creation with real-time validation and
 *  visual feedback. Uses high-frequency screen updates for smooth UX.
 *
 *  Features
 *  --------
 *  • Step-by-step input collection
 *  • Real-time password strength indicator
 *  • Email validation with feedback
 *  • Visual progress indicators
 *  • Help text and requirements display
 *
 *  @module commands/create-account-interactive
 * ────────────────────────────────────────────────────────────────────────────────
 */

import inquirer from 'inquirer';
import { apiPost } from '../utils/api.client.js';
import { saveSession, type Session } from '../utils/session.storage.js';
import {
  clearScreen,
  displayHeader,
  displaySuccess,
  displayError,
  displayData,
  displayDivider,
} from '../utils/screen.utils.js';
import {
  displayStep,
  displayPasswordRequirements,
  displayEmailValidation,
  analyzePasswordStrength,
  validateEmail,
  AnimatedSpinner,
  displayAnimatedBanner,
} from '../utils/screen-advanced.utils.js';
import '../utils/config.utils.js';

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

interface SignupResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: {
      id: string;
      email: string;
      user_metadata: {
        full_name: string;
      };
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  INTERACTIVE ACCOUNT CREATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run interactive account creation flow
 */
export async function runInteractiveCreateAccount(): Promise<void> {
  console.log('\x1b[1m\x1b[36m> CREATE ACCOUNT\x1b[0m\n');

  console.log('Welcome! Let\'s create your account step by step.\n');
  console.log('💡 You can press Ctrl+C at any time to cancel.\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1: Email
  // ─────────────────────────────────────────────────────────────────────────────

  displayStep(1, 3, 'Email Address');
  console.log('📧 Enter your email address');
  displayEmailValidation('');

  let email = '';
  let emailValid = false;

  while (!emailValid) {
    const { emailInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'emailInput',
        message: 'Email:',
        validate: (input: string) => {
          const validation = validateEmail(input);
          return validation.valid || validation.message;
        },
      },
    ]);

    email = emailInput.trim();
    emailValid = validateEmail(email).valid;

    if (emailValid) {
      console.log('\n✓ Email accepted:', email);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2: Password
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('\n');
  displayStep(2, 3, 'Password');
  console.log('🔒 Create a strong password for your account');
  displayPasswordRequirements();

  let password = '';
  let passwordValid = false;

  while (!passwordValid) {
    const { passwordInput } = await inquirer.prompt([
      {
        type: 'password',
        name: 'passwordInput',
        message: 'Password:',
        mask: '*',
        validate: (input: string) => {
          if (input.length === 0) {
            return 'Password is required';
          }
          const strength = analyzePasswordStrength(input);
          if (strength.score < 3) {
            return 'Password is too weak. Please meet at least 3 requirements.';
          }
          return true;
        },
      },
    ]);

    password = passwordInput;
    const strength = analyzePasswordStrength(password);
    passwordValid = strength.score >= 3;

    if (passwordValid) {
      // Show final strength
      console.log('\n');
      displayPasswordRequirements(password);

      // Confirm password
      const { confirmPassword } = await inquirer.prompt([
        {
          type: 'password',
          name: 'confirmPassword',
          message: 'Confirm password:',
          mask: '*',
          validate: (input: string) => {
            if (input !== password) {
              return 'Passwords do not match!';
            }
            return true;
          },
        },
      ]);

      if (confirmPassword === password) {
        console.log('\n✓ Password confirmed and accepted');
      } else {
        passwordValid = false;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3: Full Name
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('\n');
  displayStep(3, 3, 'Full Name');
  console.log('👤 What\'s your full name?');
  console.log('💡 This will be displayed on your profile and leaderboard.\n');

  const { fullName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fullName',
      message: 'Full Name:',
      validate: (input: string) => {
        if (input.trim().length < 2) {
          return 'Please enter your full name (at least 2 characters)';
        }
        if (input.trim().length > 100) {
          return 'Name is too long (max 100 characters)';
        }
        return true;
      },
    },
  ]);

  console.log('\n✓ Name accepted:', fullName.trim());

  // ─────────────────────────────────────────────────────────────────────────────
  // CONFIRMATION & SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('\n');
  displayDivider();
  console.log('\n📋 Review your information:\n');
  displayData('Email', email);
  displayData('Password', '*'.repeat(password.length));
  displayData('Full Name', fullName.trim());
  console.log('');

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Create account with this information?',
      default: true,
    },
  ]);

  if (!confirm) {
    console.log('\n❌ Account creation cancelled.\n');
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // API SUBMISSION
  // ─────────────────────────────────────────────────────────────────────────────

  console.log('\n');
  const spinner = new AnimatedSpinner('Creating your account...', 'spinner');
  spinner.start();

  // Wait a bit for visual effect
  await new Promise(resolve => setTimeout(resolve, 500));

  const response = await apiPost<SignupResponse>('/api/v1/auth/signup', {
    email: email,
    password: password,
    full_name: fullName.trim(),
  });

  spinner.stop();

  if (!response.success || !response.data) {
    displayError(`\n❌ Account creation failed: ${response.error}`);

    if (response.error?.includes('already')) {
      console.log('\n💡 This email is already registered. Try logging in instead.');
    }

    console.log('');
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SUCCESS
  // ─────────────────────────────────────────────────────────────────────────────

  const { user, session } = response.data;

  console.log('\n');
  displaySuccess('🎉 Account created successfully!');
  console.log('');

  displayDivider();
  console.log('\n📝 Your Account Details:\n');
  displayData('User ID', user.id);
  displayData('Email', user.email);
  displayData('Full Name', user.full_name);
  displayDivider();

  // Save session
  const sessionData: Session = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    expiresAt: session.expires_at * 1000,
    createdAt: Date.now(),
  };

  saveSession(sessionData);

  console.log('\n');
  displaySuccess('✓ You are now logged in!');
  console.log('\n🎯 What\'s next?\n');
  console.log('  • Create your first study session: create-session --title "My Session"');
  console.log('  • View your stats: get-session-summary');
  console.log('  • Type "help" to see all commands');
  console.log('');
}
