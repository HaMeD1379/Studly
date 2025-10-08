/**
 * ----------------------------------------------------------------------------
 * Group: Group 3 — COMP 4350: Software Engineering 2
 * Project: Studly
 * Author: Hamed Esmaeilzadeh (team member)
 * Generated / scaffolded with assistance from ChatGPT (GPT-5 Thinking mini)
 * Date: 2025-10-07
 * ----------------------------------------------------------------------------
 */

const request = require('supertest');
const app = require('../../src/server');

describe('Unit /health', () => {
  it('responds with ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });
});
