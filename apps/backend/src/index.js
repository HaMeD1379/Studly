/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/index.js
 *  Group: Group 3 — COMP 4350: Software Engineering 2
 *  Project: Studly
 *  Assisted-by: ChatGPT (GPT-5 Thinking) for comments, documentation, debugging,
 *               and partial code contributions
 *  Last-Updated: 2025-10-11
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Entry point of the Studly backend service.
 *  Initializes and configures the Express application, registers middleware, and
 *  mounts all feature routers (currently: Sessions API).
 *
 *  Features
 *  --------
 *  • CORS enabled for cross-origin frontend requests.
 *  • JSON body parsing middleware (built-in to Express).
 *  • Lightweight health checks for uptime monitoring.
 *  • Modular route structure for scalability.
 *
 *  Design Principles
 *  -----------------
 *  • Maintain a clean separation between app configuration and business logic.
 *  • Each route group (e.g., /sessions) lives in its own module.
 *  • Health endpoint supports CI/CD and deployment probes.
 *
 *  TODOs
 *  -----
 *  • [OBSERVABILITY] Add request logging middleware (e.g., morgan/pino).
 *  • [ERROR HANDLING] Centralize error handling middleware.
 *  • [CONFIG MGMT] Externalize port and CORS config into environment variables.
 *  • [SECURITY] Add rate limiting and helmet headers in production.
 *
 *  @module app
 * ────────────────────────────────────────────────────────────────────────────────
 */

import express from 'express';
import cors from 'cors';
import sessionsRouter from './routes/sessions.routes.js';

const app = express(); // Initialize Express application

// ────────────────────────────────────────────────────────────────────────────────
//  Middleware
// ────────────────────────────────────────────────────────────────────────────────

// Enable Cross-Origin Resource Sharing (CORS) — required for frontend access
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ────────────────────────────────────────────────────────────────────────────────
//  Health & Root Endpoints
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @route GET /health
 * @desc Simple health check endpoint for deployment and uptime monitoring.
 * @returns {string} "ok"
 */
app.get('/health', (_, res) => res.status(200).send('ok'));

/**
 * @route GET /
 * @desc Root endpoint for quick API status verification.
 * @returns {object} { status: 'studly api running' }
 */
app.get('/', (_, res) => res.send({ status: 'studly api running' }));

// ────────────────────────────────────────────────────────────────────────────────
//  Routers
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @route /sessions
 * @desc Mounts all session-related endpoints under /sessions.
 */
app.use('/sessions', sessionsRouter);

// ────────────────────────────────────────────────────────────────────────────────
//  Server Initialization
// ────────────────────────────────────────────────────────────────────────────────

const port = process.env.PORT || 3000; // Default to port 3000 if not defined

// Start the Express server
app.listen(port, () => console.log(`🚀 Studly API listening on port :${port}`));

export default app; // Export for testability (Jest/Supertest)
