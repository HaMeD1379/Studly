/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/friends.controller.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements friend management endpoints backed by Supabase Database.
 *  Handles friend requests, status updates, and friend listings with validation.
 *
 *  Features
 *  --------
 *  • Get count of friends by status
 *  • Get all friends with details by user ID and status
 *  • Send friend request (creates pending friendship)
 *  • Update friend status (accept/reject requests)
 *
 *  Design Principles
 *  -----------------
 *  • Keep business logic thin by delegating to Supabase SDK calls.
 *  • Reuse STRINGS constants to avoid fragile literal comparisons.
 *  • Encapsulate error handling for predictable client behavior.
 *
 *  @module controllers/friends
 * ────────────────────────────────────────────────────────────────────────────────
 */

import STRINGS from "../config/strings.config.js";
import supabase from "../config/supabase.client.js";
import { handleError, handleSuccess } from "../utils/server.utils.js";

/**
 * Get count of friends by status (sent requests only)
 * GET /api/v1/friends/count/:id?status=1
 */
export const getFriendsCount = async (req, res) => {
  const { id: userId } = req.params;
  const { status } = req.query;

  try {
    let query = supabase
      .from("friends")
      .select("*", { count: "exact", head: true })
      .eq("from_user", userId);

    if (status) {
      const statusNum = Number.parseInt(status, 10);
      if (![1, 2, 3].includes(statusNum)) {
        handleError(res, 400, STRINGS.FRIENDS.INVALID_STATUS);
        return;
      }
      query = query.eq("status", statusNum);
    }

    const { count, error } = await query;

    if (error) {
      console.error(STRINGS.FRIENDS.COUNT_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.FRIENDS.COUNT_SUCCESS, {
      user_id: userId,
      count: count || 0,
    });
  } catch (error) {
    console.error(STRINGS.FRIENDS.UNEXPECTED_COUNT_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

/**
 * Get pending friend requests received by user
 * GET /api/v1/friends/pending/:id
 */
export const getPendingRequests = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .eq("to_user", userId)
      .eq("status", 1);

    if (error) {
      console.error(STRINGS.FRIENDS.PENDING_REQUESTS_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.FRIENDS.PENDING_REQUESTS_SUCCESS, {
      user_id: userId,
      pending_requests: data || [],
    });
  } catch (error) {
    console.error(
      STRINGS.FRIENDS.UNEXPECTED_PENDING_REQUESTS_ERROR,
      error.message
    );
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

/**
 * Get all friends sent by user (from_user = userId)
 * GET /api/v1/friends/all/:id?status=2
 */
export const getAllFriends = async (req, res) => {
  const { id: userId } = req.params;
  const { status } = req.query;

  try {
    let query = supabase.from("friends").select("*").eq("from_user", userId);

    if (status) {
      const statusNum = Number.parseInt(status, 10);
      if (![1, 2, 3].includes(statusNum)) {
        handleError(res, 400, STRINGS.FRIENDS.INVALID_STATUS);
        return;
      }
      query = query.eq("status", statusNum);
    }

    const { data, error } = await query;

    if (error) {
      console.error(STRINGS.FRIENDS.GET_ALL_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.FRIENDS.GET_ALL_SUCCESS, {
      user_id: userId,
      friends: data || [],
    });
  } catch (error) {
    console.error(STRINGS.FRIENDS.UNEXPECTED_GET_ALL_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

/**
 * Send friend request
 * POST /api/v1/friends/request
 */
export const sendFriendRequest = async (req, res) => {
  const { from_user: fromUser, to_user: toUser } = req.body;

  if (!fromUser || !toUser) {
    handleError(res, 400, STRINGS.FRIENDS.MISSING_USERS);
    return;
  }

  if (fromUser === toUser) {
    handleError(res, 400, STRINGS.FRIENDS.CANNOT_FRIEND_SELF);
    return;
  }

  try {
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from("friends")
      .select("*")
      .or(
        `and(from_user.eq.${fromUser},to_user.eq.${toUser}),and(from_user.eq.${toUser},to_user.eq.${fromUser})`
      )
      .maybeSingle();

    if (existing) {
      handleError(res, 400, STRINGS.FRIENDS.ALREADY_EXISTS);
      return;
    }

    // Create new friend request with status 1 (pending)
    const { data, error } = await supabase
      .from("friends")
      .insert({
        from_user: fromUser,
        to_user: toUser,
        status: 1,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(STRINGS.FRIENDS.REQUEST_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 201, STRINGS.FRIENDS.REQUEST_SUCCESS, data);
  } catch (error) {
    console.error(STRINGS.FRIENDS.UNEXPECTED_REQUEST_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

/**
 * Update friend status (accept/reject)
 * PATCH /api/v1/friends/status
 */
export const updateFriendStatus = async (req, res) => {
  const { from_user: fromUser, to_user: toUser, status } = req.body;

  if (!fromUser || !toUser || status === undefined) {
    handleError(res, 400, STRINGS.FRIENDS.MISSING_FIELDS);
    return;
  }

  const statusNum = Number.parseInt(status, 10);
  if (![2, 3].includes(statusNum)) {
    handleError(res, 400, STRINGS.FRIENDS.INVALID_STATUS_UPDATE);
    return;
  }

  if (fromUser === toUser) {
    handleError(res, 400, STRINGS.FRIENDS.CANNOT_FRIEND_SELF);
    return;
  }

  try {
    const { data, error } = await supabase
      .from("friends")
      .update({
        status: statusNum,
        updated_at: new Date().toISOString(),
      })
      .eq("from_user", fromUser)
      .eq("to_user", toUser)
      .select()
      .single();

    if (error) {
      console.error(STRINGS.FRIENDS.UPDATE_ERROR, error.message);
      handleError(res, 400, error.message);
      return;
    }

    handleSuccess(res, 200, STRINGS.FRIENDS.UPDATE_SUCCESS, data);
  } catch (error) {
    console.error(STRINGS.FRIENDS.UNEXPECTED_UPDATE_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export default {
  getFriendsCount,
  getAllFriends,
  getPendingRequests,
  sendFriendRequest,
  updateFriendStatus,
};
