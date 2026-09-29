// src/routes/planner.routes.js
const express = require('express');
const { generateRoute, generateAIPlan } = require('../controllers/planner.controller');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Public: previewing a route doesn't require an account. Saving the
// result (POST /routes) does, via the existing auth-gated router.
router.post('/generate', asyncHandler(generateRoute));
router.post('/ai', asyncHandler(generateAIPlan));

module.exports = router;
