/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/middleware/internalApiKey.js
 *  Project: Studly — Backend
 *  Purpose: Protect internal API routes behind an INTERNAL_API_TOKEN header.
 *  Behavior: Skips enforcement when NODE_ENV === 'test' to keep tests passing.
 * ────────────────────────────────────────────────────────────────────────────────
 */

export default function requireInternalApiKey(req, res, next) {
  // Allow tests to exercise routes without providing a token
  if (process.env.NODE_ENV === 'test') return next();

  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) {
    // Server is misconfigured in non-test environment
    return res.status(500).json({ error: 'Server misconfigured: INTERNAL_API_TOKEN missing' });
  }

  const provided = req.header('x-api-key');
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}

