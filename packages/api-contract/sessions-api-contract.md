# Study Sessions API Contract

## Overview
- This API manages study session lifecycle for users: start, complete/update, list, and summarize sessions.
- Only the endpoints documented here are implemented. Anything not listed is not available.

## Base Path
```
/api/v1/sessions
```

## Required Headers
- `x-api-key`: `INTERNAL_API_TOKEN`
- `Content-Type`: `application/json` (for POST/PATCH)

## Notes for Frontend
- **Timestamps**
  - `startTimestamp` and `endStudyTimestamp` are returned as a number (milliseconds since Unix epoch).
  - `from`/`to`/`endedAfter`/`endedBefore` in queries accept either ISO strings or epoch milliseconds.
  - `createdAt`/`updatedAt` are ISO 8601 strings (from the database).
- **Status values:** `in_progress`, `completed` (other values may be ignored by the backend).
- **Error shape:** `{ "error": string }`

## Data Model: Session (response shape)
- `id`: string
- `userId`: string
- `subject`: string
- `status`: string (e.g., "in_progress" or "completed")
- `startTimestamp`: number (epoch ms)
- `endStudyTimestamp`: number | null (epoch ms)
- `targetDurationMillis`: number | null
- `sessionLength`: number | null (actual duration in ms)
- `notes`: string | null
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)

## Endpoints

### 1) Start a session
- **POST** `/`
- **Purpose:** Create a new in-progress study session.
- **Request body**
  - `userId`: string (required)
  - `subject`: string (required)
  - `startTimestamp`: string | number (optional; defaults to now)
  - `targetDurationMillis`: number (optional)
  - `notes`: string (optional)
- **Success 201**
  - `{ "session": Session }`
- **Errors**
  - `400 { error: "userId is required" }`
  - `400 { error: "subject is required" }`
  - `500 { error: string }` for server/database errors
- **Example**
  - **Request**
    ```
    POST /api/v1/sessions
    Headers: { "x-api-key": "<token>", "Content-Type": "application/json" }
    Body:
    {
      "userId": "user-123",
      "subject": "Calculus",
      "startTimestamp": "2025-10-20T14:00:00.000Z",
      "targetDurationMillis": 3600000
    }
    ```
  - **Response 201**
    ```json
    {
      "session": {
        "id": "session-abc",
        "userId": "user-123",
        "subject": "Calculus",
        "status": "in_progress",
        "startTimestamp": 1766277600000,
        "endStudyTimestamp": null,
        "targetDurationMillis": 3600000,
        "sessionLength": null,
        "notes": null,
        "createdAt": "2025-10-20T14:00:00.000Z",
        "updatedAt": "2025-10-20T14:00:00.000Z"
      }
    }
    ```

### 2) Complete or update a session
- **PATCH** `/:sessionId`
- **Purpose:** Mark a session as completed and/or update details.
- **Request body**
  - `endStudyTimestamp`: string | number (required to complete)
  - `sessionLengthMillis`: number (optional; actual duration in ms)
  - `notes`: string (optional)
  - `status`: string (optional; defaults to "completed" when endStudyTimestamp provided)
- **Success 200**
  - If session ends with status "completed":
    `{ "session": Session, "newBadgesEarned": Badge[], "badgeCount": number }`
    - If badge evaluation fails: add "badgeCheckFailed": true and return empty badges
  - If not completed (e.g., cancelled/paused): `{ "session": Session }`
- **Errors**
  - `400 { error: "sessionId is required" }`
  - `400 { error: "endStudyTimestamp is required" }`
  - `404 { error: "Session not found" }`
  - `500 { error: string }` for server/database errors
