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

import express from 'express';
import cors from 'cors';
import STRINGS from './config/strings.js';
import authRoutes from './routes/v1/authentication.routes.js';
import sessionsRoutes from './routes/v1/sessions.routes.js';
import requireInternalApiKey from './middleware/internalApiKey.js';
import badgesRoutes from './routes/v1/badges.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Public endpoints
app.get('/health', (_req, res) => res.status(200).send('ok'));
app.get('/', (_req, res) => res.send({ status: 'studly api running' }));

// Protect all versioned API routes under /api with INTERNAL_API_TOKEN
app.use('/api', requireInternalApiKey);

app.use(STRINGS.API.AUTH_ROUTE, authRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1/badges', badgesRoutes);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () =>
    console.log(`🚀 Studly API listening on port :${port}`),
  );
}

export default app;
