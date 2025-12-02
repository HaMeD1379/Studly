# Profile API Contract

## Base URL

```
/api/v1/profile
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

The Profile API provides functionality for managing user profiles in Studly. It allows retrieving user profile information, updating profile details (full name and bio), and searching for profiles by email or name. Profile data is stored in the user_profile table and includes the user's email, full name, and bio.

---

## API Endpoints

### Get Profile

**Endpoint:** `GET /:id`

**Description:** Retrieve profile information for a specific user by their user ID.

#### Request Parameters

| Parameter | Type   | Location | Required | Description      |
| --------- | ------ | -------- | -------- | ---------------- |
| `id`      | string | Path     | Yes      | UUID of the user |

#### Example Request

```bash
GET /api/v1/profile/550e8400-e29b-41d4-a716-446655440000
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "bio": "Computer Science student passionate about AI and machine learning."
  }
}
```

#### Response Fields

| Field   | Type   | Description            |
| ------- | ------ | ---------------------- |
| message | string | Success message        |
| data    | object | User profile data      |

**Data Object:**

| Field     | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| user_id   | string | User's unique identifier (UUID)      |
| email     | string | User's email address                 |
| full_name | string | User's full name                     |
| bio       | string | User's bio (max 500 characters)      |

#### Error Responses

**User Not Found (404 Not Found)**

```json
{
  "error": "User not found"
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

### Update Profile

**Endpoint:** `PATCH /update`

**Description:** Update a user's profile information. At least one field (full_name or bio) must be provided. Only provided fields will be updated.

#### Request Parameters

| Parameter   | Type   | Location | Required | Description                                |
| ----------- | ------ | -------- | -------- | ------------------------------------------ |
| `user_id`   | string | Body     | Yes      | UUID of the user to update                 |
| `full_name` | string | Body     | No       | User's full name (at least one field required) |
| `bio`       | string | Body     | No       | User's bio, max 500 characters (at least one field required) |

#### Example Requests

```bash
# Update full name only
PATCH /api/v1/profile/update
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
Body:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "full_name": "John Smith"
}

# Update bio only
PATCH /api/v1/profile/update
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
Body:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "bio": "Updated bio - now studying data science!"
}

# Update both fields
PATCH /api/v1/profile/update
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
Body:
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "full_name": "John Smith",
  "bio": "Computer Science graduate focusing on AI research."
}
```

#### Success Response (200 OK)

```json
{
  "message": "Profile updated successfully",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "full_name": "John Smith",
    "bio": "Computer Science graduate focusing on AI research."
  }
}
```

#### Response Fields

| Field   | Type   | Description            |
| ------- | ------ | ---------------------- |
| message | string | Success message        |
| data    | object | Updated profile data   |

**Data Object:**

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| user_id   | string | User's unique identifier (UUID) |
| email     | string | User's email address            |
| full_name | string | User's full name                |
| bio       | string | User's bio                      |

#### Error Responses

**No Fields Provided (400 Bad Request)**

```json
{
  "error": "No fields provided to update"
}
```

**Profile Not Found (404 Not Found)**

```json
{
  "error": "Profile not found"
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

### Search Profiles

**Endpoint:** `GET /search`

**Description:** Search for user profiles by email or full name. Returns all profiles where the email or full name contains the search string (case-insensitive).

#### Request Parameters

| Parameter | Type   | Location | Required | Description                                      |
| --------- | ------ | -------- | -------- | ------------------------------------------------ |
| `str`     | string | Query    | Yes      | Search string to match against email or full_name |

#### Example Requests

```bash
# Search by name
GET /api/v1/profile/search?str=john
Headers:
  x-api-key: your-api-key
  Content-Type: application/json

# Search by email domain
GET /api/v1/profile/search?str=@example.com
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "message": "Profiles found successfully",
  "data": {
    "results": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "bio": "Computer Science student passionate about AI."
      },
      {
        "user_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "email": "johnny.smith@example.com",
        "full_name": "Johnny Smith",
        "bio": "Mathematics major."
      }
    ],
    "count": 2
  }
}
```

#### Empty Results Response (200 OK)

```json
{
  "message": "Profiles found successfully",
  "data": {
    "results": [],
    "count": 0
  }
}
```

#### Response Fields

| Field   | Type   | Description                          |
| ------- | ------ | ------------------------------------ |
| message | string | Success message                      |
| data    | object | Container for results and metadata   |

**Data Object:**

| Field   | Type    | Description                           |
| ------- | ------- | ------------------------------------- |
| results | array   | Array of matching user profiles       |
| count   | integer | Number of profiles returned           |

**Profile Object (in results array):**

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| user_id   | string | User's unique identifier (UUID) |
| email     | string | User's email address            |
| full_name | string | User's full name                |
| bio       | string | User's bio                      |

#### Error Responses

**Missing Search String (400 Bad Request)**

```json
{
  "error": "Search string is required"
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
