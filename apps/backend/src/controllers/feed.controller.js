/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/controllers/feed.controller.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-27
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Implements feed endpoint to retrieve badge achievements and study sessions.
 *  Shows user information with badge data and session data for social feed.
 *
 *  Features
 *  --------
 *  • Get badge achievements and study sessions since a given timestamp
 *  • Includes user profile data (full_name, email)
 *  • Includes complete badge and session information
 *  • Returns combined feed sorted oldest to newest, limited to top 100
 *
 *  @module controllers/feed
 * ────────────────────────────────────────────────────────────────────────────────
 */

import STRINGS from "../config/strings.config.js";
import supabase from "../config/supabase.client.js";
import { handleError, handleSuccess } from "../utils/server.utils.js";

/**
 * Get feed of badge achievements and study sessions since timestamp
 * GET /api/v1/feed/:timestamp
 */
export const getFeed = async (req, res) => {
  const { timestamp } = req.params;

  // Validate timestamp format
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    handleError(res, 400, STRINGS.FEED.INVALID_TIMESTAMP);
    return;
  }

  try {
    // Step 1: Get user_badge entries since timestamp
    const { data: userBadges, error: userBadgeError } = await supabase
      .from("user_badge")
      .select("badge_id, user_id, earned_at")
      .gte("earned_at", timestamp);

    if (userBadgeError) {
      console.error(STRINGS.FEED.GET_ERROR, userBadgeError.message);
      handleError(res, 400, userBadgeError.message);
      return;
    }

    // Step 2: Get sessions since timestamp
    const { data: sessions, error: sessionError } = await supabase
      .from("sessions")
      .select(
        "id, user_id, start_time, end_time, subject, session_type, total_time, inserted_at"
      )
      .gte("inserted_at", timestamp);

    if (sessionError) {
      console.error(STRINGS.FEED.GET_ERROR, sessionError.message);
      handleError(res, 400, sessionError.message);
      return;
    }

    // Step 3: Get all unique user_ids and badge_ids
    const badgeUserIds = (userBadges || []).map((ub) => ub.user_id);
    const sessionUserIds = (sessions || []).map((s) => s.user_id);
    const userIds = [...new Set([...badgeUserIds, ...sessionUserIds])];
    const badgeIds = [...new Set((userBadges || []).map((ub) => ub.badge_id))];

    // Early return if no data
    if (userIds.length === 0) {
      handleSuccess(res, 200, STRINGS.FEED.GET_SUCCESS, {
        feed: [],
        count: 0,
      });
      return;
    }

    // Step 4: Fetch user profiles
    const { data: users, error: userError } = await supabase
      .from("user_profile")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    if (userError) {
      console.error(STRINGS.FEED.GET_ERROR, userError.message);
      handleError(res, 400, userError.message);
      return;
    }

    // Step 5: Fetch badges (only if we have badge achievements)
    let badges = [];
    if (badgeIds.length > 0) {
      const { data: badgeData, error: badgeError } = await supabase
        .from("badge")
        .select(
          "badge_id, name, description, icon_url, category, criteria_type, threshold"
        )
        .in("badge_id", badgeIds);

      if (badgeError) {
        console.error(STRINGS.FEED.GET_ERROR, badgeError.message);
        handleError(res, 400, badgeError.message);
        return;
      }
      badges = badgeData || [];
    }

    // Step 6: Create lookup maps
    const userMap = new Map((users || []).map((u) => [u.user_id, u]));
    const badgeMap = new Map(badges.map((b) => [b.badge_id, b]));

    // Step 7: Create badge feed items
    const badgeFeedItems = (userBadges || []).map((ub) => ({
      type: "badge",
      user: {
        user_id: ub.user_id,
        full_name: userMap.get(ub.user_id)?.full_name || "",
        email: userMap.get(ub.user_id)?.email || "",
      },
      badge: {
        badge_id: ub.badge_id,
        name: badgeMap.get(ub.badge_id)?.name || "",
        description: badgeMap.get(ub.badge_id)?.description || "",
        icon_url: badgeMap.get(ub.badge_id)?.icon_url || "",
        category: badgeMap.get(ub.badge_id)?.category || "",
        criteria_type: badgeMap.get(ub.badge_id)?.criteria_type || "",
        threshold: badgeMap.get(ub.badge_id)?.threshold || 0,
      },
      timestamp: ub.earned_at,
    }));

    // Step 8: Create session feed items
    const sessionFeedItems = (sessions || []).map((s) => ({
      type: "session",
      user: {
        user_id: s.user_id,
        full_name: userMap.get(s.user_id)?.full_name || "",
        email: userMap.get(s.user_id)?.email || "",
      },
      session: {
        id: s.id,
        start_time: s.start_time,
        end_time: s.end_time,
        subject: s.subject,
        session_type: s.session_type,
        total_time: s.total_time,
      },
      timestamp: s.inserted_at,
    }));

    // Step 9: Combine and sort (oldest to newest), limit to 100
    const allFeedItems = [...badgeFeedItems, ...sessionFeedItems]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(0, 100);

    handleSuccess(res, 200, STRINGS.FEED.GET_SUCCESS, {
      feed: allFeedItems,
      count: allFeedItems.length,
    });
  } catch (error) {
    console.error(STRINGS.FEED.UNEXPECTED_GET_ERROR, error.message);
    handleError(res, 500, STRINGS.SERVER.INTERNAL_ERROR);
  }
};

export default {
  getFeed,
};
