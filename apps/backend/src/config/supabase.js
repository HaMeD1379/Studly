/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/config/supabase.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-11
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Initializes and exports the Supabase client used for all database interactions.
 *  The client is dynamically imported at runtime to avoid hard dependency errors
 *  in test or mock environments (e.g., when @supabase/supabase-js is not installed).
 *
 *  Features
 *  --------
 *  • Graceful fallback when the Supabase library is unavailable.
 *  • Uses environment variables SUPABASE_URL and SUPABASE_SERVICE_KEY.
 *  • Emits a warning if initialization fails (so devs see it early).
 *
 *  Design Principles
 *  -----------------
 *  • Fail safely: service modules throw explicit errors if Supabase is unavailable.
 *  • Config isolation: credentials handled only in this layer.
 *  • Environment-agnostic: supports CI, local dev, and serverless runtimes.
 *
 *  TODOs
 *  -----
 *  • [SECURITY] Ensure env variables are managed securely in deployment.
 *  • [OBSERVABILITY] Integrate structured logging instead of console.warn.
 *  • [TESTABILITY] Mock this module in unit tests to avoid external calls.
 *
 *  @module config/supabase
 *  @see https://supabase.com/docs/reference/javascript
 * ────────────────────────────────────────────────────────────────────────────────
 */

let createClient;
let clientLoadError;

try {
  // Dynamically import to avoid breaking environments where supabase-js isn't installed
  ({ createClient } = await import('@supabase/supabase-js'));
} catch (error) {
  clientLoadError = error;
}

const createUnavailableClient = (reason) =>
  new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === 'then') return undefined; // prevent await-related surprises

        return () => {
          const method = typeof prop === 'symbol' ? 'unknown symbol' : prop.toString();
          throw new Error(`Supabase client is unavailable: ${reason}. Attempted to call \`${method}\`.`);
        };
      },
    }
  );

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;
let warningMessage;

if (clientLoadError) {
  warningMessage = `Supabase client dependency could not be loaded (${clientLoadError.message}).`;
  supabase = createUnavailableClient(warningMessage);
} else if (!supabaseUrl || !supabaseServiceKey) {
  warningMessage = 'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set to initialize Supabase.';
  supabase = createUnavailableClient(warningMessage);
} else {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

if (warningMessage) {
  console.warn(
    '⚠️ Supabase client could not be fully initialized. Database operations will throw until configuration issues are resolved.\n' +
    `   Reason: ${warningMessage}`
  );
}

export default supabase;
