/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: infra/docker/db/schema-tools/sync-schema.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Last-Updated: 2025-11-20
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Comprehensive schema synchronization tool that:
 *  1. Fetches the current schema from Supabase
 *  2. Compares it with the local schema definition
 *  3. Verifies data accessibility
 *  4. Updates 01_schema.sql if differences are found
 *
 *  Usage
 *  -----
 *  From project root:
 *    node infra/docker/db/schema-tools/sync-schema.js
 *
 *  From backend directory:
 *    node ../../../infra/docker/db/schema-tools/sync-schema.js
 *
 *  Flags:
 *    --dry-run    Show changes without updating files
 *    --verbose    Show detailed output
 * ────────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  schemaFilePath: join(__dirname, '../init/01_schema.sql'),
  envFilePath: join(__dirname, '../../../../apps/backend/.env'),
};

// ============================================================================
// Utilities
// ============================================================================

function log(message, level = 'info') {
  const icons = { info: '[INFO]', success: '[SUCCESS]', warning: '[WARNING]', error: '[ERROR]' };
  console.log(`${icons[level] || '•'} ${message}`);
}

function verbose(message) {
  if (isVerbose) {
    console.log(`   ${message}`);
  }
}

// ============================================================================
// Load Environment Variables
// ============================================================================

function loadEnvVariables() {
  try {
    const envContent = readFileSync(CONFIG.envFilePath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        envVars[match[1]] = match[2].trim();
      }
    });

    return envVars;
  } catch (err) {
    log(`Failed to load .env file: ${err.message}`, 'error');
    process.exit(1);
  }
}

// ============================================================================
// Fetch Schema from Supabase
// ============================================================================

async function fetchSupabaseSchema(supabaseUrl, supabaseKey) {
  log('Fetching schema from Supabase...', 'info');

  try {
    // Fetch OpenAPI schema
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/openapi+json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const schema = await response.json();
    const tables = [];

    if (schema.definitions) {
      for (const [tableName, tableSchema] of Object.entries(schema.definitions)) {
        // Skip internal tables
        if (tableName.startsWith('pg_') || tableName === 'information_schema') {
          continue;
        }

        const columns = [];
        if (tableSchema.properties) {
          for (const [colName, colSchema] of Object.entries(tableSchema.properties)) {
            const type = colSchema.format || colSchema.type || 'unknown';
            const nullable = !tableSchema.required?.includes(colName);
            const description = colSchema.description || '';

            columns.push({
              name: colName,
              type: type,
              nullable: nullable,
              description: description,
              isPrimaryKey: description.includes('This is a Primary Key'),
              isForeignKey: description.includes('This is a Foreign Key'),
            });
          }
        }

        tables.push({
          name: tableName,
          columns: columns,
          required: tableSchema.required || [],
        });
      }
    }

    log(`Found ${tables.length} tables in Supabase`, 'success');
    return tables;
  } catch (err) {
    log(`Failed to fetch Supabase schema: ${err.message}`, 'error');
    process.exit(1);
  }
}

// ============================================================================
// Verify Data Accessibility
// ============================================================================

async function verifyDataAccessibility(supabaseUrl, supabaseKey, tables) {
  log('Verifying data accessibility...', 'info');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const results = [];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        verbose(`Table '${table.name}': Not accessible - ${error.message}`);
        results.push({ table: table.name, accessible: false, error: error.message });
      } else {
        verbose(`Table '${table.name}': Accessible`);
        results.push({ table: table.name, accessible: true, count: 0 });
      }
    } catch (err) {
      verbose(`Table '${table.name}': Error - ${err.message}`);
      results.push({ table: table.name, accessible: false, error: err.message });
    }
  }

  const accessibleCount = results.filter(r => r.accessible).length;
  log(`${accessibleCount}/${tables.length} tables accessible`, 'success');

  return results;
}

// ============================================================================
// Parse Local Schema
// ============================================================================

function parseLocalSchema() {
  log('Parsing local schema file...', 'info');

  try {
    const schemaContent = readFileSync(CONFIG.schemaFilePath, 'utf-8');
    const tables = [];

    // Parse CREATE TABLE statements
    const tableRegex = /create table if not exists public\.(\w+)\s*\(([\s\S]*?)\);/g;
    let match;

    while ((match = tableRegex.exec(schemaContent)) !== null) {
      const tableName = match[1];
      const tableBody = match[2];

      const columns = [];
      const lines = tableBody.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments and constraints
        if (trimmed.startsWith('--') || trimmed.startsWith('constraint')) {
          continue;
        }

        // Parse column definition
        const colMatch = trimmed.match(/^(\w+)\s+([\w\s()]+?)(?:\s+not null|\s+null)?(?:,|$)/);
        if (colMatch) {
          const colName = colMatch[1];
          const colType = colMatch[2].trim();
          const nullable = line.includes(' null') && !line.includes(' not null');

          columns.push({
            name: colName,
            type: colType,
            nullable: nullable,
          });
        }
      }

      tables.push({
        name: tableName,
        columns: columns,
      });
    }

    log(`Parsed ${tables.length} tables from local schema`, 'success');
    return tables;
  } catch (err) {
    log(`Failed to parse local schema: ${err.message}`, 'error');
    process.exit(1);
  }
}

