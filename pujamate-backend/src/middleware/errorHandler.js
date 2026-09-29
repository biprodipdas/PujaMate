// src/middleware/errorHandler.js

/**
 * Wrap async route handlers so thrown errors are forwarded to next()
 * instead of crashing the process. Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * Catch-all 404 for unmatched routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Centralized error handler. Must be registered last, after all routes.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  // Postgres unique_violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists.' });
  }
  // Postgres foreign_key_violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Related resource does not exist.' });
  }
  // Postgres check_violation
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Invalid value for one or more fields.' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error.' : err.message;
  res.status(status).json({ error: message });
}

module.exports = { asyncHandler, notFoundHandler, errorHandler };