- **Example**
  - **Request**
    ```
    PATCH /api/v1/sessions/session-abc
    Headers: { "x-api-key": "<token>", "Content-Type": "application/json" }
    Body:
    {
      "endStudyTimestamp": "2025-10-20T15:30:00.000Z",
      "sessionLengthMillis": 5400000,
      "notes": "Great focus"
    }
    ```
  - **Response 200**
    ```json
    {
      "session": {
        "id": "session-abc",
        "userId": "user-123",
        "subject": "Calculus",
        "status": "completed",
        "startTimestamp": 1766277600000,
        "endStudyTimestamp": 1766283000000,
        "targetDurationMillis": 3600000,
        "sessionLength": 5400000,
        "notes": "Great focus",
        "createdAt": "2025-10-20T14:00:00.000Z",
        "updatedAt": "2025-10-20T15:30:00.000Z"
      },
      "newBadgesEarned": [
        { "id": "badge-1", "name": "First Study", "description": "Completed your first session" }
      ],
      "badgeCount": 1
    }
    ```

### 3) List sessions
- **GET** `/`
- **Purpose:** List sessions for a user with optional filters; results are sorted by endStudyTimestamp desc.
- **Query params**
  - `userId`: string (required)
  - `subject`: string (optional)
  - `status`: string (optional)
  - `limit`: number (optional; positive integer)
  - `endedAfter`: string | number (optional; return sessions with endStudyTimestamp >= value)
  - `endedBefore`: string | number (optional; return sessions with endStudyTimestamp <= value)
- **Success 200**
  - `{ "sessions": Session[] }`
- **Errors**
  - `400 { error: "userId query parameter is required" }`
  - `400 { error: "limit must be a positive integer" }`
  - `500 { error: string }` for server/database errors
- **Example**
  ```
  GET /api/v1/sessions?userId=user-123&subject=Calculus&status=completed&limit=10
  Headers: { "x-api-key": "<token>" }
  ```
  - **Response 200**
    ```json
    {
      "sessions": [
        {
          "id": "session-2",
          "userId": "user-123",
          "subject": "Calculus",
          "status": "completed",
          "startTimestamp": 1766277600000,
          "endStudyTimestamp": 1766284800000,
          "targetDurationMillis": null,
          "sessionLength": 7200000,
          "notes": null,
          "createdAt": "2025-10-20T13:00:00.000Z",
          "updatedAt": "2025-10-20T15:40:00.000Z"
        }
      ]
    }
    ```

### 4) Sessions summary
- **GET** `/summary`
- **Purpose:** Aggregate metrics for dashboards.
- **Query params**
  - `userId`: string (required)
  - `from`: string | number (optional; inclusive lower bound on endStudyTimestamp)
  - `to`: string | number (optional; inclusive upper bound on endStudyTimestamp)
  - `status`: string (optional; defaults to "completed")
- **Success 200**
  - `{ "totalTimeStudied": number, "timesStudied": number }`
  - `totalTimeStudied` is the sum of sessionLength in milliseconds over the filtered set
- **Errors**
  - `400 { error: "userId query parameter is required" }`
  - `500 { error: string }` for server/database errors
- **Example**
  ```
  GET /api/v1/sessions/summary?userId=user-123&from=2025-10-01&to=2025-10-31
  Headers: { "x-api-key": "<token>" }
  ```
  - **Response 200**
    ```json
    { "totalTimeStudied": 5400000, "timesStudied": 1 }
    ```

## Frontend usage snippets
- **Start**
  ```javascript
  await fetch('/api/v1/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': INTERNAL_API_TOKEN },
    body: JSON.stringify({ userId, subject, targetDurationMillis }),
  }).then(r => r.json());
  ```

- **Complete**
  ```javascript
  await fetch(`/api/v1/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-api-key': INTERNAL_API_TOKEN },
    body: JSON.stringify({ endStudyTimestamp: new Date().toISOString(), sessionLengthMillis }),
  }).then(r => r.json());
  ```

- **List recent**
  ```javascript
  await fetch(`/api/v1/sessions?userId=${userId}&limit=5`, {
    headers: { 'x-api-key': INTERNAL_API_TOKEN },
  }).then(r => r.json());
  ```

- **Summary**
  ```javascript
  await fetch(`/api/v1/sessions/summary?userId=${userId}&from=${from}&to=${to}`, {
    headers: { 'x-api-key': INTERNAL_API_TOKEN },
  }).then(r => r.json());
  ```

## Changelog
- 2025-11-01: Replaced outdated auth-session endpoints with actual study sessions API and added FE-focused examples.
