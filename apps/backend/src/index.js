/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/index.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Author: Shiv Bhagat
 *  Comments: Curated by GPT (Large Language Model)
 *  Last-Updated: 2025-10-15
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Entry point for the Studly backend service. Configures the Express
 *  application, registers middleware, mounts API routers, and starts the HTTP
 *  server. Versioned routing under /api/v1 keeps the platform forward-compatible.
 *
 *  Features
 *  --------
 *  • CORS enabled for cross-origin frontend requests.
 *  • JSON body parsing middleware for REST endpoints.
 *  • Healthcheck endpoints for uptime monitoring.
 *  • Mounts authentication and sessions routers under /api/v1.
 *
 *  Design Principles
 *  -----------------
 *  • Keep bootstrapping logic minimal and readable.
 *  • Mount routers using versioned prefixes to enable evolution.
 *  • Export the Express app for integration testing.
 *
 *  TODOs
 *  -----
 *  • [OBSERVABILITY] Add structured request logging middleware.
 *  • [ERROR HANDLING] Introduce centralized error-handling middleware.
 *  • [SECURITY] Apply Helmet and rate limiting in production environments.
 *
 *  @module app
 * ────────────────────────────────────────────────────────────────────────────────
 */

import "dotenv/config";

import express from "express";
import cors from "cors";
import STRINGS from "./config/strings.config.js";
import authRoutes from "./routes/v1/authentication.routes.js";
import sessionsRoutes from "./routes/v1/sessions.routes.js";
import profileRoutes from "./routes/v1/profile.routes.js";
import friendsRoutes from "./routes/v1/friends.routes.js";
import requireInternalApiKey from "./middleware/internal-api-key.middleware.js";
import badgesRoutes from "./routes/v1/badges.routes.js";
import leaderboardRoutes from "./routes/v1/leaderboard.routes.js";
import profiling from "./middleware/profiling.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(profiling);

// Public endpoints
app.get(STRINGS.API.HEALTHCHECK_ROUTE, (_req, res) =>
  res.status(200).send(STRINGS.GENERAL.OK)
);
app.get(STRINGS.API.ROOT_ROUTE, (_req, res) =>
  res.send({ status: STRINGS.GENERAL.SERVER_STATUS_OK })
);

// Protect all versioned API routes under /api with INTERNAL_API_TOKEN
app.use(STRINGS.API.PROTECTED_API_PREFIX, requireInternalApiKey);

app.use(STRINGS.API.AUTH_ROUTE, authRoutes);
app.use(STRINGS.API.SESSIONS_ROUTE, sessionsRoutes);
app.use(STRINGS.API.PROFILE_ROUTE, profileRoutes);
app.use(STRINGS.API.FRIENDS_ROUTE, friendsRoutes);
app.use(STRINGS.API.BADGES_ROUTE, badgesRoutes);
app.use(STRINGS.API.LEADERBOARD_ROUTE, leaderboardRoutes);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () =>
    console.log(`🚀 Studly API listening on port :${port}`)
  );
}

export default app;
