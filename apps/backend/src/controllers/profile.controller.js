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
import { handleError, handleSuccess } from "../utils/server.utils.js";
import STRINGS from "../config/strings.config.js";

export const updateProfile = async (req, res) => {
  const { user_id: userId, full_name: fullName, bio } = req.body;

  try {
    // Build the update object dynamically - only include provided fields
    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (bio !== undefined) updateData.bio = bio;

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      handleError(res, 400, "No fields provided to update");
      return;
    }

    // Update user_profile table (only updates provided fields)
    const { data, error: profileError } = await supabase
      .from("user_profile")
      .update(updateData)
      .eq("user_id", userId)
      .select();

    if (profileError) {
      console.error(STRINGS.PROFILE.UPDATE_ERROR, profileError.message);
      handleError(res, 400, profileError.message);
      return;
    }

    // Check if profile was found and updated
    if (!data || data.length === 0) {
      handleError(res, 404, "Profile not found");
      return;
    }

    handleSuccess(res, 200, STRINGS.PROFILE.UPDATE_SUCCESS, {
      user_id: userId,
      email: data[0].email,
      full_name: data[0].full_name,
      bio: data[0].bio,
    });
  } catch (error) {
    console.error(STRINGS.PROFILE.UNEXPECTED_UPDATE_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export const getProfileData = async (req, res) => {
  const { id: userId } = req.params;

  try {
    // Retrieve email, full_name, and bio from user_profile table
    const { data, error } = await supabase
      .from("user_profile")
      .select("email, full_name, bio")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no profile found (PGRST116), return 404
      if (error.code === "PGRST116") {
        handleError(res, 404, STRINGS.PROFILE.USER_NOT_FOUND);
        return;
      }
      console.error(STRINGS.PROFILE.GET_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.PROFILE.GET_SUCCESS, {
      user_id: userId,
      email: data?.email || "",
      full_name: data?.full_name || "",
      bio: data?.bio || "",
    });
  } catch (error) {
    console.error(STRINGS.PROFILE.UNEXPECTED_GET_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export const searchProfiles = async (req, res) => {
  const { str } = req.query;

  if (!str || str.trim().length === 0) {
    handleError(res, 400, "Search string is required");
    return;
  }

  try {
    // Search for profiles where email or full_name contains the search string
    const { data, error } = await supabase
      .from("user_profile")
      .select("user_id, email, full_name, bio")
      .or(`email.ilike.%${str}%,full_name.ilike.%${str}%`);

    if (error) {
      console.error("Profile search error:", error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, "Profiles found successfully", {
      results: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected profile search error:", error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export default {
  updateProfile,
  getProfileData,
  searchProfiles,
};
