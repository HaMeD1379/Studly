/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: tests/unit/internalApiKey.test.js
 *  Purpose: Unit tests for INTERNAL_API_TOKEN middleware behavior
 * ────────────────────────────────────────────────────────────────────────────────
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import requireInternalApiKey from '../../src/middleware/internalApiKey.js';

const makeCtx = (headers = {}) => {
  const req = { header: (name) => headers[name.toLowerCase()] };
  let statusCode;
  let jsonBody;
  const res = {
    status(code) { statusCode = code; return this; },
    json(body) { jsonBody = body; return this; },
    get _status() { return statusCode; },
    get _json() { return jsonBody; },
  };
  let calledNext = false;
  const next = () => { calledNext = true; };
  return { req, res, next, get calledNext() { return calledNext; } };
};

const withEnv = (keyValues, fn) => {
  const prev = {};
  for (const [k, v] of Object.entries(keyValues)) {
    prev[k] = process.env[k];
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  }
};

test('skips enforcement in test env', () => {
  withEnv({ NODE_ENV: 'test', INTERNAL_API_TOKEN: undefined }, () => {
    const ctx = makeCtx();
    requireInternalApiKey(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.calledNext, true);
  });
});

test('returns 500 when token is missing in non-test env', () => {
  withEnv({ NODE_ENV: 'production' }, () => {
    const ctx = makeCtx();
    requireInternalApiKey(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.calledNext, false);
    assert.equal(ctx.res._status, 500);
    assert.equal(ctx.res._json.error.includes('INTERNAL_API_TOKEN'), true);
  });
});

test('returns 401 when header missing or mismatched', () => {
  withEnv({ NODE_ENV: 'production', INTERNAL_API_TOKEN: 'secret-xyz' }, () => {
    // Missing
    let ctx = makeCtx();
    requireInternalApiKey(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.calledNext, false);
    assert.equal(ctx.res._status, 401);

    // Mismatched
    ctx = makeCtx({ 'x-api-key': 'wrong' });
    requireInternalApiKey(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.calledNext, false);
    assert.equal(ctx.res._status, 401);
  });
});

test('calls next() when header matches token', () => {
  withEnv({ NODE_ENV: 'production', INTERNAL_API_TOKEN: 'secret-abc' }, () => {
    const ctx = makeCtx({ 'x-api-key': 'secret-abc' });
    requireInternalApiKey(ctx.req, ctx.res, ctx.next);
    assert.equal(ctx.calledNext, true);
  });
});
