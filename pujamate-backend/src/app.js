// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const authRoutes = require('./routes/auth.routes');
const pujasRoutes = require('./routes/pujas.routes');
const crowdRoutes = require('./routes/crowd.routes');
const routesRoutes = require('./routes/routes.routes');
const passportRoutes = require('./routes/passport.routes');
const plannerRoutes = require('./routes/planner.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const groupsRoutes = require('./routes/groups.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const communityRoutes = require('./routes/community.routes');
const blogRoutes = require('./routes/blog.routes');
const nextRoutes = require('./routes/next.routes');
const pandalSuggestionsRoutes = require('./routes/pandalSuggestions.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : Array.from(new Set([...configuredOrigins, 'http://localhost:3000', 'http://localhost:3001']));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return callback(null, true);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: false,
}));
// gzip/brotli-negotiated compression — meaningfully shrinks JSON responses
// (pandal lists, facilities, routes) over slow mobile connections for the
// cost of a little CPU, which is the right trade-off for a read-heavy API.
app.use(compression());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/auth', authRoutes);
app.use('/pujas', pujasRoutes);
app.use('/crowd', crowdRoutes);
app.use('/routes', routesRoutes);
app.use('/passport', passportRoutes);
app.use('/planner', plannerRoutes);
app.use('/emergency', emergencyRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/groups', groupsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/community', communityRoutes);
app.use('/blogs', blogRoutes);
app.use('/next-pandal', nextRoutes);
app.use('/pandal-suggestions', pandalSuggestionsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
