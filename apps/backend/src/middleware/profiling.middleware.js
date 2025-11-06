// filepath: apps/backend/src/middleware/profiling.middleware.js
/**
 * Lightweight request timing middleware for profiling.
 * Enabled only when ENABLE_PROFILING=1 to avoid overhead in normal runs.
 *
 * On process exit, writes a JSON array of timing objects to
 *   apps/backend/profiles/route-timings.json
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const timings = [];

function profilingEnabled() {
  return process.env.ENABLE_PROFILING === '1' || process.env.NODE_ENV === 'test';
}

export default function profilingMiddleware(req, res, next) {
  if (!profilingEnabled()) return next();

  const start = process.hrtime.bigint();
  res.on('finish', () => {
    try {
      const durNs = Number(process.hrtime.bigint() - start);
      const hasRoute = Boolean(req.route?.path);
      const base = req.baseUrl ?? '';
      const path = hasRoute ? req.route.path : (req.path ?? (req.originalUrl?.split('?')[0] ?? ''));
      const route = `${base}${path}` || (req.originalUrl?.split('?')[0] ?? '');
      timings.push({
        ts: new Date().toISOString(),
        method: req.method,
        route,
        status: res.statusCode,
        duration_ms: Math.round((durNs / 1e6) * 1000) / 1000,
      });
    } catch {
      // ignore timing errors
    }
  });

  next();
}

process.on('exit', () => {
  try {
    if (profilingEnabled() && timings.length) {
      const __filename = fileURLToPath(import.meta.url);
      const outDir = resolve(dirname(__filename), '..', '..', 'profiles');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'route-timings.json'), JSON.stringify(timings, null, 2));
    }
  } catch {
    // swallow errors on exit
  }
});

process.on('beforeExit', () => {
  try {
    if (profilingEnabled() && timings.length) {
      const __filename = fileURLToPath(import.meta.url);
      const outDir = resolve(dirname(__filename), '..', '..', 'profiles');
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'route-timings.json'), JSON.stringify(timings, null, 2));
    }
  } catch {
    // ignore
  }
});
