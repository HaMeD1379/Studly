/**
 * ----------------------------------------------------------------------------
 * Group: Group 3 — COMP 4350: Software Engineering 2
 * Project: Studly
 * Author: Hamed Esmaeilzadeh (team member)
 * Generated / scaffolded with assistance from ChatGPT (GPT-5 Thinking mini)
 * Date: 2025-10-07
 * ----------------------------------------------------------------------------
 */

/* Minimal Express app, CommonJS style so tests can require() it. */

const express = require('express');
const app = express();

app.get('/health', (req, res) => res.status(200).send('ok'));

app.get('/', (req, res) => {
  res.json({ status: 'studly api running' });
});

// If invoked directly (node src/server.js), start listening.
// When required by tests, this block does not run.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`api listening on :${port}`));
}

module.exports = app;
