#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import { promises as fs } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(__filename), '..', '..');
const testsRoot = join(projectRoot, 'tests');

const args = process.argv.slice(2);
const wantsCoverage = args.includes('--coverage');
const nodeArgs = ['--test'];

async function discoverTestFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'support') continue;
      files.push(...await discoverTestFiles(fullPath));
      continue;
    }
    if (entry.name.endsWith('.test.js') || entry.name.endsWith('.spec.js') || entry.name === 'InitialBasicTest.js') {
      files.push(fullPath);
    }
  }
  return files.sort();
}

function toNormalizedRelativePath(absolutePath) {
  const relativePath = relative(projectRoot, absolutePath);
  return relativePath.replace(/\\/g, '/');
}

function shouldTrackFile(absolutePath) {
  const normalized = toNormalizedRelativePath(absolutePath);
  if (!normalized.startsWith('src/')) return false;
  if (normalized === 'src/index.js') return false;
  if (normalized === 'src/server.js') return false;
  if (normalized.startsWith('src/config/')) return false;
  return true;
}

async function readJsonFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const results = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await readJsonFiles(fullPath));
    } else if (entry.name.endsWith('.json')) {
      const content = await fs.readFile(fullPath, 'utf8');
      try {
        results.push(JSON.parse(content));
      } catch (error) {
        console.warn(`Skipping malformed coverage file: ${fullPath}`);
      }
    }
  }
  return results;
}

function buildLineMetadata(source) {
  const lines = source.split('\n');
  let offset = 0;
  const meta = lines.map((text) => {
    const start = offset;
    const end = offset + text.length;
    offset = end + 1; // account for the newline separator
    return { text, start, end };
  });
  return { lines, meta };
}

function updateLineCoverage(record, functions) {
  for (const fn of functions) {
    for (const range of fn.ranges) {
      const start = range.startOffset;
      const end = Math.max(range.endOffset - 1, start);
      for (let index = 0; index < record.meta.length; index += 1) {
        const lineInfo = record.meta[index];
        if (end < lineInfo.start || start > lineInfo.end) {
          continue;
        }
        if (lineInfo.text.trim().length === 0) {
          record.blank.add(index);
          continue;
        }
        record.seen.add(index);
        if (range.count > 0) {
          record.hit.add(index);
        }
      }
    }
  }
}

function summarizeRecord(record) {
  const totalLines = [];
  for (const index of record.seen) {
    if (record.blank.has(index)) continue;
    totalLines.push(index);
  }
  const covered = totalLines.filter((line) => record.hit.has(line));
  const uncovered = totalLines.filter((line) => !record.hit.has(line));
  const percentage = totalLines.length === 0 ? 100 : Math.round((covered.length / totalLines.length) * 10000) / 100;
  return { total: totalLines.length, covered: covered.length, uncovered: uncovered.map((line) => line + 1), pct: percentage };
}

async function generateCoverageReport(v8Dir, outputDir) {
  const coverageEntries = await readJsonFiles(v8Dir);
  const fileRecords = new Map();
  for (const entry of coverageEntries) {
    for (const script of entry.result ?? []) {
      if (!script.url || !script.url.startsWith('file://')) continue;
      const filePath = fileURLToPath(script.url);
      if (!shouldTrackFile(filePath)) continue;
      const key = toNormalizedRelativePath(filePath);
      let record = fileRecords.get(key);
      if (!record) {
        const source = await fs.readFile(filePath, 'utf8');
        const { meta } = buildLineMetadata(source);
        record = { filePath, meta, hit: new Set(), seen: new Set(), blank: new Set() };
        fileRecords.set(key, record);
      }
      updateLineCoverage(record, script.functions ?? []);
    }
  }

  const summaries = [];
  let totalLines = 0;
  let totalCovered = 0;
  for (const [relativePath, record] of fileRecords.entries()) {
    const summary = summarizeRecord(record);
    totalLines += summary.total;
    totalCovered += summary.covered;
    summaries.push({ relativePath, summary });
  }

  summaries.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  const overallPct = totalLines === 0 ? 100 : Math.round((totalCovered / totalLines) * 10000) / 100;

  await fs.mkdir(outputDir, { recursive: true });
  const lcovDir = join(outputDir, 'lcov-report');
  await fs.mkdir(lcovDir, { recursive: true });

  const coverageSummary = {
    total: {
      lines: { total: totalLines, covered: totalCovered, pct: overallPct },
    },
    files: Object.fromEntries(summaries.map(({ relativePath, summary }) => [relativePath, summary])),
  };
  await fs.writeFile(join(outputDir, 'coverage-summary.json'), JSON.stringify(coverageSummary, null, 2));
  await fs.writeFile(join(outputDir, 'lcov.info'), buildLcovReport(projectRoot, summaries, fileRecords));
  const html = buildHtmlReport(overallPct, summaries);
  await fs.writeFile(join(outputDir, 'index.html'), html, 'utf8');
  await fs.writeFile(join(lcovDir, 'index.html'), html, 'utf8');

  console.log('\nCoverage summary:');
  console.log(`  Lines: ${totalCovered}/${totalLines} (${overallPct.toFixed(2)}%)`);
  for (const { relativePath, summary } of summaries) {
    console.log(`  ${relativePath}: ${summary.covered}/${summary.total} (${summary.pct.toFixed(2)}%)`);
    if (summary.uncovered.length > 0) {
      console.log(`    Uncovered lines: ${summary.uncovered.join(', ')}`);
    }
  }
}