// ============================================================================
// Compare Schemas
// ============================================================================

function compareSchemas(localTables, supabaseTables) {
  log('Comparing local and remote schemas...', 'info');

  const differences = [];
  const localMap = new Map(localTables.map(t => [t.name, t]));
  const supabaseMap = new Map(supabaseTables.map(t => [t.name, t]));

  // Check for missing tables
  for (const [name, table] of localMap) {
    if (!supabaseMap.has(name)) {
      differences.push({
        type: 'missing_in_supabase',
        table: name,
        message: `Table '${name}' exists locally but not in Supabase`,
      });
    }
  }

  for (const [name, table] of supabaseMap) {
    if (!localMap.has(name)) {
      differences.push({
        type: 'missing_locally',
        table: name,
        message: `Table '${name}' exists in Supabase but not locally`,
      });
    }
  }

  // Compare columns for matching tables
  for (const [name, localTable] of localMap) {
    const supabaseTable = supabaseMap.get(name);
    if (!supabaseTable) continue;

    const localCols = new Set(localTable.columns.map(c => c.name));
    const supabaseCols = new Set(supabaseTable.columns.map(c => c.name));

    for (const col of supabaseTable.columns) {
      if (!localCols.has(col.name)) {
        differences.push({
          type: 'missing_column_locally',
          table: name,
          column: col.name,
          message: `Column '${name}.${col.name}' exists in Supabase but not locally`,
          columnInfo: col,
        });
      }
    }

    for (const col of localTable.columns) {
      if (!supabaseCols.has(col.name)) {
        differences.push({
          type: 'extra_column_locally',
          table: name,
          column: col.name,
          message: `Column '${name}.${col.name}' exists locally but not in Supabase`,
        });
      }
    }
  }

  return differences;
}

// ============================================================================
// Generate SQL Schema
// ============================================================================

function generateSqlSchema(tables) {
  let sql = `-- ============================================================================
-- Studly local schema (public schema only)
--
-- Source: Supabase public schema exported for local Postgres dev and mock mode.
-- Last synced: ${new Date().toISOString().split('T')[0]}
-- Notes:
--   - In mock/in-memory mode there is no real auth.users table; all FKs that
--     reference auth.users are kept as comments for documentation only.
--   - Extension-specific bits (e.g. extensions.uuid_generate_v4, TABLESPACE)
--     are omitted so this file is portable across local Postgres instances.
--   - This file is safe to mount into Postgres via docker-entrypoint-initdb.d.
-- ============================================================================

`;

  // Type mapping from Supabase to PostgreSQL
  const typeMap = {
    'uuid': 'uuid',
    'text': 'text',
    'character varying': 'character varying',
    'timestamp with time zone': 'timestamp with time zone',
    'date': 'date',
    'numeric': 'numeric',
    'smallint': 'smallint',
    'bigint': 'bigint',
    'integer': 'integer',
    'boolean': 'boolean',
    'json': 'json',
    'jsonb': 'jsonb',
  };

  for (const table of tables) {
    sql += `-- ${table.name}: ${getTableDescription(table.name)}\n`;
    sql += `create table if not exists public.${table.name} (\n`;

    const columnDefs = [];
    const primaryKeys = [];

    for (const col of table.columns) {
      let colDef = `  ${col.name} ${typeMap[col.type] || col.type}`;

      if (!col.nullable) {
        colDef += ' not null';
      } else {
        colDef += ' null';
      }

      // Add comments for defaults that would exist in Supabase
      if (col.name === 'created_at' || col.name === 'inserted_at') {
        colDef += ',\n  -- Supabase version uses: default now()';
      } else if (col.name === 'updated_at') {
        colDef += ',\n  -- Supabase version uses: default now()';
      } else if (col.name === 'earned_at' && col.type === 'timestamp with time zone') {
        colDef += ',\n  -- Supabase version uses: default now()';
      } else if ((col.name === 'id' || col.name.endsWith('_id')) && col.type === 'uuid') {
        if (col.isPrimaryKey && col.name !== 'user_id') {
          colDef += ',\n  -- Supabase version uses: default gen_random_uuid()';
        }
      }

      if (col.isPrimaryKey) {
        primaryKeys.push(col.name);
      }

      columnDefs.push(colDef);
    }

    sql += columnDefs.join(',\n');

    // Add primary key constraint
    if (primaryKeys.length > 0) {
      sql += `,\n  constraint ${table.name}_pkey primary key (${primaryKeys.join(', ')})`;
    }

    // Add comments about foreign keys and other constraints
    sql += addConstraintComments(table);

    sql += '\n);\n\n';
  }

  return sql;
}

