// filepath: apps/cli-frontend/src/utils/api.client.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/api.client.ts
 *  Project: Studly — CLI Frontend
 *  Designer/Prompter: Hamed Esmaeilzadeh
 *  Implemented-by: Gemini 3 and Claude 4.5
 *  Comments-by: Gemini 3 and Claude 4.5
 *  Last-Updated: 2025-11-26
 *  @designer Hamed Esmaeilzadeh
 *  @prompter Hamed Esmaeilzadeh
 *  @implemented-by Gemini 3 and Claude 4.5
 *  @comments-by Gemini 3 and Claude 4.5
 * ────────────────────────────────────────────────────────────────────────────────
 */
// tags: Studly, CLI, TypeScript

/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/api.client.ts
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly — CLI Frontend
 *  Author: Hamed Esmaeilzadeh
 *  Assisted-by: Claude 3.5 Sonnet (Anthropic) for implementation, testing,
 *               documentation, and code review
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  HTTP client utility module for making authenticated API requests to the Studly
 *  backend. Handles authentication headers, session management, and standardized
 *  response formatting.
 *
 *  Features
 *  --------
 *  • Centralized HTTP request handling with node-fetch
 *  • Automatic authentication header injection from stored sessions
 *  • Internal API key management for CLI-to-backend communication
 *  • Standardized response format with success/error handling
 *  • Type-safe request and response handling
 *
 *  Design Principles
 *  -----------------
 *  • Single source of truth for API configuration
 *  • Automatic session token injection for authenticated requests
 *  • Consistent error handling and response formatting
 *  • Type safety through TypeScript generics
 *
 *
 *  @module utils/api-client
 * ────────────────────────────────────────────────────────────────────────────────
 */

import fetch, { RequestInit } from 'node-fetch';
import { getValidSession } from './session.storage.js';
import { config } from './config.utils.js';

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Backend API base URL - loaded from .env file via config.utils */
const BACKEND_HOST = config.backendHost;

/** Internal API token for CLI-to-backend authentication - loaded from .env file */
const INTERNAL_API_TOKEN = config.internalApiToken;

// ═══════════════════════════════════════════════════════════════════════════════
//  TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standardized API response format
 * @template T - Type of the response data payload
 */
export interface ApiResponse<T = any> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Response data payload (present on success) */
  data?: T;
  /** Success message from the server */
  message?: string;
  /** Error message (present on failure) */
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CORE API CLIENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Makes an HTTP request to the Studly backend API
 *
 * Automatically injects authentication headers and internal API key.
 * Handles JSON parsing and standardizes response format.
 *
 * @template T - Expected type of the response data
 * @param endpoint - API endpoint path (e.g., '/api/v1/auth/login')
 * @param options - Fetch request options (method, body, headers, etc.)
 * @returns Promise resolving to standardized ApiResponse
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Construct full URL
  const url = `${BACKEND_HOST}${endpoint}`;

  // Prepare default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': INTERNAL_API_TOKEN,
    ...((options.headers as Record<string, string>) || {}),
  };

  // Inject authentication token if user is logged in
  const session = getValidSession();
  if (session) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  try {
    // Make HTTP request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse JSON response
    const data = await response.json() as any;

    // Handle successful responses (2xx status codes)
    if (response.ok) {
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } else {
      // Handle error responses
      return {
        success: false,
        error: data.error || data.message || 'Unknown error',
      };
    }
  } catch (error: any) {
    // Handle network errors and other exceptions
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Makes a POST request to the backend API
 *
 * @template T - Expected type of the response data
 * @param endpoint - API endpoint path
 * @param body - Request payload to be JSON-stringified
 * @returns Promise resolving to standardized ApiResponse
 */
export async function apiPost<T = any>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Makes a GET request to the backend API
 *
 * @template T - Expected type of the response data
 * @param endpoint - API endpoint path
 * @returns Promise resolving to standardized ApiResponse
 */
export async function apiGet<T = any>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}
