/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/supabaseClient.test.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Sanity checks for the Supabase client configuration. Ensures the exported
 *  instance exposes the expected interface and behaves as a singleton.
 *
 *  Features
 *  --------
 *  • Confirms the client export exists and resembles an object.
 *  • Verifies core auth/database methods are accessible.
 *  • Confirms module caching returns the same instance.
 *
 *  Design Principles
 *  -----------------
 *  • Keep environment-dependent logic isolated to config layer.
 *  • Provide predictable fallbacks when environment variables are missing.
 *
 *  TODOs
 *  -----
 *  • [INTEGRATION] Add contract tests hitting a mocked Supabase REST API.
 *
 *  @module tests/unit/supabaseClient
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from '@jest/globals';
import supabase from '../../src/config/supabase.js';
import STRINGS from '../../src/config/strings.js';

describe(STRINGS.TEST.SUPABASE_CLIENT_CONFIGURATION, () => {
  it(STRINGS.TEST.SUPABASE_EXPORT_CLIENT, () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase).toBe(STRINGS.GENERAL.OBJECT);
  });

  it(STRINGS.TEST.SUPABASE_AUTH_METHODS, () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.signUp).toBe(STRINGS.GENERAL.FUNCTION);
    expect(typeof supabase.auth.signInWithPassword).toBe(
      STRINGS.GENERAL.FUNCTION
    );
    expect(typeof supabase.auth.signOut).toBe(STRINGS.GENERAL.FUNCTION);
    expect(typeof supabase.auth.resetPasswordForEmail).toBe(
      STRINGS.GENERAL.FUNCTION
    );
    expect(typeof supabase.auth.updateUser).toBe(STRINGS.GENERAL.FUNCTION);
  });

  it(STRINGS.TEST.SUPABASE_DATABASE_METHODS, () => {
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe(STRINGS.GENERAL.FUNCTION);
  });

  it(STRINGS.TEST.SUPABASE_SINGLETON, async () => {
    const { default: supabaseAgain } = await import('../../src/config/supabase.js');
    expect(supabase).toBe(supabaseAgain);
  });

  it(STRINGS.TEST.SUPABASE_MISSING_ENV, () => {
    expect(supabase).toBeDefined();
  });
});
