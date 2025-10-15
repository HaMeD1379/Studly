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
 *  Lightweight smoke tests for the Supabase client configuration. Ensures the
 *  exported client exposes the expected surface area and remains a singleton.
 *
 *  Features
 *  --------
 *  • Verifies the client export exists and resembles an object.
 *  • Confirms common auth/database methods are available.
 *  • Ensures repeated imports share the same instance via module caching.
 *
 *  Design Principles
 *  -----------------
 *  • Keep environment-specific logic isolated to the configuration layer.
 *  • Use native assertions to avoid third-party testing dependencies.
 *
 *  TODOs
 *  -----
 *  • [CONFIG] Extend tests to validate environment variable fallbacks.
 *
 *  @module tests/unit/supabaseClient
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import supabase from '../../src/config/supabase.js';
import STRINGS from '../../src/config/strings.js';

test(STRINGS.TEST.SUPABASE_EXPORT_CLIENT, () => {
  assert.ok(supabase);
  assert.equal(typeof supabase, STRINGS.GENERAL.OBJECT);
});

test(STRINGS.TEST.SUPABASE_AUTH_METHODS, () => {
  assert.ok(supabase.auth);
  assert.equal(typeof supabase.auth.signUp, STRINGS.GENERAL.FUNCTION);
  assert.equal(
    typeof supabase.auth.signInWithPassword,
    STRINGS.GENERAL.FUNCTION,
  );
  assert.equal(typeof supabase.auth.signOut, STRINGS.GENERAL.FUNCTION);
  assert.equal(
    typeof supabase.auth.resetPasswordForEmail,
    STRINGS.GENERAL.FUNCTION,
  );
  assert.equal(typeof supabase.auth.updateUser, STRINGS.GENERAL.FUNCTION);
});

test(STRINGS.TEST.SUPABASE_DATABASE_METHODS, () => {
  assert.equal(typeof supabase.from, STRINGS.GENERAL.FUNCTION);
});

test(STRINGS.TEST.SUPABASE_SINGLETON, async () => {
  const { default: supabaseSecondImport } = await import(
    '../../src/config/supabase.js'
  );
  assert.strictEqual(supabaseSecondImport, supabase);
});

test(STRINGS.TEST.SUPABASE_MISSING_ENV, () => {
  assert.ok(supabase);
});
