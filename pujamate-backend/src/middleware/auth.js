// src/middleware/auth.js
const { verifyToken } = require('../utils/jwt');

/**
 * Requires a valid Bearer JWT. Attaches decoded payload to req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Optional auth: attaches req.user if a valid token is present,
 * but does not block the request if absent/invalid.
 * Useful for endpoints like GET /pujas that behave slightly
 * differently for logged-in users (e.g. showing "visited" flags).
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      req.user = verifyToken(token);
    } catch (err) {
      // silently ignore invalid token for optional auth
    }
  }
  return next();
}

/**
 * Restricts access to specific roles. Use after requireAuth.
 * Example: requireRole('ADMIN')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    return next();
  };
}

module.exports = { requireAuth, optionalAuth, requireRole };
