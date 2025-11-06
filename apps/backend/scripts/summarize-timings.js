/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: apps/backend/scripts/summarize-timings.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Prompter & Design: Hamed Esmaeilzadeh
 *  Implementer & Commenter: ChatGPT
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Reads raw per-route timing data produced by the profiling middleware and
 *  aggregates it by endpoint, producing count, average, p95, and max latency
 *  metrics. Outputs a JSON summary and a console table for quick inspection.
 *
 *  Implementation Notes
 *  --------------------
 *  • Input: profiles/route-timings.json; Output: profiles/route-timings-summary.json
 *  • Computes percentiles from sorted duration arrays; guards against empty sets.
 *  • Uses process.cwd() to respect invocation from apps/backend.
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const timingsPath = join(process.cwd(), 'profiles', 'route-timings.json');
const outPath = join(process.cwd(), 'profiles', 'route-timings-summary.json');

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

function main() {
  let rows = [];
  try {
    rows = JSON.parse(readFileSync(timingsPath, 'utf8'));
  } catch (e) {
    console.error('Could not read timings:', e.message);
    process.exit(1);
  }

  const byKey = new Map();
  for (const r of rows) {
    const key = `${r.method} ${r.route}`;
    const entry = byKey.get(key) || { method: r.method, route: r.route, durations: [] };
    entry.durations.push(Number(r.duration_ms) || 0);
    byKey.set(key, entry);
  }

  const summary = Array.from(byKey.values()).map((e) => {
    const sorted = e.durations.slice().sort((a, b) => a - b);
    const total = sorted.reduce((a, b) => a + b, 0);
    const avg = sorted.length ? total / sorted.length : 0;
    return {
      method: e.method,
      route: e.route,
      count: sorted.length,
      avg_ms: Math.round(avg * 1000) / 1000,
      p95_ms: Math.round(percentile(sorted, 95) * 1000) / 1000,
      max_ms: Math.round(sorted[sorted.length - 1] * 1000) / 1000,
    };
  }).sort((a, b) => b.max_ms - a.max_ms);

  writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), endpoints: summary }, null, 2));
  console.log('Wrote', outPath);
  console.table(summary.slice(0, 10));
}

main();
