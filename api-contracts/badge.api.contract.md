# Badge API Contract

## Base URL

```
/api/v1/badges
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

The Badge API provides functionality for managing the gamification badge system in Studly. It allows retrieving all available badges, viewing a user's earned badges with optional progress tracking, manually awarding badges, and automatically checking and awarding badges based on user study sessions. Badges are earned by meeting specific criteria such as completing a number of sessions, accumulating study time, or maintaining consecutive day streaks.

---

## API Endpoints

### Get All Badges

**Endpoint:** `GET /`

**Description:** Retrieve all available badges in the system. Returns the complete list of badges that users can earn.

#### Request Parameters

None.

#### Example Request

```bash
GET /api/v1/badges
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "badges": [
    {
      "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "name": "First Study Session",
      "description": "Complete your first study session",
      "iconUrl": "https://example.com/badges/first-session.png",
      "category": "achievement",
      "criteriaType": "session_count",
      "threshold": 1,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "badgeId": "8d0f7780-8536-51ef-b055-f18fd2f91bf8",
      "name": "Week Warrior",
      "description": "Study for 7 consecutive days",
      "iconUrl": "https://example.com/badges/week-warrior.png",
      "category": "streak",
      "criteriaType": "consecutive_days",
      "threshold": 7,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Response Fields

| Field  | Type  | Description                       |
| ------ | ----- | --------------------------------- |
| badges | array | Array of all available badges     |

**Badge Object:**

| Field        | Type   | Description                                                       |
| ------------ | ------ | ----------------------------------------------------------------- |
| badgeId      | string | Badge's unique identifier (UUID)                                  |
| name         | string | Badge name                                                        |
| description  | string | Badge description                                                 |
| iconUrl      | string | URL to badge icon image                                           |
| category     | string | Badge category (e.g., "achievement", "streak")                    |
| criteriaType | string | Type of criteria (e.g., "session_count", "total_minutes", "consecutive_days") |
| threshold    | number | Threshold value required to earn the badge                        |
| createdAt    | string | ISO 8601 timestamp when badge was created                         |

#### Error Responses

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Get User Badges

**Endpoint:** `GET /users/:userId`

**Description:** Retrieve all badges earned by a specific user. Optionally includes progress information for unearned badges.

#### Request Parameters

| Parameter       | Type    | Location | Required | Description                                              |
| --------------- | ------- | -------- | -------- | -------------------------------------------------------- |
| `userId`        | string  | Path     | Yes      | UUID of the user                                         |
| `includeProgress` | boolean | Query    | No       | If true, includes progress percentage on unearned badges |

#### Example Requests

```bash
# Get user's earned badges only
GET /api/v1/badges/users/550e8400-e29b-41d4-a716-446655440000
Headers:
  x-api-key: your-api-key
  Content-Type: application/json

# Get user's badges with progress on unearned badges
GET /api/v1/badges/users/550e8400-e29b-41d4-a716-446655440000?includeProgress=true
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
```

#### Success Response (200 OK) - Without Progress

```json
{
  "badges": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "earnedAt": "2025-11-27T10:30:00Z",
      "badge": {
        "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "name": "First Study Session",
        "description": "Complete your first study session",
        "iconUrl": "https://example.com/badges/first-session.png",
        "category": "achievement",
        "criteriaType": "session_count",
        "threshold": 1,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    }
  ]
}
```

#### Success Response (200 OK) - With Progress

```json
{
  "badges": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "earnedAt": "2025-11-27T10:30:00Z",
      "progress": 100,
      "badge": {
        "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "name": "First Study Session",
        "description": "Complete your first study session",
        "iconUrl": "https://example.com/badges/first-session.png",
        "category": "achievement",
        "criteriaType": "session_count",
        "threshold": 1,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    },
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "badgeId": "8d0f7780-8536-51ef-b055-f18fd2f91bf8",
      "earnedAt": null,
      "progress": 42.86,
      "badge": {
        "badgeId": "8d0f7780-8536-51ef-b055-f18fd2f91bf8",
        "name": "Week Warrior",
        "description": "Study for 7 consecutive days",
        "iconUrl": "https://example.com/badges/week-warrior.png",
        "category": "streak",
        "criteriaType": "consecutive_days",
        "threshold": 7,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    }
  ]
}
```

#### Response Fields

| Field  | Type  | Description                    |
| ------ | ----- | ------------------------------ |
| badges | array | Array of user badge records    |

**User Badge Object:**

| Field    | Type         | Description                                                    |
| -------- | ------------ | -------------------------------------------------------------- |
| userId   | string       | User's unique identifier (UUID)                                |
| badgeId  | string       | Badge's unique identifier (UUID)                               |
| earnedAt | string/null  | ISO 8601 timestamp when badge was earned, null if not earned   |
| progress | number       | Progress percentage (0-100), only present if includeProgress=true |
| badge    | object       | Complete badge information (see Badge Object above)            |

#### Error Responses

**Missing User ID (400 Bad Request)**

```json
{
  "error": "userId is required"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Award Badge

**Endpoint:** `POST /award`

**Description:** Manually award a badge to a user. Useful for special achievements or administrative purposes.

#### Request Parameters

| Parameter | Type   | Location | Required | Description                      |
| --------- | ------ | -------- | -------- | -------------------------------- |
| `userId`  | string | Body     | Yes      | UUID of the user to award        |
| `badgeId` | string | Body     | Yes      | UUID of the badge to award       |

#### Example Request

```bash
POST /api/v1/badges/award
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
Body:
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

#### Success Response (201 Created)

```json
{
  "userBadge": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "earnedAt": "2025-11-27T10:30:00Z"
  }
}
```

#### Response Fields

| Field     | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| userBadge | object | The newly awarded user badge     |

**User Badge Object:**

| Field    | Type   | Description                              |
| -------- | ------ | ---------------------------------------- |
| userId   | string | User's unique identifier (UUID)          |
| badgeId  | string | Badge's unique identifier (UUID)         |
| earnedAt | string | ISO 8601 timestamp when badge was earned |

#### Error Responses

**Missing User ID (400 Bad Request)**

```json
{
  "error": "userId is required"
}
```

**Missing Badge ID (400 Bad Request)**

```json
{
  "error": "badgeId is required"
}
```

**Badge Already Earned (409 Conflict)**

```json
{
  "error": "Badge already earned by user"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Check and Award User Badges

**Endpoint:** `POST /users/:userId/check`

**Description:** Check a user's study sessions and automatically award any badges whose criteria have been met. Returns a list of newly awarded badges.

#### Request Parameters

| Parameter | Type   | Location | Required | Description      |
| --------- | ------ | -------- | -------- | ---------------- |
| `userId`  | string | Path     | Yes      | UUID of the user |

#### Example Request

```bash
POST /api/v1/badges/users/550e8400-e29b-41d4-a716-446655440000/check
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "newBadges": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "badgeId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "earnedAt": "2025-11-27T10:30:00Z"
    },
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "badgeId": "8d0f7780-8536-51ef-b055-f18fd2f91bf8",
      "earnedAt": "2025-11-27T10:30:00Z"
    }
  ],
  "count": 2
}
```

#### Empty Response (200 OK) - No New Badges

```json
{
  "newBadges": [],
  "count": 0
}
```

#### Response Fields

| Field     | Type    | Description                              |
| --------- | ------- | ---------------------------------------- |
| newBadges | array   | Array of newly awarded user badges       |
| count     | integer | Number of badges newly awarded           |

**User Badge Object:**

| Field    | Type   | Description                              |
| -------- | ------ | ---------------------------------------- |
| userId   | string | User's unique identifier (UUID)          |
| badgeId  | string | Badge's unique identifier (UUID)         |
| earnedAt | string | ISO 8601 timestamp when badge was earned |

#### Error Responses

**Missing User ID (400 Bad Request)**

```json
{
  "error": "userId is required"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

## Badge Criteria Types

The following criteria types are supported for badge achievements:

| Criteria Type     | Description                                      | Example Threshold |
| ----------------- | ------------------------------------------------ | ----------------- |
| session_count     | Number of completed study sessions               | 10 (sessions)     |
| total_minutes     | Total accumulated study time in minutes          | 600 (10 hours)    |
| consecutive_days  | Number of consecutive days with study sessions   | 7 (days)          |

---
