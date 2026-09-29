// src/controllers/routes.controller.js
const { query } = require('../db/pool');

/**
 * GET /routes  (current user's saved routes)
 */
async function listMyRoutes(req, res) {
  const result = await query(
    `SELECT id, title, stops, created_at FROM routes
     WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.id]
  );
  return res.json({ routes: result.rows });
}

/**
 * GET /routes/:id
 */
async function getRouteById(req, res) {
  const { id } = req.params;
  const result = await query(
    `SELECT id, title, stops, created_at FROM routes WHERE id = $1 AND user_id = $2`,
    [id, req.user.id]
  );
  const route = result.rows[0];
  if (!route) {
    return res.status(404).json({ error: 'Route not found.' });
  }
  return res.json({ route });
}

/**
 * POST /routes
 * body: { title, stops: [{ pujaId, arrivalTime, transitMode, durationMinutes }, ...] }
 */
async function createRoute(req, res) {
  const { title, stops } = req.body;

  if (!title || !Array.isArray(stops) || stops.length === 0) {
    return res.status(400).json({ error: 'title and a non-empty stops array are required.' });
  }

  const result = await query(
    `INSERT INTO routes (user_id, title, stops)
     VALUES ($1, $2, $3)
     RETURNING id, title, stops, created_at`,
    [req.user.id, title, JSON.stringify(stops)]
  );

  return res.status(201).json({ route: result.rows[0] });
}

/**
 * PUT /routes/:id
 */
async function updateRoute(req, res) {
  const { id } = req.params;
  const { title, stops } = req.body;

  const existing = await query(`SELECT id FROM routes WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
  if (existing.rowCount === 0) {
    return res.status(404).json({ error: 'Route not found.' });
  }

  const result = await query(
    `UPDATE routes SET title = COALESCE($1, title), stops = COALESCE($2, stops)
     WHERE id = $3 AND user_id = $4
     RETURNING id, title, stops, created_at`,
    [title || null, stops ? JSON.stringify(stops) : null, id, req.user.id]
  );

  return res.json({ route: result.rows[0] });
}

/**
 * DELETE /routes/:id
 */
async function deleteRoute(req, res) {
  const { id } = req.params;
  const result = await query(`DELETE FROM routes WHERE id = $1 AND user_id = $2 RETURNING id`, [id, req.user.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Route not found.' });
  }
  return res.status(204).send();
}

module.exports = { listMyRoutes, getRouteById, createRoute, updateRoute, deleteRoute };
