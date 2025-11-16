# Leaderboard API Contract

## Overview
The Leaderboard API returns ranked lists of users based on study time and badges earned.
It returns four leaderboards in a single response (friends and global rankings for both
study time and badge count metrics) so the frontend can fetch all leaderboard data needed
for the UI in one call and cache it efficiently.

- Read-only, aggregate endpoint (no side effects).
- Designed to power "Your Rankings" and leaderboard list views.

## Base URL
```
/api/v1/leaderboard
```

## Endpoint

### GET /api/v1/leaderboard

Retrieve top-N ranked users across four categories:
- Friends study time (total accumulated study minutes for friends)
- Friends badges (count of earned badges for friends)
- Global study time (all users)
- Global badges (all users)

The requesting user is marked with `isSelf: true` and should be labeled as "You" in the UI.
Friends are defined as accepted friendships (see Business Rules).

### Headers

- `x-internal-api-key` **(required)**  
  Internal API token used to authorize calls to this endpoint. The exact value and
  provisioning of this token are managed by the backend/infra team.

### Query Parameters

- `userId` (**required**)  
  - Type: string (UUID)  
  - Description: ID of the requesting user. Used to:
    - Mark the appropriate leaderboard entries with `isSelf: true`.
    - Determine the user's friends for the friends leaderboards.

- `limit` (**optional**)  
  - Type: integer  
  - Description: Maximum number of entries to return per leaderboard.  
  - Default: `7` (if omitted)  
  - Minimum: `1`  
  - Maximum: `50`  
  - If `limit` is invalid (non-integer, <= 0, or > 50), the API returns **400 Bad Request**.

---

## Success Response

**Status:** `200 OK`

```json
{
  "friends": {
    "studyTime": [
      {
        "userId": "11111111-1111-1111-1111-111111111111",
        "displayName": "Emma Wilson",
        "rank": 1,
        "totalMinutes": 1230,
        "isSelf": false
      },
      {
        "userId": "22222222-2222-2222-2222-222222222222",
        "displayName": "You",
        "rank": 7,
        "totalMinutes": 780,
        "isSelf": true
      }
    ],
    "badges": [
      {
        "userId": "33333333-3333-3333-3333-333333333333",
        "displayName": "Sarah Chen",
        "rank": 1,
        "badgeCount": 12,
        "isSelf": false
      }
    ]
  },
  "global": {
    "studyTime": [
      {
        "userId": "44444444-4444-4444-4444-444444444444",
        "displayName": "Top Student",
        "rank": 1,
        "totalMinutes": 2450,
        "isSelf": false
      }
    ],
    "badges": [
      {
        "userId": "55555555-5555-5555-5555-555555555555",
        "displayName": "Badge Collector",
        "rank": 1,
        "badgeCount": 25,
        "isSelf": false
      }
    ]
  },
  "metadata": {
    "userId": "11111111-1111-1111-1111-111111111111",
    "limit": 7,
    "generatedAt": "2025-11-14T12:00:00.000Z"
  }
}
```

### Top-level Properties

- `friends` (object)
  - `studyTime` (array of `LeaderboardStudyTimeEntry`) — leaderboard of friends ranked by total study time.
  - `badges` (array of `LeaderboardBadgesEntry`) — leaderboard of friends ranked by badge count.

- `global` (object)
  - `studyTime` (array of `LeaderboardStudyTimeEntry`) — leaderboard of all users ranked by total study time.
  - `badges` (array of `LeaderboardBadgesEntry`) — leaderboard of all users ranked by badge count.

- `metadata` (object)
  - `userId` (string, UUID) — the requesting user's ID as echoed from the request.
  - `limit` (number) — the effective limit applied per leaderboard.
  - `generatedAt` (string) — ISO 8601 UTC timestamp when this response was generated.

### Entry Types

#### LeaderboardStudyTimeEntry

Represents a single row in a study-time leaderboard (`friends.studyTime` or `global.studyTime`).

