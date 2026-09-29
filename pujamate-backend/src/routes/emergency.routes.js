// src/routes/emergency.routes.js
const express = require('express');
const { getHelplines, getNearby, createEmergencyService } = require('../controllers/emergency.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { cacheControl } = require('../middleware/cacheControl');

const router = express.Router();

router.get('/helplines', cacheControl(3600), asyncHandler(getHelplines));
router.get('/nearby', cacheControl(60), asyncHandler(getNearby));
router.post('/', requireAuth, requireRole('ADMIN'), asyncHandler(createEmergencyService));

module.exports = router;
