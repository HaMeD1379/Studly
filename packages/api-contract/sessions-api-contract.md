# Session API Contract

## Overview
The Session API manages user authentication sessions, including login, logout, session validation, and session refresh operations.

## Base URL
```
/api/sessions
```

## Endpoints

### 1. Create Session (Login)
**POST** `/api/sessions`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": "boolean (optional, default: false)"
}
```

**Success Response (200):**
```json
{
  "session": {
    "id": "string",
    "userId": "string",
    "token": "string",
    "expiresAt": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp"
  },
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid credentials
- **400 Bad Request:** Missing or invalid fields
- **429 Too Many Requests:** Too many login attempts

---

### 2. Get Current Session
**GET** `/api/sessions/current`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "session": {
    "id": "string",
    "userId": "string",
    "token": "string",
    "expiresAt": "ISO 8601 timestamp",
    "createdAt": "ISO 8601 timestamp",
    "lastActivityAt": "ISO 8601 timestamp"
  },
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid or expired token
- **403 Forbidden:** Token revoked

---

### 3. Refresh Session Token
**POST** `/api/sessions/refresh`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "session": {
    "id": "string",
    "token": "string (new token)",
    "expiresAt": "ISO 8601 timestamp"
  }
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid or expired token
- **400 Bad Request:** Token cannot be refreshed

---

### 4. Destroy Session (Logout)
**DELETE** `/api/sessions/current`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (204):**
No content

**Error Responses:**
- **401 Unauthorized:** Invalid token
- **500 Internal Server Error:** Logout failed

---

### 5. List Active Sessions
**GET** `/api/sessions`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit`: number (optional, default: 10, max: 100)
- `offset`: number (optional, default: 0)

**Success Response (200):**
```json
{
  "sessions": [
    {
      "id": "string",
      "deviceName": "string",
      "ipAddress": "string",
      "userAgent": "string",
      "createdAt": "ISO 8601 timestamp",
      "lastActivityAt": "ISO 8601 timestamp",
      "expiresAt": "ISO 8601 timestamp",
      "isCurrent": "boolean"
    }
  ],
  "total": "number"
}
```

---

### 6. Destroy Specific Session
**DELETE** `/api/sessions/{sessionId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (204):**
No content

**Error Responses:**
- **401 Unauthorized:** Invalid token
- **403 Forbidden:** Cannot delete other user's sessions
- **404 Not Found:** Session not found

---

## Frontend Usage Guide

### Authentication Setup
Store the token in `localStorage` or a secure cookie:
```javascript
localStorage.setItem('sessionToken', response.session.token);
```

### Include Token in Requests
Add token to all authenticated requests:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Handle Token Expiration
- Check `expiresAt` before making requests
- Implement auto-refresh 5 minutes before expiration
- Redirect to login on 401 responses

### Session Management Best Practices
- Call `GET /api/sessions/current` on app initialization to validate session
- Implement periodic token refresh (every 50 minutes for 1-hour expiration)
- Clear local storage and redirect on logout (DELETE request)
- Handle session expiration gracefully with user notification

