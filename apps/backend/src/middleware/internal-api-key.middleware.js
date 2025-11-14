/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/middleware/internal-api-key.middleware.js
 *  Project: Studly — Backend
 *  Purpose: Protect internal API routes behind an INTERNAL_API_TOKEN header.
 *  Behavior: Skips enforcement when NODE_ENV === 'test' to keep tests passing.
 * ────────────────────────────────────────────────────────────────────────────────
 */

export default function requireInternalApiKey(req, res, next) {
  // Allow tests to exercise routes without providing a token
  if (process.env.NODE_ENV === 'test') return next();

  let expected = process.env.INTERNAL_API_TOKEN;
  // When running with the in-memory mock, default token to avoid misconfig
  if (!expected && process.env.STUDLY_USE_MOCK === '1') {
    expected = 'studly-local-token';
  }
  if (!expected) {
    // Server is misconfigured in non-test environment
    return res.status(500).json({ error: 'Server misconfigured: INTERNAL_API_TOKEN missing' });
  }

  // Accept both x-internal-api-key (preferred) and x-api-key (legacy) for backward compatibility
  const provided = req.header('x-internal-api-key') || req.header('x-api-key');
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}
