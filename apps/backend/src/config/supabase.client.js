/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/config/supabase.client.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Creates and exports a singleton Supabase client used throughout the backend.
 *  The client transparently falls back to a stub implementation when environment
 *  variables are missing, enabling tests to run without real credentials while
 *  still surfacing actionable error messages.
 *
 *  Features
 *  --------
 *  • Reads Supabase credentials from environment variables.
 *  • Disables session persistence/auto-refresh for server-side usage.
 *  • Provides a predictable stub client when configuration is incomplete.
 *
 *  Design Principles
 *  -----------------
 *  • Fail loudly at the point of use with descriptive errors.
 *  • Keep configuration isolated from business logic for testability.
 *  • Avoid leaking secrets by never logging raw environment values.
 *
 *  TODOs
 *  -----
 *  • [OBSERVABILITY] Replace console warnings with structured logging.
 *  • [SECURITY] Rotate keys using a secret manager in production deployments.
 *
 *  @module config/supabase.client
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import STRINGS from './strings.config.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const USE_MOCK = process.env.STUDLY_USE_MOCK === '1';

const buildFailureMethod = (methodName) => async () => {
  throw new Error(
    `${STRINGS.SUPABASE.MISSING_ENV_CONFIGURATION}. Attempted to call \`${methodName}\`.`
  );
};

const buildFallbackFrom = () =>
  new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === 'then') return undefined;
        const methodLabel = typeof prop === 'symbol' ? 'symbol' : `from().${prop}`;
        return buildFailureMethod(methodLabel);
      },
    }
  );

const createFallbackClient = () => ({
  auth: {
    signUp: buildFailureMethod('auth.signUp'),
    signInWithPassword: buildFailureMethod('auth.signInWithPassword'),
    signOut: buildFailureMethod('auth.signOut'),
    resetPasswordForEmail: buildFailureMethod('auth.resetPasswordForEmail'),
    updateUser: buildFailureMethod('auth.updateUser'),
  },
  from: () => buildFallbackFrom(),
});

let supabase;

if (!USE_MOCK && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else if (USE_MOCK) {
  // Prefer mock when explicitly requested
  try {
    const mod = await import('../../../../infra/docker/mock/supabase-mock.client.js');
    supabase = mod.default;
    // eslint-disable-next-line no-console
    console.log('🧪 Supabase mock client enabled (in-memory).');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load Supabase mock, falling back to stub:', e?.message || e);
    supabase = createFallbackClient();
  }
} else {
  // Default to fallback stub when envs missing and mock not requested
  supabase = createFallbackClient();
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ Supabase client initialized in fallback mode. Database and auth calls will reject until environment variables are configured.'
  );
}

export default supabase;
