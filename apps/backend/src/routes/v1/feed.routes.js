/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/routes/v1/feed.routes.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-11-27
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Defines the routing layer for feed endpoints.
 *  Maps HTTP methods and paths to feed controller functions.
 *
 *  Routes
 *  ------
 *  GET    /api/v1/feed/:timestamp      -> Get badge achievements feed
 *
 *  @module routes/v1/feed
 * ────────────────────────────────────────────────────────────────────────────────
 */

import express from "express";
import { getFeed } from "../../controllers/feed.controller.js";

const router = express.Router();

router.get("/:timestamp", getFeed);

export default router;
