/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/config.utils.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Configuration management utility for loading environment variables from .env
 *  files. Provides a simple parser for .env files and exposes configuration
 *  values to the application.
 *
 *  Features
 *  --------
 *  • Custom .env file parser (no external dependencies)
 *  • Support for comments and empty lines in .env files
 *  • Automatic environment variable injection into process.env
 *  • Graceful fallback to default values when .env is missing
 *
 *  Design Principles
 *  -----------------
 *  • Zero external dependencies for configuration loading
 *  • Simple line-by-line parsing with key=value format
 *  • Provide sensible defaults for local development
 *  • Fail gracefully when .env file is not found
 *
 *  @module utils/config-utils
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ═══════════════════════════════════════════════════════════════════════════════
//  MODULE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

// Resolve current file path for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ════════════════���══════════════════════════════════════════════════════════════
//  ENVIRONMENT LOADING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Loads environment variables from a .env file
 *
 * Parses the .env file line by line, extracting key=value pairs and ignoring
 * comments and empty lines. Returns a dictionary of environment variables.
 *
 * @returns Record<string, string> - Dictionary of environment variables
 */
export function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};

  try {
    // Construct path to .env file (project root - cli-frontend folder)
    // From src/utils -> go up 2 levels to reach project root
    const envPath = join(__dirname, '..', '..', '.env');

    // Return empty object if .env doesn't exist
    if (!existsSync(envPath)) {
      console.warn(`⚠️  No .env file found at: ${envPath}`);
      console.warn('   Using default configuration (localhost)');
      return env;
    }

    // Read and parse .env file
    const envContent = readFileSync(envPath, 'utf-8');
    console.log(`✓ Loaded .env file from: ${envPath}`);

    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse key=value pairs
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        env[key.trim()] = value;

        // Log important config values (not secrets)
        if (key.trim() === 'BACKEND_HOST') {
          console.log(`✓ Backend Host: ${value}`);
        }
      }
    }
  } catch (error: any) {
    console.error('❌ Error loading .env file:', error.message);
  }

  return env;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

// Load environment variables
const envVars = loadEnv();

/**
 * Application configuration object
 *
 * Provides centralized access to configuration values with fallback defaults.
 */
export const config = {
  /** Backend API base URL */
  backendHost: envVars.BACKEND_HOST || 'http://localhost:3000',
  /** Internal API token for CLI-to-backend authentication */
  internalApiToken: envVars.INTERNAL_API_TOKEN || 'studly-local-token',
};

// Display configuration on load
if (config.backendHost.includes('localhost')) {
  console.log('⚠️  Using LOCAL backend:', config.backendHost);
} else {
  console.log('🌐 Using PRODUCTION backend:', config.backendHost);
}

// Inject configuration into process.env for backward compatibility
process.env.BACKEND_HOST = config.backendHost;
process.env.INTERNAL_API_TOKEN = config.internalApiToken;

