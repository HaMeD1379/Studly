## Base URL

```
/api/v1/friends
```

---

## Authentication

All endpoints require the following header:

```
x-api-key: <your-api-key>
Content-Type: application/json
```

---

## Status Codes Reference

| Code | Status   | Description                                    |
| ---- | -------- | ---------------------------------------------- |
| 1    | Pending  | Friend request sent but not yet responded to   |
| 2    | Accepted | Friend request accepted, users are now friends |
| 3    | Rejected | Friend request was declined                    |

---

## API Endpoints

### 1. Get Friends Count

**Endpoint:** `GET /count/:id`

**Description:** Retrieve the total count of friends for a specific user, optionally filtered by status.

#### Request Parameters

| Parameter | Type    | Location | Required | Description                                          |
| --------- | ------- | -------- | -------- | ---------------------------------------------------- |
| `id`      | string  | Path     | Yes      | User ID (UUID format)                                |
| `status`  | integer | Query    | No       | Filter by status (1=pending, 2=accepted, 3=rejected) |

#### Example Requests

```bash
# Get total friend count
GET /api/v1/friends/count/123e4567-e89b-12d3-a456-426614174000

# Get pending requests count
GET /api/v1/friends/count/123e4567-e89b-12d3-a456-426614174000?status=1

# Get accepted friends count
GET /api/v1/friends/count/123e4567-e89b-12d3-a456-426614174000?status=2
```

#### Success Response (200)

```json
{
	"message": "Friends count retrieved successfully",
	"data": {
		"user_id": "123e4567-e89b-12d3-a456-426614174000",
		"count": 5
	}
}
```

#### Error Responses

**400 Bad Request** - Invalid status parameter

```json
{
	"error": "Invalid status. Must be 1 (pending), 2 (accepted), or 3 (rejected)"
}
```

**500 Internal Server Error** - Server error

```json
{
	"error": "Internal server error"
}
```

---

### 2. Get All Friends

**Endpoint:** `GET /all/:id`

**Description:** Retrieve detailed list of all friends for a specific user, optionally filtered by status.

#### Request Parameters

| Parameter | Type    | Location | Required | Description                                          |
| --------- | ------- | -------- | -------- | ---------------------------------------------------- |
| `id`      | string  | Path     | Yes      | User ID (UUID format)                                |
| `status`  | integer | Query    | No       | Filter by status (1=pending, 2=accepted, 3=rejected) |

#### Example Requests

```bash
# Get all friends (all statuses)
GET /api/v1/friends/all/123e4567-e89b-12d3-a456-426614174000

# Get pending requests
GET /api/v1/friends/all/123e4567-e89b-12d3-a456-426614174000?status=1

# Get accepted friends
GET /api/v1/friends/all/123e4567-e89b-12d3-a456-426614174000?status=2
```

#### Success Response (200)

```json
{
	"message": "Friends retrieved successfully",
	"data": {
		"user_id": "123e4567-e89b-12d3-a456-426614174000",
		"friends": [
			{
				"id": "friend-uuid-1",
				"from_user": "123e4567-e89b-12d3-a456-426614174000",
				"to_user": "987fcdeb-51a2-43f7-8d9e-123456789abc",
				"status": 2,
				"updated_at": "2025-11-12T10:00:00Z"
			},
			{
				"id": "friend-uuid-2",
				"from_user": "456def78-9abc-1234-5678-90abcdef1234",
				"to_user": "123e4567-e89b-12d3-a456-426614174000",
				"status": 1,
				"updated_at": "2025-11-12T11:00:00Z"
			}
		]
	}
}
```

#### Error Responses

**400 Bad Request** - Invalid status parameter

```json
{
	"error": "Invalid status. Must be 1 (pending), 2 (accepted), or 3 (rejected)"
}
```

**500 Internal Server Error** - Server error

```json
{
	"error": "Internal server error"
}
```

---

### 3. Send Friend Request

**Endpoint:** `POST /request`

**Description:** Send a friend request to another user. Creates a new friendship with status 1 (pending).

