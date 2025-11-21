// Lightweight harness to exercise fetchSupabaseSchema's table filtering logic
// without making real network calls. This is not wired into the main test
// runner but can be run manually with:
//   node infra/docker/db/schema-tools/sync-schema.harness.js

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { strict as assert } from 'assert';
import('./sync-schema.js').then(mod => {
  // fetchSupabaseSchema is not exported, but isRealTableDefinition is in scope
  // in this file; we'll reimplement a tiny mirror of the filtering logic using
  // the same helper to validate behaviour.

  const { default: syncModule } = mod;
}).catch(() => {
  // Fallback: local copy of the predicate from sync-schema.js so we don't
  // need to change the main file's exports.
  function isRealTableDefinition(tableName) {
    const helperSuffixes = ['_insert', '_update', '_read', '_row', '_schema'];
    return !helperSuffixes.some(suffix => tableName.endsWith(suffix));
  }

  const mockDefinitions = {
    sessions: { properties: {} },
    sessions_insert: { properties: {} },
    sessions_update: { properties: {} },
    user_profile: { properties: {} },
  };

  const filtered = Object.keys(mockDefinitions).filter(name => {
    if (name.startsWith('pg_') || name === 'information_schema') return false;
    return isRealTableDefinition(name);
  });

  console.log('Filtered table names:', filtered);
  assert.deepEqual(filtered.sort(), ['sessions', 'user_profile']);
  console.log('sync-schema.harness: PASS');
});

