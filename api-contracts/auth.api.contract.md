# Authentication API Contract

## Base URL

```
/api/v1/auth
```

---

## Authentication

The signup, login, and forgot-password endpoints are public. All other endpoints require the following header:

```
x-api-key: <your-api-key>
Content-Type: application/json
```

---

## Overview

The Authentication API provides user authentication functionality for Studly, powered by Supabase Auth. It supports user registration with profile creation, email/password login with session management, logout, and password reset flows via email. Sessions are managed through Supabase and return access/refresh tokens for authenticated requests.

---

## API Endpoints

### Signup

**Endpoint:** `POST /signup`

**Description:** Register a new user account. Creates both a Supabase Auth user and a corresponding user profile record with the provided full name.

#### Request Parameters

| Parameter   | Type   | Location | Required | Description                    |
| ----------- | ------ | -------- | -------- | ------------------------------ |
| `email`     | string | Body     | Yes      | User's email address           |
| `password`  | string | Body     | Yes      | User's password                |
| `full_name` | string | Body     | Yes      | User's full name               |

#### Example Request

```bash
POST /api/v1/auth/signup
Headers:
  Content-Type: application/json
Body:
{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

#### Success Response (201 Created)

```json
{
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "full_name": "John Doe"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.refresh-token-string...",
      "expires_in": 3600,
      "expires_at": 1732712400,
      "token_type": "bearer"
    }
  }
}
```

#### Response Fields

| Field   | Type   | Description                     |
| ------- | ------ | ------------------------------- |
| message | string | Success message                 |
| data    | object | User and session data           |

**Data Object:**

| Field   | Type   | Description                     |
| ------- | ------ | ------------------------------- |
| user    | object | Created user information        |
| session | object | Supabase session with tokens    |

**User Object:**

| Field     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| id        | string | User's unique identifier (UUID) |
| email     | string | User's email address            |
| full_name | string | User's full name                |

**Session Object:**

| Field         | Type    | Description                              |
| ------------- | ------- | ---------------------------------------- |
| access_token  | string  | JWT access token for authenticated requests |
| refresh_token | string  | Token to refresh the session             |
| expires_in    | integer | Token lifetime in seconds                |
| expires_at    | integer | Unix timestamp when token expires        |
| token_type    | string  | Token type (always "bearer")             |

#### Error Responses

**User Already Exists (409 Conflict)**

```json
{
  "error": "User already registered"
}
```

**Validation Error (400 Bad Request)**

```json
{
  "error": "Validation error message"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Login

**Endpoint:** `POST /login`

**Description:** Authenticate an existing user with email and password. Returns a session with access and refresh tokens.

#### Request Parameters

| Parameter  | Type   | Location | Required | Description          |
| ---------- | ------ | -------- | -------- | -------------------- |
| `email`    | string | Body     | Yes      | User's email address |
| `password` | string | Body     | Yes      | User's password      |

#### Example Request

```bash
POST /api/v1/auth/login
Headers:
  Content-Type: application/json
Body:
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Login successful",
  "data": {
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.refresh-token-string...",
      "expires_in": 3600,
      "expires_at": 1732712400,
      "token_type": "bearer"
    },
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com"
    }
  }
}
```

#### Response Fields

| Field   | Type   | Description                     |
| ------- | ------ | ------------------------------- |
| message | string | Success message                 |
| data    | object | Session and user data           |

**Data Object:**

| Field   | Type   | Description                     |
| ------- | ------ | ------------------------------- |
| session | object | Supabase session with tokens    |
| user    | object | Authenticated user information  |

**User Object:**

| Field | Type   | Description                     |
| ----- | ------ | ------------------------------- |
| id    | string | User's unique identifier (UUID) |
| email | string | User's email address            |

#### Error Responses

**Invalid Credentials (401 Unauthorized)**

```json
{
  "error": "Invalid login credentials"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Logout

**Endpoint:** `POST /logout`

**Description:** Sign out the current user and invalidate their session.

#### Request Parameters

None.

#### Example Request

```bash
POST /api/v1/auth/logout
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
```

#### Success Response (200 OK)

```json
{
  "message": "Logout successful",
  "data": null
}
```

#### Response Fields

| Field   | Type   | Description     |
| ------- | ------ | --------------- |
| message | string | Success message |
| data    | null   | No data returned |

#### Error Responses

**Logout Error (400 Bad Request)**

```json
{
  "error": "Error message"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Forgot Password

**Endpoint:** `POST /forgot-password`

**Description:** Initiate a password reset flow by sending a reset email to the user. The email contains a magic link that redirects to the password reset page.

#### Request Parameters

| Parameter | Type   | Location | Required | Description                        |
| --------- | ------ | -------- | -------- | ---------------------------------- |
| `email`   | string | Body     | Yes      | Email address of the user account  |

#### Example Request

```bash
POST /api/v1/auth/forgot-password
Headers:
  Content-Type: application/json
Body:
{
  "email": "john.doe@example.com"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Password reset email sent successfully",
  "data": {
    "data": {}
  }
}
```

#### Response Fields

| Field   | Type   | Description     |
| ------- | ------ | --------------- |
| message | string | Success message |
| data    | object | Response data   |

#### Error Responses

**Invalid Email (400 Bad Request)**

```json
{
  "error": "Error message"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---

### Reset Password

**Endpoint:** `POST /reset-password`

**Description:** Complete the password reset flow by setting a new password. Requires the reset token from the email link.

#### Request Parameters

| Parameter     | Type   | Location | Required | Description                              |
| ------------- | ------ | -------- | -------- | ---------------------------------------- |
| `token`       | string | Query    | Yes      | Password reset token from email link     |
| `newPassword` | string | Body     | Yes      | The new password to set                  |

#### Example Request

```bash
POST /api/v1/auth/reset-password?token=reset-token-from-email
Headers:
  x-api-key: your-api-key
  Content-Type: application/json
Body:
{
  "newPassword": "newSecurePassword456"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Password reset successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com"
    }
  }
}
```

#### Response Fields

| Field   | Type   | Description           |
| ------- | ------ | --------------------- |
| message | string | Success message       |
| data    | object | Updated user data     |

#### Error Responses

**Missing Token (400 Bad Request)**

```json
{
  "error": "Reset password token is required"
}
```

**Missing Password (400 Bad Request)**

```json
{
  "error": "Password is required"
}
```

**Invalid or Expired Token (400 Bad Request)**

```json
{
  "error": "Error message"
}
```

**Internal Server Error (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

---
