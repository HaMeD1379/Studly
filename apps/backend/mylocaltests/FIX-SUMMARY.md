# Leaderboard API 500 Error - FIXED ✓

## Problem Summary

The leaderboard API endpoint was returning a **500 Internal Server Error** when called.

## Root Cause

The issue was in the **repository layer** (`leaderboard.repository.js`). The code was using Supabase's `!inner` join syntax to fetch data from related tables:

```javascript
// OLD CODE (broken):
.select('user_id, total_time, user_profile!inner(bio)')
```

This join syntax requires a **foreign key relationship** to be explicitly defined in the Supabase schema cache between:
- `sessions.user_id` → `user_profile.user_id`
- `user_badge.user_id` → `user_profile.user_id`

These relationships were **not defined** in the database, causing the query to fail with:
```
Could not find a relationship between 'sessions' and 'user_profile' in the schema cache
```

## Solution

Changed the repository to **fetch data separately** and join in JavaScript instead of relying on Supabase's join syntax:

### Before (broken):
```javascript
const { data: sessionRows, error } = await client
  .from('sessions')
  .select('user_id, total_time, user_profile!inner(bio)')
  .not('end_time', 'is', null);

// Process sessionRows with embedded user_profile data
```

### After (fixed):
```javascript
// 1. Fetch sessions first
const { data: sessionRows, error } = await client
  .from('sessions')
  .select('user_id, total_time')
  .not('end_time', 'is', null);

// 2. Aggregate by user and collect unique user IDs
// ... aggregation logic ...

// 3. Fetch user profiles separately
const { data: profileRows, error: profileError } = await client
  .from('user_profile')
  .select('user_id, bio')
  .in('user_id', Array.from(uniqueUserIds));

// 4. Join data in JavaScript
```

This approach:
- ✓ Works without requiring database schema changes
- ✓ Doesn't depend on Supabase foreign key relationships
- ✓ More explicit and easier to debug
- ✓ Still efficient (uses `.in()` for batch queries)

## Files Changed

**File:** `apps/backend/src/repositories/leaderboard.repository.js`

**Changes:**
1. Modified `findStudyTimeLeaderboard()` function
2. Modified `findBadgeCountLeaderboard()` function

Both functions now:
- Fetch base data (sessions/badges) separately
- Aggregate and collect unique user IDs
- Fetch user profiles in a separate query
- Join the data in JavaScript

## Test Results

All tests now pass:

✓ **Database Connection Test** - All tables accessible  
✓ **Repository Test** - All 5 functions work correctly  
✓ **Service Test** - Business logic and mapping working  
✓ **Endpoint Test** - API returns 200 OK with proper data

### Sample Response:
```json
{
  "friends": {
    "studyTime": [...],
    "badges": [...]
  },
  "global": {
    "studyTime": [...],
    "badges": [...]
  },
  "metadata": {
    "userId": "82a1c255-a826-474c-89d5-55b85e91f7c3",
    "limit": 7,
    "generatedAt": "2025-11-21T00:45:27.566Z"
  }
}
```

## Alternative Solution (Not Used)

You could also define the foreign key relationships in Supabase:

1. Go to Database → Table Editor in Supabase dashboard
2. Add foreign key constraints:
   - `sessions.user_id` → `user_profile.user_id`
   - `user_badge.user_id` → `user_profile.user_id`

This would allow the original `!inner` join syntax to work, but:
- Requires database schema changes
- May affect existing data integrity checks
- The current solution works without any database changes

## Testing Scripts Created

Created comprehensive test scripts in `apps/backend/mylocaltests/`:

1. **test-database-connection.js** - Tests basic DB connectivity and joins
2. **test-leaderboard-direct.js** - Tests repository layer functions
3. **test-leaderboard-service.js** - Tests service layer orchestration
4. **test-leaderboard-endpoint.js** - Tests full controller/endpoint flow
5. **find-test-user.js** - Helper to find valid user IDs for testing
6. **README.md** - Documentation on using the test scripts

## Verification

To verify the fix works on your running server:

```bash
# Start your backend server
npm start

# In another terminal, test the endpoint:
curl -X GET "http://localhost:3000/api/v1/leaderboard?userId=82a1c255-a826-474c-89d5-55b85e91f7c3&limit=7" \
  -H "x-internal-api-key: YOUR_TOKEN"
```

Expected: **200 OK** with leaderboard data

## Performance Considerations

The new approach makes 2-3 queries per leaderboard type instead of 1:
- Query 1: Fetch base data (sessions or badges)
- Query 2: Fetch user profiles (uses `.in()` with array of user IDs)

This is still efficient because:
- `.in()` queries are fast (single query for multiple IDs)
- The number of users per leaderboard is small (default limit: 7)
- Total queries: ~6-8 instead of 4 (still acceptable)

If performance becomes an issue later, consider:
- Adding database foreign keys to use native joins
- Caching user profile data
- Using materialized views for global leaderboards

## Status

✅ **FIXED** - Leaderboard API now returns 200 OK with correct data

