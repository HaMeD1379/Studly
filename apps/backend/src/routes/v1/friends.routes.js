/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/friends.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-23
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Defines the routing layer for friend management endpoints.
 *  Maps HTTP methods and paths to friend controller functions.
 *
 *  Routes
 *  ------
 *  GET    /api/v1/friends/count/:id      -> Get friends count
 *  GET    /api/v1/friends/all/:id        -> Get all friends
 *  POST   /api/v1/friends/request        -> Send friend request
 *  PATCH  /api/v1/friends/status         -> Update friend status
 *
 *  @module routes/v1/friends
 * ────────────────────────────────────────────────────────────────────────────────
 */

import express from "express";
import {
  getFriendsCount,
  getAllFriends,
  getPendingRequests,
  sendFriendRequest,
  updateFriendStatus,
} from "../../controllers/friends.controller.js";

const router = express.Router();

router.get("/count/:id", getFriendsCount);
router.get("/all/:id", getAllFriends);
router.get("/pending/:id", getPendingRequests);
router.post("/request", sendFriendRequest);
router.patch("/status", updateFriendStatus);

export default router;
