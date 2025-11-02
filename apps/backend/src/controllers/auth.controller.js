/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/auth.controller.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements authentication flows backed by Supabase Auth including signup,
 *  login, logout, forgot password, and reset password endpoints. Controllers
 *  orchestrate Supabase calls and normalize HTTP responses using shared helpers.
 *
 *  Features
 *  --------
 *  • Handles common Supabase error scenarios with descriptive logging.
 *  • Uses centralized response helpers for consistent API contracts.
 *  • Supports password reset flows via Supabase magic links.
 *
 *  Design Principles
 *  -----------------
 *  • Keep business logic thin by delegating to Supabase SDK calls.
 *  • Reuse STRINGS constants to avoid fragile literal comparisons.
 *  • Encapsulate error handling for predictable client behavior.
 *
 *  TODOs
 *  -----
 *  • [SECURITY] Add rate limiting and CAPTCHA for signup/login endpoints.
 *  • [OBSERVABILITY] Replace console logging with structured logger (e.g., pino).
 *  • [FEATURE] Extend metadata stored during signup (e.g., profile photo).
 *
 *  @module controllers/auth
 * ────────────────────────────────────────────────────────────────────────────────
 */

import supabase from "../config/supabase.js";
import { handleError, handleSuccess } from "../utils/server.util.js";
import STRINGS from "../config/strings.js";

export const signup = async (req, res) => {
  const { email, password, full_name: fullName } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      console.error(STRINGS.SUPABASE.SIGNUP_ERROR, error.message);

      if (error.message === STRINGS.AUTH.USER_ALREADY_REGISTERED) {
        handleError(res, 409, error.message);
        return;
      }

      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 201, STRINGS.AUTH.USER_CREATED_SUCCESS, {
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata.full_name,
      },
      session: data.session,
    });
  } catch (error) {
    console.error(STRINGS.AUTH.UNEXPEXTED_SIGNUP_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(STRINGS.SUPABASE.LOGIN_ERROR, error.message);
      handleError(res, 401, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.AUTH.LOGIN_SUCCESS, {
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata.full_name,
      },
    });
  } catch (error) {
    console.error(STRINGS.AUTH.UNEXPEXTED_LOGIN_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export const logout = async (_req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(STRINGS.SUPABASE.LOGOUT_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.AUTH.LOGOUT_SUCCESS, null);
  } catch (error) {
    console.error(STRINGS.AUTH.UNEXPECTED_LOGOUT_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL,
    });

    if (error) {
      console.error(STRINGS.SUPABASE.FORGOT_PASSWORD_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.AUTH.PASSWORD_RESET_EMAIL_SUCCESS, {
      data,
    });
  } catch (error) {
    console.error(STRINGS.AUTH.UNEXPECTED_FORGOT_PASSWORD_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const accessToken = req.query.token;

  if (!accessToken) {
    handleError(res, 400, STRINGS.VALIDATION.MISSING_RESET_PASSWORD_TOKEN);
    return;
  }

  if (!newPassword) {
    handleError(res, 400, STRINGS.VALIDATION.MISSING_PASSWORD);
    return;
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error(STRINGS.SUPABASE.RESET_PASSWORD_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.AUTH.PASSWORD_RESET_SUCCESS, data);
  } catch (error) {
    console.error(STRINGS.AUTH.UNEXPECTED_RESET_PASSWORD_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export default {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
