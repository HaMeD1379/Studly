/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/config/strings.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Centralized catalog of literal string values used across the Studly backend.
 *  Keeping all user-facing and system messages in a single module avoids
 *  duplication, simplifies updates, and keeps tests deterministic.
 *
 *  Features
 *  --------
 *  • Namespaced categories (GENERAL, SUPABASE, AUTH, etc.) for quick lookup.
 *  • Shared constants for tests to prevent brittle hard-coded strings.
 *  • Regex patterns for validation logic (e.g., email format enforcement).
 *
 *  Design Principles
 *  -----------------
 *  • Avoid magic strings scattered through the codebase.
 *  • Prefer semantic grouping and self-documenting keys.
 *  • Support internationalization by centralizing text (future ready).
 *
 *  TODOs
 *  -----
 *  • [LOCALIZATION] Consider extracting to JSON per locale when i18n is needed.
 *  • [TYPE-SAFETY] Generate TypeScript typings for autocomplete support.
 *
 *  @module config/strings
 * ────────────────────────────────────────────────────────────────────────────────
 */

const STRINGS = {
  // GENERAL
  GENERAL: {
    STRING: 'string',
    SIGNUP: 'signup',
    SIGN_UP: 'signUp',
    NETWORK_CRASH: 'Network crash',
    SIGNIN_WITH_PASSWORD: 'signInWithPassword',
    AUTH_SERVICE_CRASH: 'Auth service crash',
    SIGNOUT: 'signOut',
    SIGN_OUT: 'signOut',
    SERVER_EXPLOSION: 'Server explosion',
    API_CRASH: 'API crash',
    RESET_PASSWORD_AUTH: 'resetPasswordForEmail',
    RESET_PASSWORD_FOR_EMAIL: 'resetPasswordForEmail',
    UPDATE_USER: 'updateUser',
    INTERNAL_FAIL: 'Internal fail',
    SERVER_UTILS_JS: 'serverUtils.js',
    ERROR: 'error',
    LOG: 'log',
    OK: 'OK',
    BAR: 'bar',
    CREATED: 'Created',
    NOT_FOUND: 'Not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    OBJECT: 'object',
    FUNCTION: 'function',
    INVALID_TOKEN_ERROR: 'Invalid token or expired token',
  },

  // SUPABASE ERRORS
  SUPABASE: {
    SIGNUP_ERROR: 'Supabase signup error: ',
    LOGIN_ERROR: 'Supabase login error: ',
    LOGOUT_ERROR: 'Supabase logout error: ',
    FORGOT_PASSWORD_ERROR: 'Supabase forgot password error: ',
    RESET_PASSWORD_ERROR: 'Supabase reset password error: ',
    MISSING_ACCESS_TOKEN: 'Missing access token in query parameters',
    MISSING_ENV_CONFIGURATION:
      'Supabase environment variables are missing or invalid',
  },

  //AUTHENTICATION
  AUTH: {
    USER_CREATED_SUCCESS: 'User created successfully',
    UNEXPEXTED_SIGNUP_ERROR: 'Unexpected signup error:',
    LOGIN_SUCCESS: 'Login successful',
    UNEXPEXTED_LOGIN_ERROR: 'Unexpected login error:',
    LOGOUT_SUCCESS: 'Logout successful',
    UNEXPECTED_LOGOUT_ERROR: 'Unexpected logout error:',
    PASSWORD_RESET_EMAIL_SUCCESS: 'Password reset email sent',
    UNEXPECTED_FORGOT_PASSWORD_ERROR: 'Unexpected forgot password error:',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    UNEXPECTED_RESET_PASSWORD_ERROR: 'Unexpected reset password error:',
    USER_ALREADY_EXISTS: 'User already exists',
    USER_ALREADY_REGISTERED: 'User already registered',
    FAILED_TO_LOGOUT: 'Failed to logout',
  },

  // VALIDATION
  VALIDATION: {
    MISSING_REQUIRED_FIELDS:
      'Missing required fields: email, password, full_name',
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    INVALID_EMAIL_FORMAT: 'Invalid email format',
    PASSWORD_CHAR_REQUIREMENTS:
      'Password must be at least 8 characters long',
    MISSING_EMAIL_OR_PASSWORD: 'Missing email or password',
    INVALID_LOGIN_CREDENTIALS: 'Invalid login credentials',
    MISSING_EMAIL: 'Missing email',
    MISSING_PASSWORD: 'Missing password',
    MISSING_RESET_PASSWORD_TOKEN: 'Missing reset password token',
  },

  //SERVER UTILS / INTERNAL
  SERVER: {
    INTERNAL_ERROR: 'An internal server error occurred.',
  },

  //MOCK
  MOCK: {
    MOCK_USER_EMAIL: 'test@example.com',
    MOCK_FAIL_EMAIL: 'fail@example.com',
    MOCK_USER_PASSWORD: 'Test@1234',
    MOCK_FIAL_FULL_NAME: 'Crash',
    MOCK_FULL_NAME: 'Test User',
    MOCK_SESSION_SUBJECT: 'Mock Subject',
    MOCK_EXISTING_USER_EMAIL: 'exists@example.com',
    MOCK_EXISTING_PASSWORD: 'Pass@1234',
    MOCK_EXISTING_FULL_NAME: 'Duplicate',
    MOCK_ID: 'mock-id',
    MOCK_WRONG_USER_EMAIL: 'wrong@example.com',
    MOCK_TOKEN: 'mock-token',
    MOCK_REFRESH: 'mock-refresh',
    MOCK_NEW_EMAIL: 'new@example.com',
    MOCK_NEW_PASSWORD: 'ValidPass123!',
    MOCK_NEW_USER_FULL_NAME: 'New User',
    MOCK_EMPTY_STRING: '',
    MOCK_BAD_PASSWORD: 'badpass',
    MOCK_X_EMAIL: 'x@example.com',
    MOCK_X_PASS: 'Pass@1234',
    MOCK_USER_FORGET_EMAIL: 'user@example.com',
    MOCK_NEW_STRONG_PASSWORD: 'Strong@1234',
    MOCK_INVALID_EMAIL: 'invalid-email',
    MOCK_VALID_EMAIL: 'valid@example.com',
    MOCK_INVALID_PASSWORD: '1234',
    MOCK_TEST_INVALID_EMAIL: 'test@invalid.com',
  },

  API: {
    AUTH_ROUTE: '/api/v1/auth',
    AUTH_ROUTES_LITERAL: 'Auth Routes',
    SIGNUP_AUTH_POST: 'POST /api/v1/auth/signup',
    SIGNUP_AUTH: '/api/v1/auth/signup',
    LOGIN_AUTH: '/api/v1/auth/login',
    LOGIN_AUTH_POST: 'POST /api/v1/auth/login',
    LOGOUT_AUTH: '/api/v1/auth/logout',
    LOGOUT_AUTH_POST: 'POST /api/v1/auth/logout',
    FORGOT_PASSWORD_AUTH: '/api/v1/auth/forgot-password',
    FORGOT_PASSWORD_AUTH_POST: 'POST /api/v1/auth/forgot-password',
    RESET_PASSWORD_AUTH_TOKEN: '/api/v1/auth/reset-password?token=',
    RESET_PASSWORD_AUTH: '/api/v1/auth/reset-password',
    RESET_PASSWORD_AUTH_POST: 'POST /api/v1/auth/reset-password',
  },

  TEST: {
    SIGNUP_SUCCESS: 'should return 201 when signup is successful',
    MISSING_INPUT: 'should return 400 when input is missing',
    USER_EXISTS: 'should handle Supabase error (email exists)',
    UNEXPECT_SIGNUP_ERROR: 'should handle unexpected signup error',
    LOGIN_VALID_CREDENTIALS: 'should return 200 for valid credentials',
    LOGIN_INVALID_CREDENTIALS: 'should return 401 for invalid credentials',
    UNEXPECTED_LOGIN_ERROR: 'should handle unexpected login error',
    LOGOUT_SUCCESS: 'should return 200 on successful logout',
    LOGOUT_SUPABASE_ERROR: 'should handle Supabase logout error',
    UNEXPECTED_LOGOUT_ERROR: 'should handle unexpected logout error',
    FORGOT_PASSWORD_SUCCESS: 'should return 200 when email sent',
    FORGOT_PASSWORD_MISSING_EMAIL: 'should return 400 when email missing',
    UNEXPECTED_FORGOT_PASSWORD_ERROR:
      'should handle unexpected forgot password error',
    RESET_PASSWORD_SUCCESS: 'should return 200 on successful password reset',
    RESET_PASSWORD_TOCKEN_MISSING: 'should return 400 when token missing',
    RESET_PASSWORD_MISSING_PASSWORD:
      'should return 400 when password missing',
    RESET_PASSWORD_SUPABASE_ERROR:
      'should handle Supabase error during password reset',
    UNEXPECTED_RESET_PASSWORD_ERROR:
      'should handle unexpected reset password error',
    OTHER_SUPABASE_SIGNUP_ERRORS:
      'should return 400 for other Supabase signup errors',
    SERVER_UTILS_SUCCESS:
      'should handle success with custom message and data',
    SERVER_UTILS_SUCCESS_NULL_DATA: 'should handle success with null data',
    SERVER_UTILS_SUCCESS_UNDEFINED_DATA:
      'should handle success with undefined data (default parameter)',
    SERVER_UTILS_ERROR_EXPLICIT:
      'should handle error with explicit status and message',
    SERVER_UTILS_ERROR_DEFAULTS:
      'should handle error with defaults when no args provided',
    VALIDATE_SIGNUP: 'validateSignup middleware',
    VALIDATE_MISSING_FIELDS:
      'should return 400 for missing required fields',
    VALIDATE_INVALID_EMAIL: 'should return 400 for invalid email format',
    VALIDATE_SHORT_PASSWORD:
      'should return 400 for password shorter than 8 characters',
    VALIDATE_SUCCESS: 'should call next() for valid input',
    SUPABASE_CLIENT_CONFIGURATION: 'Supabase Client Configuration',
    SUPABASE_EXPORT_CLIENT: 'should export a Supabase client instance',
    SUPABASE_AUTH_METHODS: 'should have auth methods available',
    SUPABASE_DATABASE_METHODS: 'should have database methods available',
    SUPABASE_SINGLETON: 'should be a singleton instance',
    SUPABASE_MISSING_ENV:
      'should handle missing environment variables gracefully',


    // Badges unit tests
    BADGES_REPOSITORY_FIND_ALL: 'BadgesRepository - findAllBadges should return all active badges',
    BADGES_REPOSITORY_FIND_BY_ID: 'BadgesRepository - findBadgeById should return specific badge',
    BADGES_REPOSITORY_USER_BADGES: 'BadgesRepository - findUserBadges should return user badges',
    BADGES_REPOSITORY_CREATE: 'BadgesRepository - createUserBadge should create new user badge',
    BADGES_REPOSITORY_UPDATE: 'BadgesRepository - updateUserBadge should update existing badge',
    
    BADGES_SERVICE_GET_ALL: 'BadgesService - getAllBadges should return all badges',
    BADGES_SERVICE_USER_BADGES: 'BadgesService - getUserBadges should return user badges',
    BADGES_SERVICE_AWARD: 'BadgesService - awardBadge should award badge to user',
    BADGES_SERVICE_PROGRESS: 'BadgesService - updateBadgeProgress should update progress',
    BADGES_SERVICE_CHECK: 'BadgesService - checkAndAwardBadges should check and award earned badges',
    BADGES_SERVICE_CALC_PROGRESS: 'BadgesService - calculateBadgeProgress should calculate correct progress',
    BADGES_SERVICE_CALC_STREAK: 'BadgesService - calculateStreak should calculate consecutive days',
    
    BADGES_CONTROLLER_GET_ALL: 'BadgesController - getAllBadges should return all badges',
    BADGES_CONTROLLER_USER_BADGES: 'BadgesController - getUserBadges should return user badges',
    BADGES_CONTROLLER_AWARD: 'BadgesController - awardBadge should award badge',
    BADGES_CONTROLLER_CHECK: 'BadgesController - checkUserBadges should check and award badges',
    
    // Integration tests
    BADGES_INTEGRATION_GET_ALL: 'Badges API - GET /badges should return all badges',
    BADGES_INTEGRATION_USER_BADGES: 'Badges API - GET /users/:userId/badges should return user badges',
    BADGES_INTEGRATION_AWARD: 'Badges API - POST /badges/award should award badge',
    BADGES_INTEGRATION_CHECK: 'Badges API - POST /users/:userId/badges/check should check badges',

  },
};

export default STRINGS;