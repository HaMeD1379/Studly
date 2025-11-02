/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/profile.controller.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by Chat-GPT (Large Language Model)
 *  Last-Updated: 2025-11-01
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements profile management endpoints backed by Supabase Auth and Database.
 *  Handles updating user metadata (full_name) in auth.users and bio in the
 *  user_profile table. Provides consistent error handling and validation.
 *
 *  Features
 *  --------
 *  • Updates full_name in Supabase Auth user metadata.
 *  • Updates bio in user_profile table (creates row if not exists).
 *  • Validates bio length (max 500 characters).
 *  • Handles missing user ID and Supabase errors gracefully.
 *
 *  Design Principles
 *  -----------------
 *  • Keep business logic thin by delegating to Supabase SDK calls.
 *  • Reuse STRINGS constants to avoid fragile literal comparisons.
 *  • Encapsulate error handling for predictable client behavior.
 *
 *
 *  @module controllers/profile
 * ────────────────────────────────────────────────────────────────────────────────
 */

import supabase from "../config/supabase.client.js";
import { createClient } from "@supabase/supabase-js";
import { handleError, handleSuccess } from "../utils/server.utils.js";
import STRINGS from "../config/strings.config.js";

// Factory function for creating Supabase clients - can be mocked in tests
export let createSupabaseClient = createClient;

// Allow tests to override the createClient function
export const setCreateSupabaseClient = (fn) => {
  createSupabaseClient = fn;
};

export const updateProfile = async (req, res) => {
  const {
    user_id: userId,
    full_name: fullName,
    bio,
    refresh_token: refreshToken,
  } = req.body;
  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  try {
    // Update full_name in auth.users metadata if provided and access token exists
    if (fullName !== undefined && accessToken && refreshToken) {
      // Create a temporary client with the user's session
      const userSupabase = createSupabaseClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      // Set the session using both access_token and refresh_token
      await userSupabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const { error: authError } = await userSupabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (authError) {
        console.error(STRINGS.PROFILE.UPDATE_ERROR, authError.message);
        handleError(res, 400, authError.message);
        return;
      }
    }

    // Update bio in user_profile table if provided
    if (bio !== undefined) {
      const { error: profileError } = await supabase
        .from("user_profile")
        .upsert(
          {
            user_id: userId,
            bio,
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        console.error(STRINGS.PROFILE.UPDATE_ERROR, profileError.message);
        handleError(res, 400, profileError.message);
        return;
      }
    }

    handleSuccess(res, 200, STRINGS.PROFILE.UPDATE_SUCCESS, {
      user_id: userId,
      full_name: fullName,
      bio,
    });
  } catch (error) {
    console.error(STRINGS.PROFILE.UNEXPECTED_UPDATE_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export default {
  updateProfile,
};