Fields:
- `userId` (string, UUID) — user ID for this entry.
- `displayName` (string | null) —
  - For the requesting user: always the literal string `"You"`.
  - For other users: their display name if set; `null` if no name is available.
- `rank` (number) — 1-based ranking position.
- `totalMinutes` (number) — total accumulated study time in minutes for this user.
- `isSelf` (boolean) — `true` if this entry is the requesting user, otherwise `false`.

#### LeaderboardBadgesEntry

Represents a single row in a badges leaderboard (`friends.badges` or `global.badges`).

Fields:
- `userId` (string, UUID) — user ID for this entry.
- `displayName` (string | null) — same semantics as in `LeaderboardStudyTimeEntry`.
- `rank` (number) — 1-based ranking position.
- `badgeCount` (number) — total number of badges earned by this user.
- `isSelf` (boolean) — `true` if this entry is the requesting user, otherwise `false`.

### Empty States

- If there are no friends, `friends.studyTime` and `friends.badges` are empty arrays `[]`.
- If there is no data for a metric (no study time or badges), the corresponding array is an empty array `[]`.
- The API does **not** return `null` for these arrays.

---

## Business Rules & Semantics

These rules describe behavior that the frontend can rely on when interpreting the response.

1. **Friends vs Global**
   - Friends leaderboards include only users who are in an accepted friendship relationship with the requesting user.
   - Global leaderboards include all users with qualifying data, regardless of friendship.

2. **Study Time Metric**
   - `totalMinutes` represents the total accumulated study time in minutes for each user.
   - Only completed sessions contribute to `totalMinutes` (sessions that are still in progress are not counted).

3. **Badge Metric**
   - `badgeCount` represents the total number of badges earned by each user.

4. **Ranking Logic**
   - Users are sorted in descending order by their metric:
     - Study time leaderboards: by `totalMinutes`.
     - Badges leaderboards: by `badgeCount`.
   - Ranks are sequential integers starting at `1`.
   - Ties do **not** share ranks. For example, if two users tie for third place,
     they are ranked `3` and `4`, not both `3`.

5. **Self Inclusion**
   - The requesting user appears in the leaderboards if they have any qualifying data
     for that metric (any completed study time or any badges), regardless of whether
     they are within the top `limit`.
   - The requesting user's entries:
     - Have `isSelf: true`.
     - Always have `displayName: "You"`.

6. **Display Names**
   - For non-self users, `displayName` may be `null` if the user has not set a display name.
   - The frontend may choose how to render `null` (e.g., "Unknown User").

7. **Time Window**
   - All metrics are currently **all-time**.
   - There is no time-window filtering parameter (e.g., "this week", "this month").

---

## Error Responses

### 400 Bad Request

Returned when the request is syntactically valid HTTP but fails validation.

Common cases:
- Missing required `userId` query parameter.
- `userId` is not a valid UUID string.
- `limit` is missing or invalid (non-integer, <= 0, or > 50).

Example body (shape may be aligned with the existing backend error format):

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "userId is required"
}
```

### 401 Unauthorized

If the internal API key is required and not provided or invalid, the endpoint MAY return:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Missing or invalid API key"
}
```

(Behavior can be adjusted to match the platform's standard auth handling; frontend teams
should treat 401 as a signal that the request is not authorized.)

### 500 Internal Server Error

Returned when the server encounters an unexpected condition.

```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

The frontend should treat 5xx responses as transient failures and may prompt the user to
retry or show a generic error state.

---

## Implementation Notes (Informational)

These notes describe how the backend currently implements the contract. They are provided
for context and do **not** affect how the frontend calls the API.

- The endpoint aggregates data for four leaderboards in a single call to minimize
  round-trips and enable efficient caching.
- Backend may apply database indexes and caching strategies to keep the response
  performant, but these are internal concerns.

For deeper implementation details and backend testing information, see:
- `LEADERBOARD_IMPLEMENTATION.md`
- Backend test files under `apps/backend/tests/`
