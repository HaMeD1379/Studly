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

const routeTimingsPath = join(process.cwd(), 'profiles', 'route-timings.json');
const summaryOutputPath = join(process.cwd(), 'profiles', 'route-timings-summary.json');

function computePercentile(sortedDurations, percentileValue) {
  if (sortedDurations.length === 0) return 0;
  const index = Math.min(
    sortedDurations.length - 1,
    Math.floor((percentileValue / 100) * sortedDurations.length),
  );
  return sortedDurations[index];
}

// Collapse dynamic IDs in routes so they group nicely in the report
function normalizeDynamicSegments(route) {
  if (!route) return route;
  let r = route;
  // Replace UUIDs
  r = r.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ':id');
  // Replace long hex/object ids
  r = r.replace(/\b[0-9a-f]{24}\b/gi, ':id');
  // Replace numeric ids
  r = r.replace(/\b\d{3,}\b/g, ':id');
  // Dedup slashes and trim trailing
  r = r.replace(/\/+/g, '/');
  if (r.length > 1 && r.endsWith('/')) r = r.slice(0, -1);
  return r;
}

function main() {
  let timingRecords = [];
  try {
    timingRecords = JSON.parse(readFileSync(routeTimingsPath, 'utf8'));
  } catch (error) {
    console.error('Could not read timings:', error.message);
    process.exit(1);
  }

  const durationsByEndpoint = new Map();
  for (const record of timingRecords) {
    const method = (record.method || 'GET').toUpperCase();
    const route = normalizeDynamicSegments(record.route || '/');
    const endpointKey = `${method} ${route}`;
    const endpointBucket =
      durationsByEndpoint.get(endpointKey) || { method, route, durations: [] };
    endpointBucket.durations.push(Number(record.duration_ms) || 0);
    durationsByEndpoint.set(endpointKey, endpointBucket);
  }

  const endpointSummaries = Array.from(durationsByEndpoint.values())
    .map((endpoint) => {
      const sortedDurations = endpoint.durations.slice().sort((a, b) => a - b);
      const totalDuration = sortedDurations.reduce((sum, current) => sum + current, 0);
      const averageDuration = sortedDurations.length ? totalDuration / sortedDurations.length : 0;
      return {
        method: endpoint.method,
        route: endpoint.route,
        count: sortedDurations.length,
        avgMs: Math.round(averageDuration * 1000) / 1000,
        p95Ms: Math.round(computePercentile(sortedDurations, 95) * 1000) / 1000,
        maxMs:
          Math.round((sortedDurations.length ? sortedDurations[sortedDurations.length - 1] : 0) * 1000) / 1000,
      };
    })
    .sort((left, right) => right.maxMs - left.maxMs);

  // Write JSON summary with friendlier keys
  writeFileSync(
    summaryOutputPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), endpoints: endpointSummaries }, null, 2),
  );
  console.log('Wrote', summaryOutputPath);

  // Pretty console table with clearer column headers
  const tableRows = endpointSummaries.map((e) => ({
    endpoint: `${e.method} ${e.route}`,
    count: e.count,
    'Avg (ms)': e.avgMs,
    'P95 (ms)': e.p95Ms,
    'Max (ms)': e.maxMs,
  }));
  console.table(tableRows.slice(0, 15));
}

main();
