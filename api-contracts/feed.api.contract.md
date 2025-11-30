# Feed API Contract

## Base URL

```
/api/v1/feed/:timestampz
```

---

## Authentication

All endpoints require the following header:

```
x-api-key: <your-api-key>
Content-Type: application/json
```

---

## Overview

The Feed API provides a combined social feed of badge achievements and study sessions. It returns all badges earned and sessions completed by users since a given timestamp, including user profile information, complete badge details, and session data. Results are combined, sorted newest to oldest, and limited to 100 items. This enables building activity feeds showing recent accomplishments and study activity across the platform.

---

## API Endpoints

### Get Combined Feed (Badges and Sessions)

**Endpoint:** `GET /feed/:timestamp`

**Description:** Retrieve all badge achievements and study sessions since the specified timestamp. Results include both types of feed items, combined and sorted newest to oldest, limited to 100 items total.

#### Request Parameters

| Parameter   | Type   | Location | Required | Description                                                                     |
| ----------- | ------ | -------- | -------- | ------------------------------------------------------------------------------- |
| `timestamp` | string | Path     | Yes      | ISO 8601 timestamp (e.g., `2025-11-27T00:00:00Z` or `2025-11-27T00:00:00.000Z`) |

#### Example Requests

```bash
# Get all activities (badges and sessions) since midnight Nov 27, 2025
GET /api/v1/feed/2025-11-27T00:00:00Z
Headers:
  x-api-key: your-api-key
  Content-Type: application/json

# Get activities from the last hour
GET /api/v1/feed/2025-11-27T10:00:00Z

# Get activities from a specific datetime with milliseconds
GET /api/v1/feed/2025-11-27T14:30:45.123Z
```

#### Success Response (200 OK)

```json
{
  "message": "Feed retrieved successfully",
  "data": {
    "feed": [
      {
        "type": "session",
        "user": {
          "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "full_name": "Jane Smith",
          "email": "jane.smith@example.com"
        },
        "session": {
          "id": "session-abc-123",
          "start_time": "2025-11-27T09:00:00Z",
          "end_time": "2025-11-27T10:00:00Z",
          "subject": "Mathematics",
          "session_type": 1,
          "total_time": 60
        },
        "timestamp": "2025-11-27T09:15:00Z"
      },
      {
        "type": "badge",
        "user": {
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe",
          "email": "john.doe@example.com"
        },
        "badge": {
          "badge_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
          "name": "First Study Session",
          "description": "Complete your first study session",
          "icon_url": "https://example.com/badges/first-session.png",
          "category": "achievement",
          "criteria_type": "session_count",
          "threshold": 1
        },
        "timestamp": "2025-11-27T10:30:00Z"
      }
    ],
    "count": 2
  }
}
```

#### Response Fields

**Top-Level Fields:**

| Field   | Type   | Description                          |
| ------- | ------ | ------------------------------------ |
| message | string | Success message                      |
| data    | object | Container for feed data and metadata |

**Data Object:**

| Field | Type    | Description                                                                   |
| ----- | ------- | ----------------------------------------------------------------------------- |
| feed  | array   | Array of feed items (badge achievements and sessions) sorted newest to oldest |
| count | integer | Total number of feed items returned (max 100)                                 |

**Feed Item Structure:**

Each item in the `feed` array has a `type` field that indicates whether it's a badge achievement or a study session. The structure varies based on type:

**Common Fields (All Types):**

| Field     | Type   | Description                                                         |
| --------- | ------ | ------------------------------------------------------------------- |
| type      | string | Item type: "badge" or "session"                                     |
| user      | object | User who earned the badge or completed the session                  |
| timestamp | string | ISO 8601 timestamp (earned_at for badges, inserted_at for sessions) |

**Badge-Specific Fields (when type = "badge"):**

| Field | Type   | Description                |
| ----- | ------ | -------------------------- |
| badge | object | Complete badge information |

**Session-Specific Fields (when type = "session"):**

| Field   | Type   | Description              |
| ------- | ------ | ------------------------ |
| session | object | Complete session details |

**User Object:**

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| user_id   | string | User's unique identifier (UUID) |
| full_name | string | User's full name                |
| email     | string | User's email address            |

**Badge Object:**

| Field         | Type   | Description                                                  |
| ------------- | ------ | ------------------------------------------------------------ |
| badge_id      | string | Badge's unique identifier (UUID)                             |
| name          | string | Badge name                                                   |
| description   | string | Badge description                                            |
| icon_url      | string | URL to badge icon image                                      |
| category      | string | Badge category (e.g., "achievement", "streak")               |
| criteria_type | string | Type of criteria (e.g., "session_count", "consecutive_days") |
| threshold     | number | Threshold value required to earn the badge                   |

**Session Object:**

| Field        | Type   | Description                               |
| ------------ | ------ | ----------------------------------------- |
| id           | string | Session's unique identifier               |
| start_time   | string | ISO 8601 timestamp when session started   |
| end_time     | string | ISO 8601 timestamp when session ended     |
| subject      | string | Subject studied during the session        |
| session_type | number | Type of session (1=focus, 2=review, etc.) |
| total_time   | number | Total time in minutes                     |

#### Empty Feed Response (200 OK)

```json
{
  "message": "Feed retrieved successfully",
  "data": {
    "feed": [],
    "count": 0
  }
}
```

#### Error Responses

**Invalid Timestamp Format (400 Bad Request)**

```json
{
  "error": "Invalid timestamp format"
}
```

**Database Error (400 Bad Request)**

```json
{
  "error": "Database error message"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---
