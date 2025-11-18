# Session API Contract

## Overview
The Session API manages study session records captured by the Studly platform.
Each record represents a completed study block with a subject, time range, and
optional goal. Clients can create new sessions, update existing entries, list
them with filters, and retrieve aggregate metrics for dashboards.

## Base URL
```
/api/v1/sessions
```

## Endpoints

### 1. Create Session
**POST** `/api/v1/sessions`

Create a new study session record. Both `startTime` and `endTime` must be valid
ISO 8601 timestamps. If `totalMinutes` is omitted, the API will compute it based
on the difference between the timestamps.

**Request Body:**
```json
{
  "userId": "string",
  "subject": "string",
  "sessionType": 1,
  "startTime": "ISO 8601 timestamp",
  "endTime": "ISO 8601 timestamp",
  "sessionGoal": "string (optional)",
  "totalMinutes": 45,                 // optional, computed when omitted
  "date": "YYYY-MM-DD (optional)"
}
```

**Success Response (201):**
```json
{
  "session": {
    "id": "string",
    "userId": "string",
    "subject": "string",
    "sessionType": 1,
    "sessionGoal": "string or null",
    "startTime": "ISO 8601 timestamp",
    "endTime": "ISO 8601 timestamp",
    "totalMinutes": 45,
    "date": "YYYY-MM-DD",
    "insertedAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing or invalid fields (e.g., `sessionType`, timestamps)
- **500 Internal Server Error:** Supabase insert failure

---

### 2. Update Session
**PATCH** `/api/v1/sessions/{sessionId}`

Update one or more fields on an existing session. At least one mutable field
must be provided. When both `startTime` and `endTime` are supplied and
`totalMinutes` is omitted, the API recomputes the duration.

**Request Body (any combination of the following):**
```json
{
  "subject": "string",
  "sessionType": 2,
  "startTime": "ISO 8601 timestamp",
  "endTime": "ISO 8601 timestamp",
  "sessionGoal": "string",
  "totalMinutes": 90,
  "date": "YYYY-MM-DD"
}
```

**Success Response (200):**
```json
{
  "session": {
    "id": "string",
    "userId": "string",
    "subject": "string",
    "sessionType": 2,
    "sessionGoal": "string or null",
    "startTime": "ISO 8601 timestamp",
    "endTime": "ISO 8601 timestamp",
    "totalMinutes": 90,
    "date": "YYYY-MM-DD",
    "insertedAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**
- **400 Bad Request:** `sessionId` missing or no fields provided, invalid values
- **404 Not Found:** Session does not exist
- **500 Internal Server Error:** Supabase update failure

---

### 3. List Sessions
**GET** `/api/v1/sessions`

Retrieve study sessions for a user. Results are sorted by `endTime` descending.

**Query Parameters:**
- `userId` (required) — UUID of the user
- `subject` (optional) — filter by subject
- `sessionType` (optional) — numeric session type
- `from` (optional) — ISO timestamp lower bound (applied to `endTime`)
- `to` (optional) — ISO timestamp upper bound (applied to `endTime`)
- `limit` (optional) — maximum number of sessions to return (positive integer)

**Success Response (200):**
```json
{
  "sessions": [
    {
      "id": "string",
      "userId": "string",
      "subject": "string",
      "sessionType": 1,
      "sessionGoal": "string or null",
      "startTime": "ISO 8601 timestamp",
      "endTime": "ISO 8601 timestamp",
      "totalMinutes": 60,
      "date": "YYYY-MM-DD",
      "insertedAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ]
}
```

**Error Responses:**
- **400 Bad Request:** Missing `userId` or invalid `limit`
- **500 Internal Server Error:** Supabase query failure

---

### 4. Session Summary
**GET** `/api/v1/sessions/summary`

Return aggregate metrics for dashboard views.

**Query Parameters:**
- `userId` (required)
- `sessionType` (optional)
- `from` (optional) — ISO timestamp lower bound
- `to` (optional) — ISO timestamp upper bound

**Success Response (200):**
```json
{
  "totalMinutesStudied": 240,
  "sessionsLogged": 4
}
```

**Error Responses:**
- **400 Bad Request:** Missing `userId` or invalid timestamps
- **500 Internal Server Error:** Supabase aggregation failure

---

## Frontend Usage Guide

### Creating Sessions
```javascript
await fetch('/api/v1/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    subject: 'Math',
    sessionType: 1,
    startTime: new Date(start).toISOString(),
    endTime: new Date(end).toISOString(),
    sessionGoal: 'Practice problems'
  })
});
```

### Updating Sessions
```javascript
await fetch(`/api/v1/sessions/${sessionId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ totalMinutes: 90, endTime: new Date().toISOString() })
});
```

### Listing Sessions
```javascript
const response = await fetch(`/api/v1/sessions?userId=${userId}&from=${fromIso}&to=${toIso}&sessionType=1`);
const { sessions } = await response.json();
```

### Fetching Summary Metrics
```javascript
const summary = await fetch(`/api/v1/sessions/summary?userId=${userId}&sessionType=1`).then((r) => r.json());
console.log(summary.totalMinutesStudied, summary.sessionsLogged);
```