#### Request Body

| Field       | Type   | Required | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| `from_user` | string | Yes      | UUID of user sending request   |
| `to_user`   | string | Yes      | UUID of user receiving request |

#### Example Request

```bash
POST /api/v1/friends/request
Content-Type: application/json

{
  "from_user": "123e4567-e89b-12d3-a456-426614174000",
  "to_user": "987fcdeb-51a2-43f7-8d9e-123456789abc"
}
```

#### Success Response (201)

```json
{
	"message": "Friend request sent successfully",
	"data": {
		"id": "new-friend-uuid",
		"from_user": "123e4567-e89b-12d3-a456-426614174000",
		"to_user": "987fcdeb-51a2-43f7-8d9e-123456789abc",
		"status": 1,
		"updated_at": "2025-11-12T12:00:00Z"
	}
}
```

#### Error Responses

**400 Bad Request** - Missing required fields

```json
{
	"error": "Both from_user and to_user are required"
}
```

**400 Bad Request** - Self-friendship attempt

```json
{
	"error": "Users cannot send friend requests to themselves"
}
```

**400 Bad Request** - Friendship already exists

```json
{
	"error": "Friendship already exists between these users"
}
```

**500 Internal Server Error** - Server error

```json
{
	"error": "Internal server error"
}
```

---

### 4. Update Friend Status

**Endpoint:** `PATCH /status`

**Description:** Accept or reject a friend request by updating the status to 2 (accepted) or 3 (rejected).

#### Request Body

| Field       | Type    | Required | Description                                    |
| ----------- | ------- | -------- | ---------------------------------------------- |
| `from_user` | string  | Yes      | UUID of user who sent the original request     |
| `to_user`   | string  | Yes      | UUID of user who received the original request |
| `status`    | integer | Yes      | New status (2=accept, 3=reject)                |

#### Example Requests

```bash
# Accept friend request
PATCH /api/v1/friends/status
Content-Type: application/json

{
  "from_user": "123e4567-e89b-12d3-a456-426614174000",
  "to_user": "987fcdeb-51a2-43f7-8d9e-123456789abc",
  "status": 2
}

# Reject friend request
PATCH /api/v1/friends/status
Content-Type: application/json

{
  "from_user": "123e4567-e89b-12d3-a456-426614174000",
  "to_user": "987fcdeb-51a2-43f7-8d9e-123456789abc",
  "status": 3
}
```

#### Success Response (200)

```json
{
	"message": "Friend status updated successfully",
	"data": {
		"id": "friend-uuid",
		"from_user": "123e4567-e89b-12d3-a456-426614174000",
		"to_user": "987fcdeb-51a2-43f7-8d9e-123456789abc",
		"status": 2,
		"updated_at": "2025-11-12T13:00:00Z"
	}
}
```

#### Error Responses

**400 Bad Request** - Missing required fields

```json
{
	"error": "from_user, to_user, and status are required fields"
}
```

**400 Bad Request** - Invalid status for update

```json
{
	"error": "Status must be 2 (accept) or 3 (reject) for updates"
}
```

**500 Internal Server Error** - Server error

```json
{
	"error": "Internal server error"
}
```

---

## Database Schema

### Friends Table

| Column       | Type      | Constraints | Description                                        |
| ------------ | --------- | ----------- | -------------------------------------------------- |
| `id`         | UUID      | PRIMARY KEY | Unique friendship identifier                       |
| `from_user`  | UUID      | NOT NULL    | User who sent the friend request                   |
| `to_user`    | UUID      | NOT NULL    | User who received the friend request               |
| `status`     | INTEGER   | NOT NULL    | Current status (1=pending, 2=accepted, 3=rejected) |
| `updated_at` | TIMESTAMP | NOT NULL    | Last update timestamp                              |

### Indexes

-   `idx_from_user` on `from_user` column
-   `idx_to_user` on `to_user` column
-   `idx_status` on `status` column
-   `idx_users_status` on `(from_user, to_user, status)` for optimal queries

---