function buildLcovReport(projectRoot, summaries, fileRecords) {
  const chunks = [];
  for (const { relativePath, summary } of summaries) {
    const record = fileRecords.get(relativePath);
    if (!record) continue;
    chunks.push('TN:');
    const absolutePath = join(projectRoot, relativePath);
    chunks.push(`SF:${absolutePath}`);
    for (let index = 0; index < record.meta.length; index += 1) {
      if (record.blank.has(index)) continue;
      if (!record.seen.has(index)) continue;
      const hits = record.hit.has(index) ? 1 : 0;
      chunks.push(`DA:${index + 1},${hits}`);
    }
    chunks.push(`LH:${summary.covered}`);
    chunks.push(`LF:${summary.total}`);
    chunks.push('end_of_record');
  }
  return `${chunks.join('\n')}\n`;
}

function buildHtmlReport(overallPct, summaries) {
  const rows = summaries.map(({ relativePath, summary }) => {
    const uncovered = summary.uncovered.length > 0 ? summary.uncovered.join(', ') : '—';
    return `<tr><td>${relativePath}</td><td>${summary.covered}/${summary.total}</td><td>${summary.pct.toFixed(2)}%</td><td>${uncovered}</td></tr>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Coverage report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #1f2933; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d2d6dc; padding: 0.5rem 0.75rem; text-align: left; }
    th { background-color: #f4f5f7; font-weight: 600; }
    tr:nth-child(even) { background-color: #f9fafb; }
  </style>
</head>
<body>
  <h1>Coverage report</h1>
  <p><strong>Line coverage:</strong> ${overallPct.toFixed(2)}%</p>
  <table>
    <thead>
      <tr><th>File</th><th>Covered</th><th>%</th><th>Uncovered lines</th></tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function run() {
  const testFiles = await discoverTestFiles(testsRoot);
  if (testFiles.length === 0) {
    console.error('No test files found.');
    process.exit(1);
  }

  const coverageDir = join(projectRoot, 'coverage');
  if (wantsCoverage) {
    await fs.rm(coverageDir, { recursive: true, force: true });
    await fs.mkdir(coverageDir, { recursive: true });
    const v8Dir = join(coverageDir, '.v8');
    await fs.mkdir(v8Dir, { recursive: true });
    process.env.NODE_V8_COVERAGE = v8Dir;
  }

  const child = spawn(process.execPath, [...nodeArgs, ...testFiles], {
    stdio: 'inherit',
    cwd: projectRoot,
  });

  child.on('exit', async (code, signal) => {
    if (wantsCoverage && process.env.NODE_V8_COVERAGE) {
      const v8Dir = process.env.NODE_V8_COVERAGE;
      try {
        await generateCoverageReport(v8Dir, join(projectRoot, 'coverage'));
      } catch (error) {
        console.error('Failed to build coverage report:', error);
      } finally {
        await fs.rm(v8Dir, { recursive: true, force: true });
      }
    }

    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