function getTableDescription(tableName) {
  const descriptions = {
    'user_profile': 'basic profile info keyed by Supabase auth user id',
    'sessions': 'study sessions for a given user',
    'badge': 'catalog of badges that can be earned',
    'user_badge': 'join table between users and badges they have earned',
    'friends': 'friend relationships between users',
  };
  return descriptions[tableName] || 'table description';
}

function addConstraintComments(table) {
  let comments = '';

  // Add FK comments based on table relationships
  if (table.name === 'user_profile') {
    comments += `\n  -- Real Supabase FK (disabled in local/mock):
  -- constraint user_profile_user_id_fkey foreign key (user_id)
  --   references auth.users (id) on delete cascade`;
  }

  if (table.name === 'sessions') {
    comments += `\n  -- Real Supabase FK and check (disabled in local/mock):
  -- constraint sessions_user_id_fkey foreign key (user_id)
  --   references auth.users (id),
  -- constraint sessions_session_type_check check ((session_type > (0)::numeric))`;
  }

  if (table.name === 'user_badge') {
    comments += `\n  -- Real Supabase FKs (disabled in local/mock):
  -- constraint fk_badge foreign key (badge_id) references badge (badge_id),
  -- constraint fk_user foreign key (user_id) references auth.users (id)`;
  }

  if (table.name === 'friends') {
    comments += `\n  -- Real Supabase FKs and check (disabled in local/mock):
  -- constraint friends_from_user_fkey foreign key (from_user)
  --   references auth.users (id) on delete cascade,
  -- constraint friends_to_user_fkey foreign key (to_user)
  --   references auth.users (id) on delete cascade,
  -- constraint friends_status_check check ((status = any (array[1, 2, 3])))`;

    // Add unique constraint for friends table
    const hasUnique = table.columns.some(c =>
      c.description && c.description.includes('unique')
    );
    if (!hasUnique) {
      comments = `,\n  constraint friends_from_user_to_user_key unique (from_user, to_user)` + comments;
    }
  }

  return comments;
}

// ============================================================================
// Update Schema File
// ============================================================================

function updateSchemaFile(newSchema) {
  if (isDryRun) {
    log('DRY RUN: Would update schema file', 'warning');
    console.log('\n--- Preview of new schema ---');
    console.log(newSchema);
    console.log('--- End of preview ---\n');
    return false;
  }

  try {
    // Backup existing schema
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = CONFIG.schemaFilePath.replace('.sql', `.backup-${timestamp}.sql`);

    const existingSchema = readFileSync(CONFIG.schemaFilePath, 'utf-8');
    writeFileSync(backupPath, existingSchema, 'utf-8');
    log(`Backup created: ${backupPath}`, 'success');

    // Write new schema
    writeFileSync(CONFIG.schemaFilePath, newSchema, 'utf-8');
    log(`Schema file updated: ${CONFIG.schemaFilePath}`, 'success');

    return true;
  } catch (err) {
    log(`Failed to update schema file: ${err.message}`, 'error');
    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('Schema Synchronization Tool');
  console.log('='.repeat(70));
  console.log('');

  if (isDryRun) {
    log('Running in DRY RUN mode (no files will be modified)', 'warning');
  }

  // Load environment variables
  const env = loadEnvVariables();

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    log('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file', 'error');
    process.exit(1);
  }

  // Fetch Supabase schema
  const supabaseTables = await fetchSupabaseSchema(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  // Verify data accessibility
  await verifyDataAccessibility(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, supabaseTables);

  // Parse local schema
  const localTables = parseLocalSchema();

  // Compare schemas
  const differences = compareSchemas(localTables, supabaseTables);

  console.log('');
  console.log('='.repeat(70));
  console.log('Comparison Results');
  console.log('='.repeat(70));

  if (differences.length === 0) {
    log('Schema is in sync! No differences found.', 'success');
    console.log('');
    return;
  }

  log(`Found ${differences.length} difference(s):`, 'warning');
  console.log('');

  for (const diff of differences) {
    if (diff.type === 'missing_locally') {
      log(`Missing table locally: ${diff.table}`, 'warning');
    } else if (diff.type === 'missing_in_supabase') {
      log(`Extra table locally: ${diff.table}`, 'warning');
    } else if (diff.type === 'missing_column_locally') {
      log(`Missing column: ${diff.table}.${diff.column}`, 'warning');
    } else if (diff.type === 'extra_column_locally') {
      log(`Extra column: ${diff.table}.${diff.column}`, 'warning');
    }
  }

  console.log('');
  console.log('='.repeat(70));
  console.log('Generating Updated Schema');
  console.log('='.repeat(70));
  console.log('');

  // Generate new schema
  const newSchema = generateSqlSchema(supabaseTables);

  // Update schema file
  const updated = updateSchemaFile(newSchema);

  console.log('');
  console.log('='.repeat(70));
  if (updated) {
    log('Schema synchronization complete!', 'success');
  } else if (isDryRun) {
    log('Dry run complete. Use without --dry-run to apply changes.', 'info');
  } else {
    log('Schema synchronization failed.', 'error');
  }
  console.log('='.repeat(70));
  console.log('');
}

main().catch(err => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err);
  process.exit(1);
});

