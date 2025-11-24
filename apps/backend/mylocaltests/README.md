# Leaderboard API Debugging Tests

This directory contains test scripts to help debug the leaderboard API 500 error.

## Test Scripts

Run these tests **in order** to identify where the problem occurs:

### 1. Database Connection Test
```powershell
node mylocaltests/test-database-connection.js
```

**What it checks:**
- Environment variables are set correctly
- Supabase client can connect to the database
- All required tables exist and are accessible
- Join queries work (especially `sessions` + `user_profile` and `user_badge` + `user_profile`)

**Most likely issue:** Foreign key relationships or missing tables

---

### 2. Repository Layer Test
```powershell
node mylocaltests/test-leaderboard-direct.js
```

**What it checks:**
- `findAcceptedFriendsForUser()` function
- `findStudyTimeLeaderboard()` with global and friends filters
- `findBadgeCountLeaderboard()` with global and friends filters

**Before running:** Update the `testUserId` variable in the script with a real UUID from your database.

**Most likely issue:** Query syntax, missing data, or join problems

---

### 3. Service Layer Test
```powershell
node mylocaltests/test-leaderboard-service.js
```

**What it checks:**
- `getLeaderboards()` function orchestration
- Mapping from database format (snake_case) to API format (camelCase)
- Adding rankings and `isSelf` flags

**Before running:** Update the `testUserId` variable in the script with a real UUID from your database.

**Most likely issue:** Data transformation logic or Promise.all() failures

---

### 4. Controller/Endpoint Test
```powershell
node mylocaltests/test-leaderboard-endpoint.js
```

**What it checks:**
- Request validation (userId, limit parameters)
- Controller error handling
- Full end-to-end flow through controller → service → repository

**Before running:** 
- Update the `testUserId` variable in the script
- Make sure `INTERNAL_API_TOKEN` is set in your `.env` file

**Most likely issue:** Parameter validation or error handling in controller

---

## Common Issues and Solutions

### Issue: "Failed to fetch study time data: Could not find a relationship"

**Cause:** The join between `sessions` and `user_profile` is failing.

**Solutions:**
1. Check if the foreign key relationship exists:
   - In Supabase dashboard, go to Database → Table Editor → `sessions`
   - Look for a foreign key from `user_id` to `user_profile(user_id)`
   
2. If the relationship doesn't exist, remove the `!inner` join:
   ```javascript
   // Change this:
   .select('user_id, total_time, user_profile!inner(bio)')
   
   // To this:
   .select('user_id, total_time, user_profile(bio)')
   ```

3. Or do a LEFT JOIN and handle null profiles in code.

---

### Issue: "Failed to fetch badge data: Could not find a relationship"

**Cause:** The join between `user_badge` and `user_profile` is failing.

**Solutions:** Same as above, but for `user_badge` table.

---

### Issue: Empty arrays in response but no error

**Cause:** No data in database tables, or user has no sessions/badges.

**Solutions:**
1. Check if there's data in the tables:
   ```sql
   SELECT COUNT(*) FROM sessions WHERE end_time IS NOT NULL;
   SELECT COUNT(*) FROM user_badge;
   SELECT COUNT(*) FROM friends WHERE status = 2;
   ```

2. Add some test data to your database.

---

### Issue: "Missing or invalid API key"

**Cause:** `INTERNAL_API_TOKEN` not set in environment.

**Solution:** Add to your `.env` file:
```
INTERNAL_API_TOKEN=your-secret-token-here
```

---

## How to Find a Valid User ID

Run this in your Supabase SQL editor or database:

```sql
SELECT user_id FROM sessions WHERE end_time IS NOT NULL LIMIT 1;
```

Or:

```sql
SELECT user_id FROM user_profile LIMIT 1;
```

Copy the UUID and paste it into the test scripts.

---

## Reading Test Output

- ✓ = Success
- ✗ = Error (with details)
- ⚠ = Warning or validation issue

Look for the **first** error in the sequence. Fix that before proceeding to the next test.

---

## After Fixing Issues

1. Re-run all tests to confirm the fix
2. Test the actual API endpoint with curl or Postman:
   ```powershell
   curl -X GET "http://localhost:3000/api/v1/leaderboard?userId=YOUR-UUID&limit=7" `
     -H "x-internal-api-key: YOUR-TOKEN"
   ```

---

## Need More Help?

If all tests pass but the API still returns 500:
1. Check the backend console logs for error stack traces
2. Add more detailed logging in the repository/service files
3. Check middleware (auth, profiling) for issues
4. Verify the error is actually from the leaderboard endpoint and not another route

